import os
import json
import shutil
import threading
import zipfile
import hashlib
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageOps

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB
CORS(app)

SUPPORTED_EXT = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'}
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
SESSION_FILE = os.path.join(BASE_DIR, 'session.json')
EXPORT_FOLDER = os.path.join(BASE_DIR, 'exports')
THUMB_CACHE = os.path.join(BASE_DIR, 'thumb_cache')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(EXPORT_FOLDER, exist_ok=True)
os.makedirs(THUMB_CACHE, exist_ok=True)

session = {
    'folder_path': '',
    'folder_name': '',
    'all_images': [],
    'actions': [],
    'categories': {'keep': [], 'reject': [], 'favorites': []},
    'export_token': '',
}


def get_image_files(folder_path):
    images = []
    for f in sorted(os.listdir(folder_path)):
        ext = Path(f).suffix.lower()
        if ext in SUPPORTED_EXT:
            if os.path.isfile(os.path.join(folder_path, f)):
                images.append(f)
    return images


def thumb_cache_path(image_path):
    h = hashlib.md5(image_path.encode()).hexdigest()
    return os.path.join(THUMB_CACHE, h + '.thumb')


def generate_thumbnail(image_path, size=(150, 150)):
    try:
        img = Image.open(image_path)
        img = ImageOps.exif_transpose(img)
        img.thumbnail(size, Image.LANCZOS)
        thumb_path = thumb_cache_path(image_path)
        img.save(thumb_path, 'JPEG', quality=60)
        return thumb_path
    except Exception:
        return image_path


def generate_thumbnails_async(folder_path, images):
    def _gen():
        for img in images:
            full_path = os.path.join(folder_path, img)
            cache = thumb_cache_path(full_path)
            if not os.path.exists(cache):
                generate_thumbnail(full_path)
    thread = threading.Thread(target=_gen, daemon=True)
    thread.start()


def get_stats():
    total = len(session['all_images'])
    keep = len(session['categories']['keep'])
    reject = len(session['categories']['reject'])
    favorites = len(session['categories']['favorites'])
    categorized = set()
    for f in session['categories']['keep']:
        categorized.add(f)
    for f in session['categories']['reject']:
        categorized.add(f)
    for f in session['categories']['favorites']:
        categorized.add(f)
    return {
        'total': total,
        'keep': keep,
        'reject': reject,
        'favorites': favorites,
        'remaining': total - len(categorized),
    }


# ─── Load / Upload ────────────────────────────────────────────────────


@app.route('/api/load-folder', methods=['POST'])
def load_folder():
    data = request.json
    folder_path = data.get('path', '').strip()

    if not folder_path or not os.path.isdir(folder_path):
        return jsonify({'error': 'Invalid folder path'}), 400

    images = get_image_files(folder_path)
    if not images:
        return jsonify({'error': 'No supported images found'}), 400

    session['folder_path'] = folder_path
    session['folder_name'] = os.path.basename(folder_path)
    session['all_images'] = images
    session['categories'] = {'keep': [], 'reject': [], 'favorites': []}
    session['actions'] = []

    generate_thumbnails_async(folder_path, images)

    return jsonify({
        'folder_name': session['folder_name'],
        'total': len(images),
        'images': images,
    })


@app.route('/api/upload', methods=['POST'])
def upload_photos():
    if 'files' not in request.files:
        return jsonify({'error': 'No files provided'}), 400

    files = request.files.getlist('files')
    uploaded = []
    errors = []

    for f in files:
        if f.filename == '':
            continue
        ext = Path(f.filename).suffix.lower()
        if ext not in SUPPORTED_EXT:
            errors.append(f"{f.filename}: unsupported format")
            continue
        safe_name = f.filename
        save_path = os.path.join(UPLOAD_FOLDER, safe_name)
        counter = 1
        while os.path.exists(save_path):
            name, ext = os.path.splitext(safe_name)
            safe_name = f"{name}_{counter}{ext}"
            save_path = os.path.join(UPLOAD_FOLDER, safe_name)
            counter += 1
        try:
            f.save(save_path)
            uploaded.append(safe_name)
        except Exception as e:
            errors.append(f"{f.filename}: {str(e)}")

    return jsonify({
        'uploaded': uploaded,
        'errors': errors,
        'message': f'Uploaded {len(uploaded)} photos',
    })


@app.route('/api/uploaded-images', methods=['GET'])
def get_uploaded_images():
    images = get_image_files(UPLOAD_FOLDER)
    session['folder_path'] = UPLOAD_FOLDER
    session['folder_name'] = 'Uploads'
    session['all_images'] = images
    session['categories'] = {'keep': [], 'reject': [], 'favorites': []}
    session['actions'] = []
    generate_thumbnails_async(UPLOAD_FOLDER, images)
    return jsonify({
        'folder_path': UPLOAD_FOLDER,
        'folder_name': 'Uploads',
        'total': len(images),
        'images': images,
    })


# ─── Image serving ───────────────────────────────────────────────────


@app.route('/api/image/<path:filename>')
def serve_image(filename):
    folder = session['folder_path']
    if not folder:
        return jsonify({'error': 'No folder loaded'}), 400
    file_path = os.path.join(folder, filename)
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path)


@app.route('/api/thumbnail/<path:filename>')
def serve_thumbnail(filename):
    folder = session['folder_path']
    if not folder:
        return jsonify({'error': 'No folder loaded'}), 400
    full_path = os.path.join(folder, filename)
    cache = thumb_cache_path(full_path)
    if os.path.exists(cache):
        return send_file(cache)
    if os.path.exists(full_path):
        thumb_path = generate_thumbnail(full_path)
        if os.path.exists(thumb_path):
            return send_file(thumb_path)
        return send_file(full_path)
    return jsonify({'error': 'File not found'}), 404


# ─── Actions ──────────────────────────────────────────────────────────


@app.route('/api/action', methods=['POST'])
def perform_action():
    data = request.json
    filename = data.get('filename', '')
    action = data.get('action', '')

    if not filename or action not in ('keep', 'reject', 'favorite'):
        return jsonify({'error': 'Invalid action'}), 400

    if filename not in session['all_images']:
        return jsonify({'error': 'Image not found'}), 404

    cat_map = {'keep': 'keep', 'reject': 'reject', 'favorite': 'favorites'}
    cat = cat_map[action]

    for c in ['keep', 'reject', 'favorites']:
        if filename in session['categories'][c]:
            session['categories'][c].remove(filename)

    if filename not in session['categories'][cat]:
        session['categories'][cat].append(filename)

    session['actions'].append({'filename': filename, 'action': action})
    return jsonify(get_stats())


@app.route('/api/undo', methods=['POST'])
def undo_action():
    if not session['actions']:
        return jsonify({'error': 'Nothing to undo'}), 400

    last = session['actions'].pop()
    filename = last['filename']
    action = last['action']

    cat_map = {'keep': 'keep', 'reject': 'reject', 'favorite': 'favorites'}
    cat = cat_map[action]

    if filename in session['categories'][cat]:
        session['categories'][cat].remove(filename)

    return jsonify({'undone': last, 'stats': get_stats()})


# ─── Stats ────────────────────────────────────────────────────────────


@app.route('/api/stats', methods=['GET'])
def stats():
    return jsonify(get_stats())


# ─── Export ───────────────────────────────────────────────────────────


@app.route('/api/export', methods=['POST'])
def export_photos():
    folder_path = session['folder_path']
    if not folder_path:
        return jsonify({'error': 'No folder loaded'}), 400

    export_dir = os.path.join(EXPORT_FOLDER, 'export')
    os.makedirs(export_dir, exist_ok=True)

    moved = {'keep': 0, 'reject': 0, 'favorites': 0}
    errors = []

    for cat, subdir in [('keep', 'Keep'), ('reject', 'Reject'), ('favorites', 'Favorites')]:
        cat_dir = os.path.join(export_dir, subdir)
        os.makedirs(cat_dir, exist_ok=True)
        for filename in session['categories'][cat]:
            src = os.path.join(folder_path, filename)
            dst = os.path.join(cat_dir, filename)
            if os.path.exists(src):
                try:
                    shutil.copy2(src, dst)
                    moved[cat] += 1
                except Exception as e:
                    errors.append(f"{filename}: {str(e)}")

    # Create ZIP
    zip_path = os.path.join(EXPORT_FOLDER, 'photosathi-export.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for subdir in ['Keep', 'Reject', 'Favorites']:
            dir_path = os.path.join(export_dir, subdir)
            if os.path.exists(dir_path):
                for f in os.listdir(dir_path):
                    file_path = os.path.join(dir_path, f)
                    if os.path.isfile(file_path):
                        zf.write(file_path, os.path.join(subdir, f))

    # Clean up temp dir
    shutil.rmtree(export_dir, ignore_errors=True)

    return jsonify({
        'moved': moved,
        'errors': errors,
        'message': 'Export completed successfully',
        'download_url': '/api/export/download',
    })


@app.route('/api/export/download', methods=['GET'])
def download_export():
    zip_path = os.path.join(EXPORT_FOLDER, 'photosathi-export.zip')
    if not os.path.exists(zip_path):
        return jsonify({'error': 'No export available'}), 404
    return send_file(zip_path, as_attachment=True, download_name='photosathi-export.zip')


@app.route('/api/export-to-folder', methods=['POST'])
def export_to_folder():
    folder_path = session['folder_path']
    if not folder_path:
        return jsonify({'error': 'No folder loaded'}), 400

    data = request.json
    dest = (data.get('destination') or '').strip()
    if not dest:
        return jsonify({'error': 'Destination path required'}), 400

    try:
        os.makedirs(dest, exist_ok=True)
    except Exception as e:
        return jsonify({'error': f'Cannot create destination: {str(e)}'}), 400

    moved = {'keep': 0, 'reject': 0, 'favorites': 0}
    errors = []

    for cat, subdir in [('keep', 'Keep'), ('reject', 'Reject'), ('favorites', 'Favorites')]:
        cat_dir = os.path.join(dest, subdir)
        try:
            os.makedirs(cat_dir, exist_ok=True)
        except Exception as e:
            errors.append(f"{subdir}: {str(e)}")
            continue
        for filename in session['categories'][cat]:
            src = os.path.join(folder_path, filename)
            dst = os.path.join(cat_dir, filename)
            if os.path.exists(src):
                try:
                    shutil.copy2(src, dst)
                    moved[cat] += 1
                except Exception as e:
                    errors.append(f"{filename}: {str(e)}")

    total = sum(moved.values())
    return jsonify({
        'moved': moved,
        'total': total,
        'errors': errors,
        'message': f'Exported {total} photos to {dest}',
        'destination': dest,
    })


# ─── Folder Resolution ──────────────────────────────────────────────


def _get_drives():
    drives = []
    for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
        drive = f'{letter}:\\'
        if os.path.exists(drive):
            drives.append(drive)
    return drives


@app.route('/api/resolve-folder', methods=['POST'])
def resolve_folder():
    data = request.json
    folder_name = (data.get('name') or '').strip()
    if not folder_name:
        return jsonify({'error': 'Folder name required'}), 400

    candidates = []

    for drive in _get_drives():
        root_path = os.path.join(drive, folder_name)
        if os.path.isdir(root_path):
            candidates.append(root_path)

    if not candidates:
        for drive in _get_drives():
            try:
                for entry in os.listdir(drive):
                    full = os.path.join(drive, entry)
                    if os.path.isdir(full):
                        nested = os.path.join(full, folder_name)
                        if os.path.isdir(nested):
                            candidates.append(nested)
            except PermissionError:
                continue

    return jsonify({
        'found': len(candidates) > 0,
        'matches': candidates,
    })


# ─── Session Persistence ─────────────────────────────────────────────


@app.route('/api/session', methods=['GET'])
def get_session():
    if not os.path.exists(SESSION_FILE):
        return jsonify({'has_session': False})
    try:
        with open(SESSION_FILE, 'r') as f:
            data = json.load(f)
        if data.get('folder_path') and data.get('actions'):
            data['has_session'] = True
            return jsonify(data)
    except Exception:
        pass
    return jsonify({'has_session': False})


@app.route('/api/session', methods=['POST'])
def save_session():
    data = request.json
    try:
        with open(SESSION_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return jsonify({'saved': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── Main ─────────────────────────────────────────────────────────────


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

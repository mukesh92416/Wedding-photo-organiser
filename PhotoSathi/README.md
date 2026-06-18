# PhotoSathi AI 📸

A free AI-powered alternative to Adobe Lightroom, designed for wedding photo organization.

Organize thousands of wedding photos in minutes using keyboard shortcuts.

## Features

-   **Lightroom-style interface** — Keep, Reject, Favorite with keyboard shortcuts
-   **Keyboard shortcuts** — Arrow keys, D, A, W, S (like Lightroom)
-   **Drag & drop upload** — Upload directly from your browser
-   **Export as ZIP** — Download organized photos grouped into Keep/Reject/Favorites
-   **Session persistence** — Auto-saves every 10 seconds, resume if browser closes
-   **Thumbnail filmstrip** — Quick navigation through all photos
-   **Animated statistics** — Real-time counter animations
-   **10,000+ photo support** — Lazy-loaded thumbnails, efficient memory management

## Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend  | Python Flask, Pillow               |
| Storage  | Local filesystem + JSON session     |

## Getting Started

### Prerequisites

-   Node.js 18+
-   Python 3.10+
-   pip

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

Open `http://localhost:5173` in your browser.

## Deployment

### Frontend (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1.  Connect your repo
2.  Set framework to Vite
3.  Add environment variable `VITE_API_URL` pointing to your Render backend

### Backend (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1.  Use `backend/render.yaml` blueprint
2.  Or create a Web Service:
    -   Build command: `pip install -r requirements.txt`
    -   Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`

## Keyboard Shortcuts

| Key             | Action   |
| --------------- | -------- |
| → or D          | Keep     |
| ← or A          | Reject   |
| ↑ or W          | Favorite |
| ↓ or S          | Skip     |
| Ctrl+Z          | Undo     |
| F               | Fullscreen |
| + / =           | Zoom in  |
| -               | Zoom out |
| Space           | Hide UI  |

## Project Structure

```
PhotoSathi/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   ├── render.yaml         # Render deployment config
│   ├── uploads/            # Uploaded photos (gitignored)
│   └── exports/            # Generated ZIP files (gitignored)
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx         # Main application
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── vercel.json             # Vercel deployment config
└── README.md
```

## License

MIT

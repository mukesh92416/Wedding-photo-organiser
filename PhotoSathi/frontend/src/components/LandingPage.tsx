import { useRef, useCallback, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

interface Props {
  onStart: (files: File[], folderName: string) => void
}

const easeOutQuint: [number,number,number,number] = [.16,1,.3,1]

function useCount(end: number, duration = 2) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const elapsed = (ts - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, end, duration])
  return { ref, count, inView }
}

function StatCard({ num, label, suffix = '' }: { num: number; label: string; suffix?: string }) {
  const { ref, count } = useCount(num)
  return (
    <motion.div
      ref={ref}
      className="stat-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .6, ease: easeOutQuint }}
    >
      <div className="num">{count.toLocaleString()}{suffix}</div>
      <div className="lbl">{label}</div>
    </motion.div>
  )
}

function WorkflowStep({ num, icon, title, desc, index }: { num: number; icon: string; title: string; desc: string; index: number }) {
  return (
    <motion.div
      className="workflow-step"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: .6, delay: index * .15, ease: easeOutQuint }}
    >
      <div className="step-num">{num}</div>
      <div className="step-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </motion.div>
  )
}

function FAQItem({ question, answer, open, onToggle }: { question: string; answer: string; open: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button onClick={onToggle} className="faq-question">
        {question}
        <motion.span className="arrow" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: .3, ease: easeOutQuint }}>▼</motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="faq-answer" initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: .3, ease: easeOutQuint }}>
            <div className="faq-answer-inner">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Start Modal ── */
function StartModal({ onClose, onFolderPick }: { onClose: () => void; onFolderPick: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(12px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content !max-w-sm text-center"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: .95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .95, y: 20 }}
        transition={{ duration: .35, ease: easeOutQuint }}
      >
        <div className="text-3xl mb-4">📸</div>
        <h2 className="text-lg font-semibold mb-2">Open your photos</h2>
        <p className="text-sm text-gray-500 mb-6">Select a folder of wedding photos to get started. Everything stays on your device.</p>
        <motion.button
          onClick={() => { onFolderPick() }}
          className="btn-primary w-full py-3 text-sm font-medium rounded-xl"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: .97 }}
        >
          📁 Select a folder
        </motion.button>
        <button onClick={onClose} className="text-xs text-gray-600 hover:text-gray-400 mt-5 transition-colors">Cancel</button>
      </motion.div>
    </motion.div>
  )
}
const stagger = {
  visible: { transition: { staggerChildren: .08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: .5, ease: easeOutQuint } },
}

const testimonials = [
  { initials: 'AP', name: 'Anika Patel', role: 'Wedding Photographer', quote: 'PhotoSathi saved me hours of sorting through thousands of wedding photos. The keyboard shortcuts are just like Lightroom!', stars: 5 },
  { initials: 'RJ', name: 'Raj Joshi', role: 'Photo Editor', quote: 'Finally, a free tool that does what Lightroom does for sorting. The auto-save feature is a lifesaver.', stars: 5 },
  { initials: 'SK', name: 'Sunita Kapoor', role: 'Event Organizer', quote: 'My family used it to organize our wedding album. So intuitive my 60-year-old mom could use it!', stars: 5 },
]

const faqs = [
  { q: 'How many photos can it handle?', a: 'PhotoSathi can handle thousands of photos in a single session. The app is designed to work with large wedding photo collections without any lag. Performance depends on your device and browser.' },
  { q: 'Are my photos uploaded to the cloud?', a: 'No. All processing happens locally on your machine. Photos are never uploaded to any server. Your privacy is our top priority.' },
  { q: 'Can I export ZIP files?', a: 'Yes! When you\'re done organizing, you can export all photos into a ZIP file organized into Keep, Reject, and Favorites folders. Perfect for sharing with clients and family.' },
  { q: 'Is everything private?', a: 'Absolutely. PhotoSathi runs entirely in your browser. No account needed, no data leaves your computer, and no tracking. Close the tab and everything is gone.' },
]

export default function LandingPage({ onStart }: Props) {
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [showStartModal, setShowStartModal] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.body.style.overflowX = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleFolderPick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setShowStartModal(false)
    const files = e.target.files
    if (!files?.length) return
    const valid = Array.from(files).filter(f => {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.webp'].includes(ext)
    })
    if (!valid.length) {
      setError('No supported image files found')
      if (folderInputRef.current) folderInputRef.current.value = ''
      return
    }
    const folderName = valid[0].webkitRelativePath?.split('/')[0] || 'Photos'
    onStart(valid, folderName)
    if (folderInputRef.current) folderInputRef.current.value = ''
  }, [onStart])

  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    size: 1 + Math.random() * 2,
  }))

  return (
    <div className="min-h-screen bg-[#0B0B0B] relative" style={{ overflowY: 'auto', overflowX: 'hidden' }}>

      {/* Navbar */}
      <motion.nav className="navbar" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: .4, ease: easeOutQuint }}>
        <div className="container-saas flex items-center justify-between h-16">
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.02 }}>
            <span className="text-xl">📸</span>
            <span className="font-bold text-base">Photo<span className="text-[#3B82F6]">Sathi</span></span>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowStartModal(true)}
              className="px-5 py-2 text-sm font-medium rounded-xl bg-[#3B82F6] text-black hover:bg-[#3B82F6]/90 transition-all duration-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: .96 }}
            >
              Get started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      <input ref={folderInputRef} type="file" webkitdirectory="" directory="" multiple onChange={handleFolderPick} className="hidden" />

      {/* Start modal */}
      <AnimatePresence>
        {showStartModal && (
          <StartModal
            onClose={() => setShowStartModal(false)}
            onFolderPick={() => folderInputRef.current?.click()}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="hero-radial" />
        <div className="hero-stars">
          {stars.map(s => (
            <motion.div
              key={s.id}
              className="hero-star"
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
              animate={{ opacity: [.15, 1, .15], scale: [.5, 1.2, .5] }}
              transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="container-saas flex flex-col items-center justify-center text-center relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[.04] border border-white/[.06] text-xs text-gray-500 mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .2, ease: easeOutQuint }}
          >
            🎉 Free AI-powered photo organizer
          </motion.div>

          <motion.h1
            className="hero-title mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .6, delay: .35, ease: easeOutQuint }}
          >
            PhotoSathi AI
          </motion.h1>

          <motion.p
            className="hero-sub mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .5, ease: easeOutQuint }}
          >
            Organize thousands of wedding photos in minutes.
            <br />
            A free AI-powered alternative to Adobe Lightroom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .65, ease: easeOutQuint }}
          >
            <motion.button
              onClick={() => setShowStartModal(true)}
              className="btn-primary-saas"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: .97 }}
            >
              Start Organizing
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </motion.button>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mt-4 px-4 py-2 rounded-xl bg-red/5 border border-red/20 text-sm text-red"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                ❌ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="mt-12 flex items-center gap-8 text-xs text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .5, delay: .85 }}>
            <span>⚡ No login required</span>
            <span>🔒 Private & local</span>
            <span>📦 ZIP export</span>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container-saas pb-24 relative z-10">
        <motion.div
          className="dashboard-mockup"
          initial={{ opacity: 0, y: 40, scale: .97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: .7, ease: easeOutQuint }}
        >
          <div className="dashboard-reflection" />
          <div className="dashboard-mockup-grid">
            <div className="dm-side">
              <div className="dm-side-inner">
                <div className="dm-side-item active"><span>🖼️</span><span>All Photos</span></div>
                <div className="dm-side-item"><span>❤️</span><span>Keep</span></div>
                <div className="dm-side-item"><span>❌</span><span>Rejected</span></div>
                <div className="dm-side-item"><span>⭐</span><span>Favorites</span></div>
                <div className="dm-side-item"><span>📋</span><span>Remaining</span></div>
              </div>
            </div>
            <div className="dm-top">
              <div className="dm-progress">
                <span style={{ color: '#aaa', fontSize: '.6875rem', fontWeight: 600 }}>12</span>
                <span style={{ color: '#555', fontSize: '.6875rem' }}>/ 248</span>
                <div className="dm-progress-track"><div className="dm-progress-fill" /></div>
                <span style={{ color: '#555', fontSize: '.625rem' }}>5%</span>
              </div>
            </div>
            <div className="dm-view">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160' viewBox='0 0 120 160'%3E%3Crect width='120' height='160' fill='%23222' rx='8'/%3E%3Ccircle cx='60' cy='65' r='30' fill='%23333'/%3E%3Crect x='25' y='105' width='70' height='8' rx='4' fill='%232a2a2a'/%3E%3Crect x='35' y='118' width='50' height='6' rx='3' fill='%23252525'/%3E%3C/svg%3E"
                alt=""
              />
            </div>
            <div className="dm-stats">
              <div className="dm-stat-item active"><span>Total</span><span className="num">248</span></div>
              <div className="dm-stat-item"><span>❤️ Keep</span><span className="num">12</span></div>
              <div className="dm-stat-item"><span>❌ Reject</span><span className="num">3</span></div>
              <div className="dm-stat-item"><span>⭐ Fav</span><span className="num">8</span></div>
              <div className="dm-stat-item"><span>📋 Remaining</span><span className="num">236</span></div>
            </div>
            <div className="dm-ctrl">
              <div className="dm-btn green" />
              <div className="dm-btn red" />
              <div className="dm-btn yellow" />
            </div>
            <div className="dm-film">
              {[...Array(6)].map((_, i) => (<div key={i} className={`dm-film-thumb ${i === 0 ? 'active' : ''}`} />))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5, ease: easeOutQuint }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything you need</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">A complete photo sorting workflow inspired by Adobe Lightroom.</p>
        </motion.div>

        <motion.div className="feature-grid-saas" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>
          {[
            { icon: '❤️', title: 'Keep or Reject', desc: 'Rate photos instantly with keyboard shortcuts. Just like Lightroom, press D to keep, A to reject.' },
            { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'Arrow keys, D, A, W, S – all the shortcuts you know from Adobe Lightroom work here.' },
            { icon: '↩️', title: 'Undo Everything', desc: 'Made a mistake? Ctrl+Z undoes your last action instantly. No permanent decisions.' },
            { icon: '💾', title: 'Auto-Save', desc: 'Your progress is saved every 10 seconds. Close the browser and resume right where you left off.' },
            { icon: '📤', title: 'Export as ZIP', desc: 'Download organized photos grouped into Keep, Reject, and Favorites folders.' },
            { icon: '📱', title: 'Works Everywhere', desc: 'Responsive design works on desktop, tablet, and phone.' },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card-saas"
              variants={fadeUp}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
                e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
              }}
            >
              <div className="icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Statistics */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for scale</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Handles massive wedding albums with ease.</p>
        </motion.div>
        <div className="stats-grid">
          <StatCard num={10000} suffix="+" label="Photos supported" />
          <StatCard num={1} suffix=" sec" label="Navigation speed" />
          <StatCard num={100} suffix="%" label="Private and local" />
          <StatCard num={1} suffix=" click" label="ZIP export" />
        </div>
      </section>

      {/* Workflow */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Four simple steps to organize your entire wedding album.</p>
        </motion.div>
        <div className="workflow-steps">
          <div className="workflow-connector" />
          <WorkflowStep num={1} icon="📤" title="Upload Photos" desc="Select a folder of wedding photos. All major formats supported." index={0} />
          <WorkflowStep num={2} icon="👁️" title="Review Images" desc="Browse through your photos with keyboard shortcuts. Arrow keys navigate instantly." index={1} />
          <WorkflowStep num={3} icon="❤️" title="Keep or Reject" desc="Press D for keep, A for reject, W for favorite. Just like Adobe Lightroom." index={2} />
          <WorkflowStep num={4} icon="📦" title="Export Album" desc="Export a ZIP file with organized folders: Keep, Reject, and Favorites." index={3} />
        </div>
      </section>

      {/* Comparison */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Why PhotoSathi?</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">See the difference traditional sorting vs. PhotoSathi AI.</p>
        </motion.div>
        <div className="comparison-grid">
          <motion.div className="comparison-card old" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .5, ease: easeOutQuint }}>
            <h3>❌ Traditional Method</h3>
            <ul>
              <li><span className="cross">❌</span> Manual sorting folder by folder</li>
              <li><span className="cross">❌</span> Slow and repetitive clicking</li>
              <li><span className="cross">❌</span> Confusing file management</li>
              <li><span className="cross">❌</span> No undo capability</li>
              <li><span className="cross">❌</span> Manual backups required</li>
            </ul>
          </motion.div>
          <motion.div className="comparison-card new" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .5, delay: .15, ease: easeOutQuint }}>
            <h3>✅ PhotoSathi AI</h3>
            <ul>
              <li><span className="check">✅</span> Keyboard shortcuts (D, A, W, S)</li>
              <li><span className="check">✅</span> Lightning fast navigation</li>
              <li><span className="check">✅</span> Auto-save every 10 seconds</li>
              <li><span className="check">✅</span> Ctrl+Z undo any action</li>
              <li><span className="check">✅</span> One-click ZIP export</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Loved by photographers</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">From wedding photographers to event organizers.</p>
        </motion.div>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: .5, delay: i * .12, ease: easeOutQuint }}
              whileHover={{ y: -6, transition: { duration: .3 } }}
            >
              <div className="stars">{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</div>
              <div className="quote">"{t.quote}"</div>
              <div className="author">
                <div className="avatar">{t.initials}</div>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-saas section-padding relative z-10">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Frequently asked questions</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Everything you need to know about PhotoSathi.</p>
        </motion.div>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .4, delay: i * .1 }}>
              <FAQItem question={faq.q} answer={faq.a} open={faqOpen === i} onToggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-saas pb-24 relative z-10">
        <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to organize?</h2>
          <p className="text-gray-500 text-sm md:text-base mb-8 max-w-md mx-auto">No sign-up required. Just pick a folder and go.</p>
          <motion.button
            onClick={() => setShowStartModal(true)}
            className="btn-primary-saas"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: .97 }}
          >
            Start Organizing
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container-saas">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="flex items-center gap-2"><span className="text-xl">📸</span><span className="font-bold text-base">Photo<span className="text-[#3B82F6]">Sathi</span></span></div>
              <p>A free AI-powered wedding photo organizer. Sort, rate, and export thousands of photos in minutes.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">How it works</a>
              <a href="#">FAQ</a>
              <a href="#">GitHub</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Documentation</a>
              <a href="#">Report Bug</a>
              <a href="#">Feature Request</a>
              <a href="#">Community</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 PhotoSathi AI. All rights reserved.</p>
            <p className="tech">Made with React + Flask &bull; JPG, PNG, WebP, BMP, TIFF</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

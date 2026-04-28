import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

/* ─── helpers ──────────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div className="absolute rounded-full blur-3xl pointer-events-none" style={style} />
)

function TiltCard({ children, className, style }) {
  const ref = useRef(null)
  const [t, setT] = useState({ x: 0, y: 0 })
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) / r.width
    const y = (e.clientY - r.top - r.height / 2) / r.height
    setT({ x: y * 14, y: x * -14 })
  }
  const leave = () => setT({ x: 0, y: 0 })
  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={className}
      style={{
        ...style,
        transform: `perspective(1000px) rotateX(${t.x}deg) rotateY(${t.y}deg)`,
        transition: 'transform 0.12s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.65, delay },
})

/* ─── data ──────────────────────────────────────────────────── */
const MODES = [
  {
    icon: '⚡',
    name: 'Auto Remove',
    desc: 'BiRefNet detects every edge and strips the background instantly — zero input needed.',
    gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    glow: 'rgba(124,58,237,0.25)',
  },
  {
    icon: '🎯',
    name: 'Click to Keep',
    desc: 'Tap on the subject you want to keep. SAM2 surgically removes the rest.',
    gradient: 'linear-gradient(135deg,#0ea5e9,#06b6d4)',
    glow: 'rgba(14,165,233,0.2)',
  },
  {
    icon: '✂️',
    name: 'Click to Remove',
    desc: 'Click any object — logos, text, distractions — and erase it with one tap.',
    gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)',
    glow: 'rgba(236,72,153,0.2)',
  },
]

const STEPS = [
  { n: '01', title: 'Upload', desc: 'Drag & drop any JPG, PNG, or WEBP up to 20 MB.' },
  { n: '02', title: 'Choose Mode', desc: 'Auto remove, click to keep, or click to remove.' },
  { n: '03', title: 'Download PNG', desc: 'Get a crisp transparent PNG instantly, no watermark.' },
]

const STATS = [
  ['100%', 'Free forever'],
  ['3', 'AI modes'],
  ['1 hr', 'Auto file delete'],
  ['0', 'Signups needed'],
]

/* ─── component ─────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden" style={{ background: '#09090f' }}>
      <Navbar />

      {/* ══ BACKGROUND ORBS ══════════════════════════════════════ */}
      <Orb style={{ width: 560, height: 560, top: -120, left: -180, background: 'radial-gradient(circle,rgba(124,58,237,0.35),transparent 70%)', animation: 'orb-drift 11s ease-in-out infinite' }} />
      <Orb style={{ width: 420, height: 420, top: 80, right: -100, background: 'radial-gradient(circle,rgba(37,99,235,0.25),transparent 70%)', animation: 'orb-drift-2 14s ease-in-out infinite' }} />
      <Orb style={{ width: 300, height: 300, top: '55%', left: '45%', background: 'radial-gradient(circle,rgba(236,72,153,0.18),transparent 70%)', animation: 'orb-drift 9s ease-in-out infinite reverse' }} />

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-28 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 mb-7"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Powered by BiRefNet &amp; SAM2
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight mb-6"
            >
              Remove Any<br />
              <span className="gradient-text">Background</span><br />
              <span style={{ color: 'rgba(255,255,255,0.88)' }}>Instantly. Free.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="text-lg leading-relaxed mb-9 max-w-md"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              Professional background removal in three powerful modes.
              No signup, no watermarks, no cost — ever.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.26 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link
                to="/tool"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base transition-all hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
                }}
              >
                Remove Background Free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
                No account required
              </p>
            </motion.div>

            {/* Stats strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-4 gap-4 mt-12 pt-10 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              {STATS.map(([val, lbl]) => (
                <div key={lbl}>
                  <div className="text-xl font-black gradient-text">{val}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{lbl}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — 3D app mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            {/* Ambient glow */}
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-110"
              style={{ background: 'radial-gradient(ellipse,rgba(124,58,237,0.22),transparent 70%)' }} />

            <TiltCard className="relative">
              {/* Browser chrome */}
              <div
                className="rounded-3xl overflow-hidden border"
                style={{
                  background: 'rgba(13,13,22,0.92)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 48px 96px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
              >
                {/* Title bar */}
                <div className="flex items-center gap-2 px-5 py-3.5"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex gap-1.5">
                    {['#ef4444','#f59e0b','#22c55e'].map((c) => (
                      <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.8 }} />
                    ))}
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-5 py-1 rounded-md text-xs text-white/30"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      bgremover.app/tool
                    </div>
                  </div>
                </div>

                {/* App body */}
                <div className="p-6 space-y-5">
                  {/* Upload zone */}
                  <div className="rounded-2xl p-8 text-center border-2 border-dashed"
                    style={{ borderColor: 'rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.06)' }}>
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', transform: 'perspective(300px) rotateX(12deg)' }}>
                      <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-white/60 text-sm font-semibold">Drop your image here</p>
                    <p className="text-white/25 text-xs mt-1">JPG · PNG · WEBP</p>
                  </div>

                  {/* Mode pills */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { icon: '⚡', label: 'Auto', active: true, grad: 'rgba(124,58,237,0.35)', border: 'rgba(124,58,237,0.5)' },
                      { icon: '🎯', label: 'Keep', active: false, grad: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)' },
                      { icon: '✂️', label: 'Remove', active: false, grad: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.07)' },
                    ].map(({ icon, label, active, grad, border }) => (
                      <div key={label} className="rounded-xl p-3 text-center"
                        style={{ background: grad, border: `1px solid ${border}` }}>
                        <div className="text-lg mb-1">{icon}</div>
                        <div className={`text-xs font-semibold ${active ? 'text-white' : 'text-white/35'}`}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA button */}
                  <div className="rounded-2xl py-3.5 text-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
                    Remove Background →
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-5 -right-6 glass rounded-2xl px-4 py-3 shadow-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm">✓</div>
                  <div>
                    <div className="text-white text-xs font-bold">Done in 0.8s</div>
                    <div className="text-white/35 text-xs">BiRefNet · PNG ready</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -top-5 -left-6 glass rounded-2xl px-4 py-3 shadow-2xl"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: 'rgba(124,58,237,0.25)' }}>⚡</div>
                  <div>
                    <div className="text-white text-xs font-bold">3 Modes</div>
                    <div className="text-white/35 text-xs">Auto · Keep · Remove</div>
                  </div>
                </div>
              </motion.div>
            </TiltCard>
          </motion.div>
        </div>
      </section>

      {/* ══ MODES ══════════════════════════════════════════════ */}
      <section className="py-28 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Three ways to remove</p>
            <h2 className="text-4xl xl:text-5xl font-black mb-5">
              Pick your <span className="gradient-text-warm">power</span>
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Whether you need full auto or pixel-perfect control, we have the right mode for your image.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MODES.map((m, i) => (
              <motion.div
                key={m.name}
                {...fadeUp(i * 0.12)}
                className="group relative p-8 rounded-3xl border cursor-default overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)' }}
                whileHover={{
                  y: -6,
                  boxShadow: `0 32px 64px ${m.glow}`,
                  borderColor: 'rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.045)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-7 transition-transform group-hover:scale-110"
                  style={{
                    background: m.gradient,
                    boxShadow: `0 10px 30px ${m.glow}`,
                    transform: 'perspective(300px) rotateX(10deg)',
                  }}
                >
                  {m.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{m.name}</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{m.desc}</p>

                {/* Gradient edge glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 30% 0%, ${m.glow}, transparent 60%)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-3">Simple process</p>
            <h2 className="text-4xl xl:text-5xl font-black">How it works</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connector */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)' }} />

            {STEPS.map((s, i) => (
              <motion.div key={s.n} {...fadeUp(i * 0.15)} className="text-center relative">
                <div
                  className="w-24 h-24 rounded-3xl mx-auto mb-7 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg,rgba(124,58,237,0.2),rgba(79,70,229,0.1))',
                    border: '1px solid rgba(124,58,237,0.28)',
                    transform: 'perspective(400px) rotateX(8deg)',
                    boxShadow: '0 16px 40px rgba(124,58,237,0.18)',
                  }}
                >
                  <span className="text-3xl font-black gradient-text">{s.n}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.47)' }} className="leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ═════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            {...fadeUp()}
            className="relative rounded-3xl p-14 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(145deg,rgba(124,58,237,0.14),rgba(79,70,229,0.08))',
              border: '1px solid rgba(124,58,237,0.24)',
            }}
          >
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%,rgba(124,58,237,0.12),transparent 60%)' }} />
            <div className="relative">
              <h2 className="text-4xl font-black mb-4">Ready to get started?</h2>
              <p className="text-lg mb-9" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Free, instant, no account. Remove your first background now.
              </p>
              <Link
                to="/tool"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl font-bold text-lg transition-all hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                  boxShadow: '0 8px 40px rgba(124,58,237,0.45)',
                }}
              >
                Remove Background Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════ */}
      <footer className="py-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>B</div>
            <span className="font-bold">BGRemover</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Free forever · No signup · No watermarks
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Files auto-deleted after 1 hour
          </p>
        </div>
      </footer>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import DropZone from '../components/DropZone'
import ModeSelector from '../components/ModeSelector'
import ClickCanvas from '../components/ClickCanvas'
import BeforeAfterSlider from '../components/BeforeAfterSlider'

/* ─── helpers ──────────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div className="absolute rounded-full blur-3xl pointer-events-none" style={style} />
)

const STEP_LABELS = ['Upload', 'Choose Mode', 'Process', 'Result']

async function poll(jobId) {
  for (;;) {
    const res = await fetch(`/status/${jobId}`)
    const data = await res.json()
    if (data.status === 'done') return { ok: true }
    if (data.status === 'error') return { ok: false, msg: data.message }
    await new Promise((r) => setTimeout(r, 1500))
  }
}

const pageVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -22 },
}

/* ─── component ─────────────────────────────────────────────── */
export default function Tool() {
  // steps: 0=upload  1=mode  2=canvas  3=processing  4=result  -1=error
  const [step, setStep] = useState(0)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [mode, setMode] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState(null)

  /* display step for the indicator (0–3) */
  const indicatorStep =
    step === 0 ? 0 : step === 1 ? 1 : step === 2 ? 2 : step === 3 ? 2 : step === 4 ? 3 : 0

  /* ── upload & process ──────────────────────────────────── */
  const run = useCallback(async (f, selectedMode, points) => {
    setStep(3)
    setError(null)

    const safeJson = async (res) => {
      try { return await res.json() } catch { return {} }
    }

    try {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('mode', selectedMode)

      let up
      try {
        up = await fetch('/upload', { method: 'POST', body: fd })
      } catch {
        throw new Error('Cannot reach the server. Make sure the backend is running (docker-compose up).')
      }
      if (!up.ok) throw new Error((await safeJson(up)).detail ?? `Upload failed (${up.status})`)
      const { job_id } = await safeJson(up)
      if (!job_id) throw new Error('Server returned an unexpected response. Is the backend running?')
      setJobId(job_id)

      if (selectedMode !== 'auto' && points?.length) {
        const sr = await fetch('/segment/sam', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job_id, points, mode: selectedMode }),
        })
        if (!sr.ok) throw new Error((await safeJson(sr)).detail ?? 'Segmentation failed')
      }

      const result = await poll(job_id)
      if (!result.ok) throw new Error(result.msg ?? 'Processing failed')

      setResultUrl(`/result/${job_id}`)
      setStep(4)
    } catch (e) {
      setError(e.message)
      setStep(-1)
    }
  }, [])

  /* ── event handlers ────────────────────────────────────── */
  const handleFile = (f) => {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setStep(1)
  }

  const handleMode = (m) => {
    setMode(m)
    if (m === 'auto') run(file, m, null)
    else setStep(2)
  }

  const handleCanvas = (pts) => run(file, mode, pts)

  const download = async () => {
    if (!resultUrl) return
    const blob = await (await fetch(resultUrl)).blob()
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: 'background_removed.png',
    })
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const reset = () => {
    setStep(0); setFile(null); setPreview(null)
    setMode(null); setJobId(null); setResultUrl(null); setError(null)
  }

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className="min-h-screen" style={{ background: '#09090f' }}>
      <Navbar />

      <Orb style={{ width: 480, height: 480, top: -80, left: -160, background: 'radial-gradient(circle,rgba(124,58,237,0.22),transparent 70%)', animation: 'orb-drift 12s ease-in-out infinite' }} />
      <Orb style={{ width: 320, height: 320, top: 160, right: -80, background: 'radial-gradient(circle,rgba(37,99,235,0.16),transparent 70%)', animation: 'orb-drift-2 15s ease-in-out infinite' }} />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">

        {/* Step indicator */}
        {step >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-14"
          >
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 transition-all ${i <= indicatorStep ? 'opacity-100' : 'opacity-20'}`}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all"
                    style={{
                      background: i < indicatorStep ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : i === indicatorStep ? 'rgba(124,58,237,0.15)' : 'transparent',
                      borderColor: i <= indicatorStep ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.12)',
                      color: i <= indicatorStep ? 'white' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {i < indicatorStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i === indicatorStep ? 'text-white' : 'text-white/35'}`}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className="w-8 h-px transition-all"
                    style={{ background: i < indicatorStep ? 'rgba(124,58,237,0.7)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </motion.div>
        )}

        {/* ── STEP CONTENT ── */}
        <AnimatePresence mode="wait">

          {/* 0 — Upload */}
          {step === 0 && (
            <motion.div key="upload" variants={pageVariants} initial="initial" animate="animate" exit="exit">
              <h2 className="text-3xl font-black text-center mb-2">Upload your image</h2>
              <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Any image, any background — we handle it all
              </p>
              <DropZone onFile={handleFile} />
            </motion.div>
          )}

          {/* 1 — Mode selection */}
          {step === 1 && (
            <motion.div key="mode" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              {/* Uploaded file preview */}
              <div className="glass rounded-2xl p-4 flex items-center gap-4 border border-white/8">
                <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{file?.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {(file?.size / 1024 / 1024).toFixed(1)} MB · Ready to process
                  </p>
                </div>
                <button onClick={reset} className="text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.05)' }}>
                  Change
                </button>
              </div>

              <div>
                <h2 className="text-3xl font-black text-center mb-2">Choose your mode</h2>
                <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.38)' }}>
                  How do you want to handle the background?
                </p>
                <ModeSelector selected={mode} onSelect={handleMode} />
              </div>
            </motion.div>
          )}

          {/* 2 — Click canvas */}
          {step === 2 && (
            <motion.div key="canvas" variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black">
                    {mode === 'keep' ? 'Click what to keep' : 'Click what to remove'}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    {mode === 'keep'
                      ? 'Place green dots on the subject. SAM2 removes everything else.'
                      : 'Place red dots on objects to erase. SAM2 removes only those.'}
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  ← Change mode
                </button>
              </div>
              <ClickCanvas imageUrl={preview} mode={mode} onConfirm={handleCanvas} />
            </motion.div>
          )}

          {/* 3 — Processing */}
          {step === 3 && (
            <motion.div key="proc" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="text-center py-24 space-y-8">
              {/* Animated ring */}
              <div className="relative inline-flex">
                <svg className="spin w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" r="40" fill="none" strokeWidth="4"
                    stroke="rgba(124,58,237,0.15)" />
                  <circle cx="48" cy="48" r="40" fill="none" strokeWidth="4"
                    stroke="url(#ring-grad)" strokeDasharray="251" strokeDashoffset="188"
                    strokeLinecap="round" />
                  <defs>
                    <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-3xl">
                  {mode === 'auto' ? '⚡' : mode === 'keep' ? '🎯' : '✂️'}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-black mb-2">Processing your image</h2>
                <p style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {mode === 'auto'
                    ? 'BiRefNet is detecting and removing the background…'
                    : 'SAM2 is segmenting based on your selection…'}
                </p>
              </div>
            </motion.div>
          )}

          {/* 4 — Result */}
          {step === 4 && (
            <motion.div key="result" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="space-y-7">
              <div className="text-center">
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}
                >
                  ✓ Background removed successfully
                </motion.span>
              </div>

              <BeforeAfterSlider beforeUrl={preview} afterUrl={resultUrl} />

              <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Drag the slider to compare · Result is a transparent PNG
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <motion.button
                  onClick={download}
                  className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 8px 28px rgba(124,58,237,0.35)' }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG
                </motion.button>
                <motion.button
                  onClick={reset}
                  className="px-8 py-3.5 rounded-2xl font-medium border transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  whileHover={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.22)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  Remove Another
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* -1 — Error */}
          {step === -1 && (
            <motion.div key="err" variants={pageVariants} initial="initial" animate="animate" exit="exit"
              className="text-center py-20 space-y-5">
              <div className="text-6xl">⚠️</div>
              <h2 className="text-xl font-bold text-red-400">Something went wrong</h2>
              <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(255,255,255,0.38)' }}>{error}</p>
              <button
                onClick={reset}
                className="px-7 py-3 rounded-xl text-sm font-medium border transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

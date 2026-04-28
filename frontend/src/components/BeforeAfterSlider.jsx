import { useRef, useState, useEffect } from 'react'

export default function BeforeAfterSlider({ beforeUrl, afterUrl }) {
  const containerRef = useRef(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const clamp = (v) => Math.max(2, Math.min(98, v))

  const fromClientX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPct(clamp(((clientX - rect.left) / rect.width) * 100))
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      fromClientX(e.clientX ?? e.touches?.[0]?.clientX)
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ userSelect: 'none' }}>
      <div
        ref={containerRef}
        className="relative checkerboard"
        style={{ height: 480, cursor: 'ew-resize' }}
        onMouseDown={(e) => { dragging.current = true; fromClientX(e.clientX) }}
        onTouchStart={(e) => { dragging.current = true; fromClientX(e.touches[0].clientX) }}
      >
        {/* Original — clipped to show RIGHT portion */}
        <img
          src={beforeUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
        />

        {/* Result — clipped to show LEFT portion (checkerboard bg shows through transparency) */}
        <img
          src={afterUrl}
          alt="Result"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
        />

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${pct}%`,
            width: 3,
            background: 'white',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 16px rgba(0,0,0,0.6)',
          }}
        >
          {/* Handle */}
          <div
            className="absolute top-1/2 left-1/2 pointer-events-auto"
            style={{
              transform: 'translate(-50%, -50%)',
              width: 44,
              height: 44,
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              cursor: 'ew-resize',
            }}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-4 3 4 3M16 9l4 3-4 3" />
            </svg>
          </div>
        </div>

        {/* Corner labels */}
        <div className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}>
          REMOVED
        </div>
        <div className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-lg pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.7)' }}>
          ORIGINAL
        </div>
      </div>
    </div>
  )
}

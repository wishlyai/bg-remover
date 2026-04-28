import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function ClickCanvas({ imageUrl, mode, onConfirm }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [points, setPoints] = useState([])
  const [pointType, setPointType] = useState('keep') // 'keep' | 'remove'

  const draw = useCallback((pts) => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    pts.forEach(({ nx, ny, type }) => {
      const x = nx * canvas.width
      const y = ny * canvas.height
      const isKeep = type === 'keep'

      // Outer glow ring
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      ctx.fillStyle = isKeep ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)'
      ctx.fill()

      // Solid dot
      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = isKeep ? 'rgba(16,185,129,0.85)' : 'rgba(239,68,68,0.85)'
      ctx.fill()
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.stroke()

      // + / − label
      ctx.fillStyle = 'white'
      ctx.font = 'bold 14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(isKeep ? '+' : '−', x, y)
    })
  }, [])

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      const parent = canvas.parentElement
      const maxW = (parent?.clientWidth ?? 800) - 2
      const maxH = 500
      const scale = Math.min(maxW / img.width, maxH / img.height, 1)
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      draw([])
    }
    img.src = imageUrl
  }, [imageUrl, draw])

  const handleClick = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / canvas.width
    const ny = (e.clientY - rect.top) / canvas.height
    const updated = [...points, { nx, ny, type: pointType }]
    setPoints(updated)
    draw(updated)
  }

  const undo = () => {
    const updated = points.slice(0, -1)
    setPoints(updated)
    draw(updated)
  }

  const clear = () => {
    setPoints([])
    draw([])
  }

  // Build SAM label array: keep=1 (foreground), remove=0 (background)
  const handleConfirm = () => {
    if (!points.length) return
    const payload = points.map(({ nx, ny, type }) => ({
      x: nx,
      y: ny,
      label: type === 'keep' ? 1 : 0,
    }))
    onConfirm(payload)
  }

  const keepCount = points.filter((p) => p.type === 'keep').length
  const removeCount = points.filter((p) => p.type === 'remove').length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/50 mr-1">Click type:</span>
          {[
            { id: 'keep', label: '+ Keep', color: 'bg-emerald-500', inactive: 'bg-white/5 text-white/40 hover:bg-white/10' },
            { id: 'remove', label: '− Remove', color: 'bg-red-500', inactive: 'bg-white/5 text-white/40 hover:bg-white/10' },
          ].map(({ id, label, color, inactive }) => (
            <button
              key={id}
              onClick={() => setPointType(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${pointType === id ? `${color} text-white shadow-lg` : inactive}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {points.length > 0 && (
            <span className="text-xs text-white/30 mr-2">
              {keepCount > 0 && <span className="text-emerald-400">{keepCount} keep</span>}
              {keepCount > 0 && removeCount > 0 && <span className="text-white/20"> · </span>}
              {removeCount > 0 && <span className="text-red-400">{removeCount} remove</span>}
            </span>
          )}
          <button
            onClick={undo}
            disabled={!points.length}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-25 transition-all"
          >
            Undo
          </button>
          <button
            onClick={clear}
            disabled={!points.length}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:bg-white/10 disabled:opacity-25 transition-all"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex justify-center rounded-2xl overflow-hidden border border-white/10">
        <canvas
          ref={canvasRef}
          onClick={handleClick}
          className="block cursor-crosshair"
          style={{ maxWidth: '100%' }}
        />
      </div>

      {/* Confirm row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/35">
          {points.length === 0
            ? 'Click on the image to mark points'
            : `${points.length} point${points.length > 1 ? 's' : ''} placed`}
        </p>
        <motion.button
          onClick={handleConfirm}
          disabled={!points.length}
          className="px-7 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Process with SAM2 →
        </motion.button>
      </div>
    </div>
  )
}

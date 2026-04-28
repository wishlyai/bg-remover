import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function DropZone({ onFile }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(
    (file) => {
      if (file && file.type.startsWith('image/')) onFile(file)
    },
    [onFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
    >
      <motion.label
        htmlFor="file-input"
        animate={{
          borderColor: dragging ? 'rgba(124,58,237,0.9)' : 'rgba(255,255,255,0.1)',
          backgroundColor: dragging ? 'rgba(109,40,217,0.08)' : 'rgba(255,255,255,0.02)',
        }}
        whileHover={{ borderColor: 'rgba(124,58,237,0.5)', backgroundColor: 'rgba(109,40,217,0.04)' }}
        className="flex flex-col items-center gap-7 p-16 border-2 border-dashed rounded-3xl cursor-pointer transition-colors"
        style={{ perspective: '800px' }}
      >
        {/* 3-D upload icon */}
        <motion.div
          className="relative"
          animate={{ y: dragging ? -10 : 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(124,58,237,0.25), rgba(79,70,229,0.15))',
              border: '1px solid rgba(124,58,237,0.35)',
              transform: 'perspective(400px) rotateX(14deg)',
              boxShadow: '0 16px 40px rgba(124,58,237,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          {/* Drop-shadow beneath icon */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full blur-lg"
            style={{ background: 'rgba(124,58,237,0.25)' }} />
        </motion.div>

        <div className="text-center">
          <p className="text-white text-xl font-semibold mb-1">
            {dragging ? 'Drop it!' : 'Drop your image here'}
          </p>
          <p className="text-white/40 text-sm">
            or{' '}
            <span className="text-violet-400 font-medium">browse files</span>
            {' '}· JPG, PNG, WEBP up to 20 MB
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-white/25 flex-wrap justify-center">
          <span>✓ No signup</span>
          <span>✓ No watermarks</span>
          <span>✓ Files deleted after 1 hr</span>
        </div>
      </motion.label>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}

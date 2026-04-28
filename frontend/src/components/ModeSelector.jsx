import { motion } from 'framer-motion'

const MODES = [
  {
    id: 'auto',
    icon: '⚡',
    name: 'Auto Remove',
    tagline: 'One-click magic',
    desc: 'BiRefNet AI instantly detects every subject and strips the background — zero input required.',
    gradient: 'from-violet-600 to-indigo-600',
    shadow: 'rgba(124,58,237,0.35)',
    border: 'rgba(124,58,237,0.4)',
    tag: 'Most Popular',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  {
    id: 'keep',
    icon: '🎯',
    name: 'Click to Keep',
    tagline: 'Select your subject',
    desc: 'Click on what you want to keep. SAM2 removes everything else with pixel-perfect precision.',
    gradient: 'from-sky-500 to-cyan-500',
    shadow: 'rgba(14,165,233,0.3)',
    border: 'rgba(14,165,233,0.35)',
    tag: 'Precise',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  {
    id: 'remove',
    icon: '✂️',
    name: 'Click to Remove',
    tagline: 'Erase anything',
    desc: 'Click on specific objects to erase them — logos, watermarks, distractions, anything.',
    gradient: 'from-pink-500 to-rose-500',
    shadow: 'rgba(236,72,153,0.3)',
    border: 'rgba(236,72,153,0.35)',
    tag: 'Surgical',
    tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
]

export default function ModeSelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {MODES.map((m, i) => {
        const active = selected === m.id
        return (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(m.id)}
            className="relative text-left p-7 rounded-3xl border transition-all duration-200 neon-hover"
            style={{
              background: active
                ? `linear-gradient(145deg, rgba(124,58,237,0.18), rgba(79,70,229,0.12))`
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${active ? m.border : 'rgba(255,255,255,0.08)'}`,
              boxShadow: active ? `0 20px 60px ${m.shadow}` : 'none',
              transform: active ? 'translateY(-4px)' : 'translateY(0)',
              perspective: '600px',
            }}
            whileHover={{ y: active ? -4 : -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Tag */}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border mb-5 inline-block ${m.tagColor}`}>
              {m.tag}
            </span>

            {/* Icon with 3D tilt */}
            <div
              className="text-4xl mb-4 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${active ? `rgba(124,58,237,0.3)` : 'rgba(255,255,255,0.05)'})`,
                transform: 'perspective(300px) rotateX(10deg)',
                boxShadow: active ? `0 8px 24px ${m.shadow}` : '0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              {m.icon}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{m.name}</h3>
            <p
              className="text-sm font-semibold mb-3"
              style={{
                background: `linear-gradient(135deg, #fff, #a78bfa)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {m.tagline}
            </p>
            <p className="text-white/45 text-sm leading-relaxed">{m.desc}</p>

            {/* Checkmark */}
            {active && (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-lg"
              >
                <svg className="w-4 h-4 text-violet-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

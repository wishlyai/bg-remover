import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { pathname } = useLocation()
  const onTool = pathname === '/tool'

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(9, 9, 15, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <Link to="/" className="flex items-center gap-3 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
          }}
        >
          B
        </div>
        <span className="font-bold text-lg tracking-tight group-hover:text-violet-300 transition-colors">
          BGRemover
        </span>
        <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
          Free
        </span>
      </Link>

      <div className="flex items-center gap-3">
        {!onTool ? (
          <Link
            to="/tool"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
            }}
          >
            Try Free →
          </Link>
        ) : (
          <Link
            to="/"
            className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-1"
          >
            ← Home
          </Link>
        )}
      </div>
    </motion.nav>
  )
}

import { motion } from 'framer-motion'

const tabs = [
  { key: 'study', label: '学习' },
  { key: 'review', label: '复习' },
  { key: 'wordbook', label: '单词本' },
  { key: 'profile', label: '我的' },
]

function BottomNav({ tab, setTab }) {
  return (
    <nav className="shrink-0 bg-white/80 backdrop-blur-xl border-t border-black/5"
      style={{ height: '72px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-md mx-auto h-full grid grid-cols-4">
        {tabs.map(t => {
          const isActive = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              <span className={`text-sm font-semibold transition-colors duration-200 ${
                isActive ? 'text-[#17C964]' : 'text-[#9E9EA7]'
              }`}>
                {t.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-1 rounded-full bg-[#17C964]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav

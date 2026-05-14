function BottomNav({ tab, setTab }) {
  const tabs = [
    { key: 'study', label: '学习' },
    { key: 'review', label: '复习' },
    { key: 'translate', label: '翻译' },
    { key: 'wordbook', label: '单词本' },
    { key: 'profile', label: '我的' },
  ]
  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 safe-area-b">
      <div className="max-w-md mx-auto flex">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              tab === t.key ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
export default BottomNav

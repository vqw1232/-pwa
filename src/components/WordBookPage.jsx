import { useState, useMemo } from 'react'
import words from '../data/ielts_words.json'

function WordBookPage() {
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    ).slice(0, 100)
  }, [query])

  return (
    <div className="min-h-full flex flex-col">
      {/* Search bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setExpandedId(null) }}
            placeholder="搜索单词或中文释义..."
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
            autoFocus
          />
          {query.trim() && (
            <p className="text-xs text-gray-400 mt-1">
              找到 {results.length}{results.length >= 100 ? '+' : ''} 个结果
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-md mx-auto space-y-1">
          {results.map(w => (
            <div key={w.id}>
              <button
                onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                  expandedId === w.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-gray-900">{w.word}</span>
                  <span className="text-sm text-gray-400 truncate">{w.meaning}</span>
                </div>
                {expandedId === w.id && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                    {w.phonetic && (
                      <p className="text-sm text-gray-400">{w.phonetic}</p>
                    )}
                    {w.example && (
                      <p className="text-sm text-gray-500 italic leading-relaxed">{w.example}</p>
                    )}
                  </div>
                )}
              </button>
            </div>
          ))}
          {query.trim() && results.length === 0 && (
            <p className="text-center text-gray-400 py-8">未找到匹配的单词</p>
          )}
          {!query.trim() && (
            <p className="text-center text-gray-400 py-8">输入关键词搜索单词</p>
          )}
        </div>
      </div>
    </div>
  )
}
export default WordBookPage

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import words from '../data/ielts_words.json'
import { lookupWord, lookupWordAsync } from '../lib/dictionary'
import WordPopover from './WordPopover'

function WordBookPage() {
  const [query, setQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [wordPopover, setWordPopover] = useState(null)

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.trim().toLowerCase()
    return words.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    ).slice(0, 100)
  }, [query])

  return (
    <>
    <main className="flex-1 px-5 pt-6 pb-32 flex flex-col">
      <div className="bg-white rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#111]">单词本</h1>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setExpandedId(null) }}
          placeholder="搜索单词或中文释义..."
          className="w-full px-5 py-4 text-base bg-white rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] text-[#111] placeholder-[#9E9EA7] focus:outline-none focus:ring-2 focus:ring-[#17C964]/30 transition-all"
          autoFocus
        />
        {query.trim() && (
          <p className="text-xs text-[#8E8E93] mt-2 ml-2">
            找到 {results.length}{results.length >= 100 ? '+' : ''} 个结果
          </p>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          <AnimatePresence>
            {results.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
              >
                <button
                  onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
                  className="w-full text-left bg-white rounded-[20px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-lg font-bold text-[#111]">{w.word}</span>
                    <span className="text-sm text-[#8E8E93] truncate">{w.meaning}</span>
                  </div>
                  {expandedId === w.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-[#EFEFEF] space-y-1.5"
                    >
                      {w.phonetic && (
                        <p className="text-sm text-[#8E8E93]">{w.phonetic}</p>
                      )}
                      {w.example && (
                        (() => {
                          const tokens = w.example.split(/([a-zA-Z]+(?:'[a-zA-Z]+)?)/g).filter(Boolean)
                          return (
                            <p className="text-sm text-[#8E8E93] leading-relaxed">
                              {tokens.map((token, i) => {
                                const isWord = /^[a-zA-Z]/.test(token)
                                return (
                                  <span
                                    key={i}
                                    onClick={isWord ? async (e) => {
                                      e.stopPropagation()
                                      const rect = e.target.getBoundingClientRect()
                                      const local = lookupWord(token)
                                      if (local) {
                                        setWordPopover({ ...local, rect, loading: false })
                                        return
                                      }
                                      setWordPopover({ word: token, phonetic: '', meaning: '', rect, loading: true })
                                      const result = await lookupWordAsync(token)
                                      if (result) {
                                        setWordPopover({ ...result, rect, loading: false })
                                      } else {
                                        setWordPopover({ word: token, phonetic: '', meaning: '获取失败，请重试', rect, loading: false })
                                      }
                                    } : undefined}
                                    className={isWord ? 'cursor-pointer active:opacity-60 transition-opacity' : ''}
                                  >
                                    {token}
                                  </span>
                                )
                              })}
                            </p>
                          )
                        })()
                      )}
                    </motion.div>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {query.trim() && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#8E8E93]/10 flex items-center justify-center mb-4">
                <span className="text-2xl text-[#8E8E93]">?</span>
              </div>
              <p className="text-[#8E8E93]">未找到匹配的单词</p>
            </div>
          )}

          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-[#17C964]/10 flex items-center justify-center mb-4">
                <span className="text-2xl text-[#17C964]">B</span>
              </div>
              <p className="text-[#8E8E93]">输入关键词搜索单词</p>
            </div>
          )}
        </div>
      </div>
    </main>

    {/* Word popover */}
    <AnimatePresence>
      {wordPopover && (
        <WordPopover
          word={wordPopover.word}
          phonetic={wordPopover.phonetic}
          meaning={wordPopover.meaning}
          rect={wordPopover.rect}
          onClose={() => setWordPopover(null)}
        />
      )}
    </AnimatePresence>
    </>
  )
}

export default WordBookPage

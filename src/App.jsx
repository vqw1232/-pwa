import { useState, useEffect, useCallback } from 'react'
import words from './data/ielts_words.json'
import { getUserId, setUserId } from './lib/supabase'
import { loadProgress, saveProgress } from './lib/progress'

function App() {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [progress, setProgress] = useState({})
  const [synced, setSynced] = useState(null) // null=loading, true=online, false=offline
  const [showSettings, setShowSettings] = useState(false)
  const [userId, setUserIdState] = useState(getUserId())
  const [idInput, setIdInput] = useState(userId)

  useEffect(() => {
    loadProgress().then((map) => {
      setProgress(map)
      setSynced(true)
    }).catch(() => {
      setSynced(false)
    })
  }, [])

  const current = words[index]
  const wordProgress = progress[current?.id]
  const correctCount = wordProgress?.correct ?? 0

  const handleKnow = useCallback(async (known) => {
    setRevealed(true)
    const ok = await saveProgress(current.id, known)
    if (ok) {
      setProgress(prev => ({
        ...prev,
        [current.id]: {
          correct: (prev[current.id]?.correct ?? 0) + (known ? 1 : 0),
          wrong: (prev[current.id]?.wrong ?? 0) + (known ? 0 : 1),
        }
      }))
    }
  }, [current])

  const handleNext = useCallback(() => {
    if (index < words.length - 1) {
      setIndex(i => i + 1)
    } else {
      setIndex(0)
    }
    setRevealed(false)
  }, [index])

  const handleSetId = useCallback(() => {
    if (setUserId(idInput)) {
      setUserIdState(idInput)
      setShowSettings(false)
      setSynced(null)
      // Reload progress with new ID
      loadProgress().then(map => {
        setProgress(map)
        setSynced(true)
      }).catch(() => setSynced(false))
    }
  }, [idInput])

  if (!current) return null

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400 font-mono">
              {index + 1} / {words.length}
            </span>
            <div className="flex items-center gap-2">
              {synced === true && (
                <span className="text-xs text-emerald-500">已同步</span>
              )}
              {synced === false && (
                <span className="text-xs text-amber-500">离线</span>
              )}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                设置
              </button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-indigo-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>
      </header>

      {/* Settings panel */}
      {showSettings && (
        <div className="shrink-0 px-4 pb-3">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">跨设备同步</h3>
            <p className="text-xs text-gray-400 mb-3">
              在另一台设备上输入相同的用户 ID 即可同步学习进度。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={idInput}
                onChange={e => setIdInput(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="输入你的用户 ID"
              />
              <button
                onClick={handleSetId}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-500 rounded-xl hover:bg-indigo-600"
              >
                应用
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">当前 ID: {userId}</p>
          </div>
        </div>
      )}

      {/* Word card */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2 select-none">
            {current.word}
          </h1>
          <p className="text-lg text-gray-400 mb-6 select-none">
            {current.phonetic}
          </p>

          {/* Translation & Example - animated reveal */}
          <div
            className={`transition-all duration-500 ease-out overflow-hidden ${
              revealed ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-xl text-gray-700 mb-4 leading-relaxed">
              {current.meaning}
            </p>
            <p className="text-sm text-gray-400 italic leading-relaxed bg-gray-100 rounded-xl px-4 py-3">
              {current.example}
            </p>
            {correctCount > 0 && (
              <p className="text-xs text-emerald-500 mt-3">
                已掌握 {correctCount} 次
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Bottom buttons */}
      <footer className="shrink-0 px-4 pb-8 pt-2">
        <div className="max-w-md mx-auto">
          {!revealed ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleKnow(false)}
                className="flex-1 h-16 rounded-2xl text-lg font-bold text-white bg-red-500 active:bg-red-600 transition-colors shadow-lg shadow-red-500/25 active:scale-[0.98]"
              >
                不认识
              </button>
              <button
                onClick={() => handleKnow(true)}
                className="flex-1 h-16 rounded-2xl text-lg font-bold text-white bg-emerald-500 active:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
              >
                认识
              </button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full h-16 rounded-2xl text-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              下一个
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

export default App

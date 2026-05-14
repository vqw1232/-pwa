import { useState, useEffect, useCallback } from 'react'
import words from '../data/ielts_words.json'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function ReviewPage({ progress }) {
  const [reviewWords, setReviewWords] = useState([])
  const [eligibleCount, setEligibleCount] = useState(0)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [started, setStarted] = useState(false)
  const [count, setCount] = useState(() => {
    try { return parseInt(localStorage.getItem('reviewCount')) || 20 } catch { return 20 }
  })

  // Build review list: spaced repetition within N+1 to N+7 day window
  useEffect(() => {
    const studiedIds = Object.keys(progress)
    if (studiedIds.length === 0) {
      setReviewWords([])
      return
    }

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    // Score each word by review priority
    const scored = []
    for (const id of studiedIds) {
      const p = progress[id]
      const lastTime = p.last_reviewed_at ? new Date(p.last_reviewed_at).getTime() : 0
      const daysSince = (now - lastTime) / oneDay

      // Skip words reviewed within the last 24 hours
      if (daysSince < 1 && lastTime > 0) continue

      // Priority: wrong words first, then longest wait
      const priority = (p.wrong > 0 ? 1000 : 0) + daysSince
      scored.push({ id: parseInt(id), priority, daysSince, wrong: p.wrong, correct: p.correct, last_reviewed_at: p.last_reviewed_at })
    }

    // Sort by priority desc
    scored.sort((a, b) => b.priority - a.priority)

    // Randomly shuffle within tiers, then take top `count`
    const selected = []
    const wrong = scored.filter(s => s.wrong > 0)
    const overdue = scored.filter(s => s.wrong === 0 && s.daysSince > 7)
    const window = scored.filter(s => s.wrong === 0 && s.daysSince >= 1 && s.daysSince <= 7)

    shuffle(wrong)
    shuffle(overdue)
    shuffle(window)

    selected.push(...wrong, ...overdue, ...window)
    selected.splice(count)

    const mapped = selected.map(s => {
      const word = words.find(w => w.id === s.id)
      return word ? { ...word, progress: progress[s.id] } : null
    }).filter(Boolean)

    setReviewWords(mapped)
    setEligibleCount(scored.length)
    setIndex(0)
    setStarted(false)
    setRevealed(false)
  }, [progress, count])

  const current = reviewWords[index]
  const correctCount = current?.progress?.correct ?? 0
  const wrongCount = current?.progress?.wrong ?? 0
  const isDone = started && index >= reviewWords.length

  const handleKnow = useCallback((known) => {
    setRevealed(true)
  }, [])

  const handleNext = useCallback(() => {
    if (index < reviewWords.length - 1) {
      setIndex(i => i + 1)
      setRevealed(false)
    } else {
      setIndex(reviewWords.length) // triggers done state
    }
  }, [index, reviewWords.length])

  const adjustCount = (delta) => {
    setCount(c => {
      const next = Math.max(1, Math.min(500, c + delta))
      localStorage.setItem('reviewCount', String(next))
      return next
    })
  }

  // Setup screen
  if (!started) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-700 mb-2">复习模式</h2>
          <p className="text-sm text-gray-400 mb-2">优先复习你之前答错的单词</p>
          <p className="text-xs text-gray-400 mb-6">
            待复习: {eligibleCount} 个 · 本次: {reviewWords.length} 个
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={() => adjustCount(-5)}
              className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm hover:bg-gray-300"
            >−</button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={count}
                onChange={e => {
                  const v = Math.max(1, Math.min(500, parseInt(e.target.value) || 1))
                  setCount(v)
                  localStorage.setItem('reviewCount', String(v))
                }}
                className="w-16 text-center text-lg font-medium border border-gray-300 rounded-lg py-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="1" max="500"
              />
              <span className="text-gray-400 text-sm">个</span>
            </div>
            <button
              onClick={() => adjustCount(5)}
              className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm hover:bg-gray-300"
            >+</button>
          </div>

          {reviewWords.length > 0 ? (
            <button
              onClick={() => setStarted(true)}
              className="w-48 h-14 rounded-2xl text-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >开始复习</button>
          ) : (
            <p className="text-gray-400">暂无需要复习的单词，先去学习吧！</p>
          )}
        </div>
      </div>
    )
  }

  // Done screen
  if (isDone) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">✓</p>
          <h2 className="text-xl font-bold text-gray-700 mb-2">复习完成！</h2>
          <p className="text-sm text-gray-400 mb-6">共复习了 {reviewWords.length} 个单词</p>
          <button
            onClick={() => {
              setStarted(false)
              setIndex(0)
              setRevealed(false)
            }}
            className="px-8 h-12 rounded-2xl text-base font-bold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
          >再来一组</button>
        </div>
      </div>
    )
  }

  // Active review
  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400 font-mono">
              复习 {index + 1} / {reviewWords.length}
            </span>
            <span className="text-xs text-amber-500">
              {wrongCount > 0 ? `曾答错 ${wrongCount} 次` : ''}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((index + 1) / reviewWords.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Word card */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2 select-none">
            {current.word}
          </h1>
          <p className="text-lg text-gray-400 mb-6 select-none">
            {current.phonetic}
          </p>

          <div className={`transition-all duration-500 ease-out overflow-hidden ${
            revealed ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}>
            <p className="text-xl text-gray-700 mb-4 leading-relaxed">{current.meaning}</p>
            <p className="text-sm text-gray-400 italic leading-relaxed bg-gray-100 rounded-xl px-4 py-3">{current.example}</p>
            {correctCount > 0 && (
              <p className="text-xs text-emerald-500 mt-3">已掌握 {correctCount} 次</p>
            )}
          </div>
        </div>
      </main>

      {/* Buttons */}
      <footer className="shrink-0 px-4 pb-8 pt-2">
        <div className="max-w-md mx-auto">
          {!revealed ? (
            <div className="flex gap-3">
              <button
                onClick={() => handleKnow(false)}
                className="flex-1 h-16 rounded-2xl text-lg font-bold text-white bg-red-500 active:bg-red-600 transition-colors shadow-lg shadow-red-500/25 active:scale-[0.98]"
              >不认识</button>
              <button
                onClick={() => handleKnow(true)}
                className="flex-1 h-16 rounded-2xl text-lg font-bold text-white bg-emerald-500 active:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
              >认识</button>
            </div>
          ) : (
            <button
              onClick={handleNext}
              className="w-full h-16 rounded-2xl text-lg font-bold text-white bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >{index < reviewWords.length - 1 ? '下一个' : '完成'}</button>
          )}
        </div>
      </footer>
    </div>
  )
}
export default ReviewPage

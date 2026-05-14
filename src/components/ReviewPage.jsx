import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import words from '../data/ielts_words.json'

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

function getReviewedToday() {
  try {
    const raw = localStorage.getItem('reviewedTimestamps')
    if (!raw) return {}
    return JSON.parse(raw)
  } catch { return {} }
}

function markReviewed(wordId) {
  const map = getReviewedToday()
  map[wordId] = Date.now()
  localStorage.setItem('reviewedTimestamps', JSON.stringify(map))
}

const cardVariants = {
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, scale: 0.96 },
}

const revealVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
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

  useEffect(() => {
    const studiedIds = Object.keys(progress)
    if (studiedIds.length === 0) {
      setReviewWords([])
      return
    }

    const reviewed = getReviewedToday()
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000

    const scored = []
    for (const id of studiedIds) {
      const p = progress[id]
      const lastTime = reviewed[id] || 0
      const daysSince = (now - lastTime) / oneDay
      if (daysSince < 1 && lastTime > 0) continue
      const priority = (p.wrong > 0 ? 1000 : 0) + daysSince
      scored.push({ id: parseInt(id), priority, daysSince, wrong: p.wrong })
    }

    scored.sort((a, b) => b.priority - a.priority)

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
      return word ? { ...word, wrong: s.wrong, correct: progress[s.id]?.correct ?? 0 } : null
    }).filter(Boolean)

    setReviewWords(mapped)
    setEligibleCount(scored.length)
    setIndex(0)
    setStarted(false)
    setRevealed(false)
  }, [progress, count])

  const current = reviewWords[index]
  const correctCount = current?.correct ?? 0
  const wrongCount = current?.wrong ?? 0
  const isDone = started && index >= reviewWords.length

  const handleKnow = useCallback((known) => {
    setRevealed(true)
    if (current) markReviewed(current.id)
  }, [current])

  const handleNext = useCallback(() => {
    if (index < reviewWords.length - 1) {
      setIndex(i => i + 1)
      setRevealed(false)
    } else {
      setIndex(reviewWords.length)
    }
  }, [index, reviewWords.length])

  const adjustCount = (delta) => {
    setCount(c => {
      const next = Math.max(1, Math.min(500, c + delta))
      localStorage.setItem('reviewCount', String(next))
      return next
    })
  }

  const exampleParts = current?.example
    ? current.example.split(new RegExp(`\\b(${current.word})\\b`, 'gi'))
    : []

  // ---- Setup screen ----
  if (!started) {
    return (
      <main className="flex-1 px-5 pt-6 pb-24 flex flex-col">
        <header className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-[#111]">复习</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#FF9500]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-[#FF9500]">↻</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">复习模式</h2>
            <p className="text-[#8E8E93] mb-1">优先复习你之前答错的单词</p>
            <p className="text-sm text-[#8E8E93] mb-8">
              待复习: {eligibleCount} 个 · 本次: {reviewWords.length} 个
            </p>

            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => adjustCount(-5)}
                className="w-9 h-9 rounded-full bg-white shadow-soft text-[#8E8E93] text-lg flex items-center justify-center"
              >−</button>
              <div className="flex items-center gap-1">
                <span className="text-3xl font-bold text-[#111]">{count}</span>
                <span className="text-[#8E8E93] text-sm">个</span>
              </div>
              <button
                onClick={() => adjustCount(5)}
                className="w-9 h-9 rounded-full bg-white shadow-soft text-[#8E8E93] text-lg flex items-center justify-center"
              >+</button>
            </div>

            {reviewWords.length > 0 ? (
              <motion.button
                onClick={() => setStarted(true)}
                whileTap={{ scale: 0.96 }}
                className="w-48 h-14 rounded-[24px] text-lg font-bold text-white bg-gradient-to-b from-[#FF9500] to-[#E68A00] shadow-[0_8px_24px_rgba(255,149,0,0.25)]"
              >开始复习</motion.button>
            ) : (
              <p className="text-[#8E8E93]">暂无需要复习的单词，先去学习吧！</p>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ---- Done screen ----
  if (isDone) {
    return (
      <main className="flex-1 px-5 pt-6 pb-24 flex flex-col">
        <header className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-[#111]">复习</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-[#17C964]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-[#17C964]">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">复习完成！</h2>
            <p className="text-[#8E8E93] mb-8">共复习了 {reviewWords.length} 个单词</p>
            <motion.button
              onClick={() => {
                setStarted(false)
                setIndex(0)
                setRevealed(false)
              }}
              whileTap={{ scale: 0.96 }}
              className="px-8 h-14 rounded-[24px] text-base font-bold text-white bg-[#111] shadow-lg"
            >再来一组</motion.button>
          </div>
        </div>
      </main>
    )
  }

  // ---- Active review ----
  return (
    <main className="flex-1 px-5 pt-6 pb-24 flex flex-col gap-3">
      <header className="pt-1 mb-1">
        <h1 className="text-4xl font-bold tracking-tight text-[#111]">复习</h1>
      </header>

      {/* Progress bar */}
      <div className="bg-white rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-[#8E8E93]">复习进度 {index + 1}/{reviewWords.length}</span>
          {wrongCount > 0 && (
            <span className="text-xs text-[#FF453A] font-medium">曾答错 {wrongCount} 次</span>
          )}
        </div>
        <div className="h-1 rounded-full bg-[#ECECEC] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FF9500] transition-all duration-500 ease-out"
            style={{ width: `${((index + 1) / reviewWords.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Word Card + Buttons */}
      <div className="flex-1 flex flex-col gap-3 min-h-0">
        {/* Word Card */}
        <div className="flex-1 bg-white rounded-[32px] px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="w-full flex flex-col items-center"
            >
              <h2 className="text-[56px] font-bold leading-none tracking-[-0.04em] text-[#111] select-none text-center break-words max-w-full">
                {current.word}
              </h2>

              {current.phonetic && (
                <p className="text-lg text-[#8E8E93] mt-3 select-none">
                  {current.phonetic}
                </p>
              )}

              <AnimatePresence>
                {revealed && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={revealVariants}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <div className="h-px bg-[#EFEFEF] my-6" />
                    <p className="text-lg font-medium leading-relaxed text-[#111] text-center">
                      {current.meaning}
                    </p>
                    {current.example && (
                      <p className="text-base text-[#8E8E93] leading-relaxed mt-3 text-center">
                        {exampleParts.length > 1 ? (
                          exampleParts.map((part, i) => {
                            const isHighlighted = part.toLowerCase() === current.word.toLowerCase()
                            return isHighlighted
                              ? <span key={i} className="text-[#18C964] font-semibold">{part}</span>
                              : <span key={i}>{part}</span>
                          })
                        ) : (
                          current.example
                        )}
                      </p>
                    )}
                    {correctCount > 0 && (
                      <p className="text-xs text-[#17C964] text-center mt-3 font-medium">
                        已掌握 {correctCount} 次
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        {!revealed ? (
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => handleKnow(false)}
              whileTap={{ scale: 0.96 }}
              className="h-[104px] rounded-[24px] bg-gradient-to-b from-[#FF5A5F] to-[#FF3B30] shadow-[0_8px_24px_rgba(255,59,48,0.25)] flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-2xl font-bold text-white leading-tight">不认识</span>
              <span className="text-sm text-white/80">再记一次</span>
            </motion.button>
            <motion.button
              onClick={() => handleKnow(true)}
              whileTap={{ scale: 0.96 }}
              className="h-[104px] rounded-[24px] bg-gradient-to-b from-[#22D06F] to-[#12C764] shadow-[0_8px_24px_rgba(18,199,100,0.25)] flex flex-col items-center justify-center gap-0.5"
            >
              <span className="text-2xl font-bold text-white leading-tight">认识</span>
              <span className="text-sm text-white/80">记得了</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleNext}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileTap={{ scale: 0.96 }}
            className="w-full h-[56px] rounded-[24px] bg-[#111] text-white text-lg font-bold shadow-lg"
          >
            {index < reviewWords.length - 1 ? '继续' : '完成'}
          </motion.button>
        )}
      </div>
    </main>
  )
}

export default ReviewPage

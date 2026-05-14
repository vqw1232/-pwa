import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import words from '../data/ielts_words.json'
import { saveProgress } from '../lib/progress'

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getDailyGoal() {
  try { return parseInt(localStorage.getItem('dailyGoal')) || 50 } catch { return 50 }
}

function getStudiedToday() {
  try {
    const data = JSON.parse(localStorage.getItem('studiedDaily') || '{}')
    return data[getTodayKey()] || []
  } catch { return [] }
}

function addStudiedToday(wordId) {
  const key = getTodayKey()
  const data = JSON.parse(localStorage.getItem('studiedDaily') || '{}')
  const list = data[key] || []
  if (!list.includes(wordId)) list.push(wordId)
  data[key] = list
  localStorage.setItem('studiedDaily', JSON.stringify(data))
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

function StudyPage({ progress, setProgress }) {
  const [sessionStudied, setSessionStudied] = useState(() => {
    const ids = Object.keys(progress)
    return ids.length > 0 ? new Set(ids.map(Number)) : new Set()
  })
  const [progressLoaded, setProgressLoaded] = useState(Object.keys(progress).length > 0)
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [direction, setDirection] = useState(1)
  const [goal, setGoalState] = useState(getDailyGoal)
  const [studiedIds, setStudiedIds] = useState(getStudiedToday)

  useEffect(() => {
    if (!progressLoaded && Object.keys(progress).length > 0) {
      setSessionStudied(new Set(Object.keys(progress).map(Number)))
      setProgressLoaded(true)
    }
  }, [progress, progressLoaded])

  const unstudiedWords = useMemo(() =>
    words.filter(w => !sessionStudied.has(w.id)),
    [sessionStudied]
  )

  const current = unstudiedWords[index]
  const wordProgress = progress[current?.id]
  const correctCount = wordProgress?.correct ?? 0
  const studiedCount = studiedIds.length
  const dailyProgress = Math.min(studiedCount / goal * 100, 100)

  useEffect(() => {
    if (index >= unstudiedWords.length && unstudiedWords.length > 0) {
      setIndex(unstudiedWords.length - 1)
    }
  }, [unstudiedWords.length, index])

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
    addStudiedToday(current.id)
    setStudiedIds(getStudiedToday())
  }, [current, setProgress])

  const handleNext = useCallback(() => {
    setSessionStudied(prev => new Set([...prev, current.id]))
    setRevealed(false)
    setDirection(1)
  }, [current])

  const adjustGoal = (delta) => {
    setGoalState(g => {
      const next = Math.max(1, Math.min(500, g + delta))
      localStorage.setItem('dailyGoal', String(next))
      return next
    })
  }

  // ---- All done ----
  if (unstudiedWords.length === 0) {
    return (
      <main className="flex-1 px-5 pt-6 pb-24 flex flex-col">
        <header className="mb-4">
          <h1 className="text-4xl font-bold tracking-tight text-[#111]">学习</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center -mt-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-[#17C964]/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-[#17C964]">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-[#111] mb-2">全部学完！</h2>
            <p className="text-[#8E8E93]">所有单词已掌握，去复习巩固吧</p>
          </div>
        </div>
      </main>
    )
  }

  if (!current) return null

  // ---- Highlight word in example ----
  const exampleParts = current.example
    ? current.example.split(new RegExp(`\\b(${current.word})\\b`, 'gi'))
    : []

  const exampleCn = current.exampleCn || ''

  return (
    <>
      <main className="flex-1 px-5 pt-6 pb-24 flex flex-col gap-3">
        {/* ============ HEADER ============ */}
        <header className="pt-1 mb-1">
          <h1 className="text-4xl font-bold tracking-tight text-[#111]">学习</h1>
        </header>

        {/* ============ PROGRESS CARD ============ */}
        <div className="bg-white rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-[#8E8E93] mb-0.5">今日学习进度</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#111]">{studiedCount}</span>
                <span className="text-sm text-[#8E8E93]">/ {goal}</span>
              </div>
            </div>
            <button className="text-xs text-[#17C964] font-medium">查看计划</button>
          </div>
          <div className="h-1 rounded-full bg-[#ECECEC] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#16C05E] transition-all duration-500 ease-out"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
        </div>

        {/* ============ WORD CARD + BUTTONS ============ */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          {/* Word Card */}
          <div className="flex-1 bg-white rounded-[32px] px-6 py-8 shadow-[0_12px_40px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center min-h-0">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current.id}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex flex-col items-center justify-center"
              >
                {/* Word */}
                <h2 className="text-[56px] font-bold leading-none tracking-[-0.04em] text-[#111] select-none text-center break-words max-w-full">
                  {current.word}
                </h2>

                {/* Phonetic */}
                {current.phonetic && (
                  <p className="text-lg text-[#8E8E93] mt-3 select-none">
                    {current.phonetic}
                  </p>
                )}

                {/* Revealed content */}
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={revealVariants}
                      transition={{ duration: 0.24, ease: 'easeOut' }}
                      className="w-full"
                    >
                      {/* Divider */}
                      <div className="h-px bg-[#EFEFEF] my-6" />

                      {/* Meaning */}
                      <p className="text-lg font-medium leading-relaxed text-[#111] text-center">
                        {current.meaning}
                      </p>

                      {/* Example */}
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

                      {/* Chinese example */}
                      {exampleCn && (
                        <p className="text-sm text-[#8E8E93] leading-relaxed mt-1.5 text-center">
                          {exampleCn}
                        </p>
                      )}

                      {/* Mastery count */}
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

          {/* ============ ACTION BUTTONS ============ */}
          {!revealed ? (
            <div className="grid grid-cols-2 gap-3">
              {/* 不认识 */}
              <motion.button
                onClick={() => handleKnow(false)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="h-[104px] rounded-[24px] bg-gradient-to-b from-[#FF5A5F] to-[#FF3B30] shadow-[0_8px_24px_rgba(255,59,48,0.25)] flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-2xl font-bold text-white leading-tight">不认识</span>
                <span className="text-sm text-white/80">不太确定</span>
              </motion.button>

              {/* 认识 */}
              <motion.button
                onClick={() => handleKnow(true)}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className="h-[104px] rounded-[24px] bg-gradient-to-b from-[#22D06F] to-[#12C764] shadow-[0_8px_24px_rgba(18,199,100,0.25)] flex flex-col items-center justify-center gap-0.5"
              >
                <span className="text-2xl font-bold text-white leading-tight">认识</span>
                <span className="text-sm text-white/80">已掌握</span>
              </motion.button>
            </div>
          ) : (
            /* ============ NEXT BUTTON ============ */
            <motion.button
              onClick={handleNext}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.96 }}
              className="w-full h-[56px] rounded-[24px] bg-[#111] text-white text-lg font-bold shadow-lg"
            >
              继续
            </motion.button>
          )}
        </div>
      </main>
    </>
  )
}

export default StudyPage

import { useState, useCallback } from 'react'
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

function StudyPage({ progress, setProgress }) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [goal, setGoalState] = useState(getDailyGoal)
  const [studiedIds, setStudiedIds] = useState(getStudiedToday)

  const current = words[index]
  const wordProgress = progress[current?.id]
  const correctCount = wordProgress?.correct ?? 0
  const studiedCount = studiedIds.length
  const dailyProgress = Math.min(studiedCount / goal * 100, 100)

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
    setIndex(i => (i < words.length - 1 ? i + 1 : 0))
    setRevealed(false)
  }, [])

  const adjustGoal = (delta) => {
    setGoalState(g => {
      const next = Math.max(1, Math.min(500, g + delta))
      localStorage.setItem('dailyGoal', String(next))
      return next
    })
  }

  if (!current) return null

  return (
    <div className="flex-1 flex flex-col">
      {/* Top bar with daily goal */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400 font-mono">
              {index + 1} / {words.length}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">今日目标</span>
              <button
                onClick={() => adjustGoal(-10)}
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-300"
              >−</button>
              <input
                type="number"
                value={goal}
                onChange={e => {
                  const v = Math.max(1, Math.min(500, parseInt(e.target.value) || 1))
                  setGoalState(v)
                  localStorage.setItem('dailyGoal', String(v))
                }}
                className="w-14 text-center text-sm border border-gray-300 rounded-lg py-0.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                min="1" max="500"
              />
              <button
                onClick={() => adjustGoal(10)}
                className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-300"
              >+</button>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${dailyProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-right">今日已学 {studiedCount}/{goal} 词</p>
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
            >下一个</button>
          )}
        </div>
      </footer>
    </div>
  )
}
export default StudyPage

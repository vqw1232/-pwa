import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import BottomNav from './components/BottomNav'
import StudyPage from './components/StudyPage'
import ReviewPage from './components/ReviewPage'
import WordBookPage from './components/WordBookPage'
import ProfilePage from './components/ProfilePage'
import { loadProgress } from './lib/progress'

const tabNames = {
  study: '学习',
  review: '复习',
  wordbook: '单词本',
  profile: '我的',
}

function App() {
  const [tab, setTab] = useState('study')
  const [progress, setProgress] = useState({})
  const [synced, setSynced] = useState(null)

  useEffect(() => {
    loadProgress().then(map => {
      setProgress(map)
      setSynced(true)
    }).catch(() => {
      setSynced(false)
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F8]">
      <AnimatePresence mode="wait">
        {tab === 'study' && (
          <StudyPage key="study" progress={progress} setProgress={setProgress} />
        )}
        {tab === 'review' && (
          <ReviewPage key="review" progress={progress} />
        )}
        {tab === 'wordbook' && (
          <WordBookPage key="wordbook" />
        )}
        {tab === 'profile' && (
          <ProfilePage key="profile" synced={synced} setProgress={setProgress} setSynced={setSynced} />
        )}
      </AnimatePresence>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}

export default App

import { useState, useEffect } from 'react'
import BottomNav from './components/BottomNav'
import StudyPage from './components/StudyPage'
import ReviewPage from './components/ReviewPage'
import WordBookPage from './components/WordBookPage'
import ProfilePage from './components/ProfilePage'
import { loadProgress } from './lib/progress'

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
    <div className="min-h-svh bg-gray-50 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        {tab === 'study' && <StudyPage progress={progress} setProgress={setProgress} />}
        {tab === 'review' && <ReviewPage progress={progress} />}
        {tab === 'wordbook' && <WordBookPage />}
        {tab === 'profile' && (
          <ProfilePage synced={synced} setProgress={setProgress} setSynced={setSynced} />
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  )
}

export default App

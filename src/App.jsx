import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import StudyPage from './components/StudyPage'
import ReviewPage from './components/ReviewPage'
import WordBookPage from './components/WordBookPage'
import ProfilePage from './components/ProfilePage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import { loadProgress } from './lib/progress'

function AppContent() {
  const { user, loading } = useAuth()
  const [authPage, setAuthPage] = useState('login')
  const [tab, setTab] = useState('study')
  const [progress, setProgress] = useState({})
  const [synced, setSynced] = useState(null)

  useEffect(() => {
    if (!user) return
    loadProgress().then(map => {
      setProgress(map)
      setSynced(true)
    }).catch(() => {
      setSynced(false)
    })
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#17C964]/30 border-t-[#17C964] rounded-full animate-spin" />
          <p className="text-sm text-[#8E8E93]">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (authPage === 'register') {
      return <RegisterPage onSwitchToLogin={() => setAuthPage('login')} />
    }
    return <LoginPage onSwitchToRegister={() => setAuthPage('register')} />
  }

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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

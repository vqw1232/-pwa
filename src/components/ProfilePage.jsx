import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { loadProgress } from '../lib/progress'

function ProfilePage({ synced, setProgress, setSynced }) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    setProgress({})
    setSynced(null)
  }

  return (
    <main className="flex-1 px-5 pt-6 pb-32 flex flex-col">
      <div className="bg-white rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#111]">我的</h1>
      </div>

      <div className="space-y-4">
        {/* User info card */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#17C964] to-[#12A554] flex items-center justify-center text-white text-xl font-bold shadow-[0_4px_12px_rgba(23,201,100,0.3)]">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111]">{user?.username}</h2>
              <p className="text-sm text-[#8E8E93]">已登录</p>
            </div>
          </div>
          <motion.button
            onClick={handleLogout}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 text-sm font-medium text-red-500 bg-red-50 rounded-[16px] hover:bg-red-100 transition-colors"
          >
            退出登录
          </motion.button>
        </div>

        {/* Sync Status Card */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-between">
          <span className="text-sm text-[#8E8E93]">同步状态</span>
          <div className="flex items-center gap-2">
            {synced === true && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#17C964]" />
                <span className="text-sm font-medium text-[#17C964]">已同步</span>
              </>
            )}
            {synced === false && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#FF9500]" />
                <span className="text-sm font-medium text-[#FF9500]">离线</span>
              </>
            )}
            {synced === null && (
              <>
                <div className="w-2 h-2 rounded-full bg-[#8E8E93] animate-pulse" />
                <span className="text-sm font-medium text-[#8E8E93]">加载中...</span>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage

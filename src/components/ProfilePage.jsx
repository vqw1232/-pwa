import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { getUserId, setUserId } from '../lib/supabase'
import { loadProgress } from '../lib/progress'

function ProfilePage({ synced, setProgress, setSynced }) {
  const userId = getUserId()
  const [idInput, setIdInput] = useState(userId)

  const handleSetId = useCallback(() => {
    if (setUserId(idInput)) {
      setSynced(null)
      loadProgress().then(map => {
        setProgress(map)
        setSynced(true)
      }).catch(() => setSynced(false))
    }
  }, [idInput, setProgress, setSynced])

  return (
    <main className="flex-1 px-5 pt-6 pb-32 flex flex-col">
      <div className="bg-white rounded-[24px] px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-[#111]">我的</h1>
      </div>

      <div className="space-y-4">
        {/* Sync Card */}
        <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <h2 className="text-lg font-bold text-[#111] mb-2">跨设备同步</h2>
          <p className="text-sm text-[#8E8E93] mb-4 leading-relaxed">
            在另一台设备上输入相同的用户 ID 即可同步学习进度。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={idInput}
              onChange={e => setIdInput(e.target.value)}
              className="flex-1 px-4 py-3 text-sm bg-[#F7F7F8] rounded-[16px] text-[#111] placeholder-[#9E9EA7] focus:outline-none focus:ring-2 focus:ring-[#17C964]/30 transition-all"
              placeholder="输入你的用户 ID"
            />
            <motion.button
              onClick={handleSetId}
              whileTap={{ scale: 0.96 }}
              className="px-6 py-3 text-sm font-medium text-white bg-[#111] rounded-[16px]"
            >
              应用
            </motion.button>
          </div>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#EFEFEF]">
            <span className="text-xs text-[#8E8E93]">当前 ID:</span>
            <span className="text-xs font-mono text-[#111]">{userId}</span>
          </div>
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

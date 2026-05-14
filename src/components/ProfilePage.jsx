import { useState, useEffect, useCallback } from 'react'
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
    <div className="flex-1 px-4 pt-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">我的</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
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

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>同步状态:</span>
          {synced === true && <span className="text-emerald-500">已同步</span>}
          {synced === false && <span className="text-amber-500">离线</span>}
          {synced === null && <span className="text-gray-400">加载中...</span>}
        </div>
      </div>
    </div>
  )
}
export default ProfilePage

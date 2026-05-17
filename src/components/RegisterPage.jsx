import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

function RegisterPage({ onSwitchToLogin }) {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) {
      setError('请输入用户名')
      return
    }
    if (username.trim().length < 2) {
      setError('用户名至少2个字符')
      return
    }
    if (password.length < 6) {
      setError('密码至少6位')
      return
    }
    if (password !== confirmPassword) {
      setError('两次密码输入不一致')
      return
    }
    setLoading(true)
    try {
      await register(username.trim(), password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F8] flex flex-col">
      {/* Top decorative area */}
      <div className="pt-20 pb-10 px-5 flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#17C964] to-[#12A554] shadow-[0_8px_30px_rgba(23,201,100,0.3)] flex items-center justify-center mb-5"
        >
          <span className="text-3xl font-bold text-white">雅</span>
        </motion.div>
        <h1 className="text-3xl font-bold text-[#111]">创建账号</h1>
        <p className="text-sm text-[#8E8E93] mt-2">注册后可在多设备同步学习数据</p>
      </div>

      {/* Register form */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="flex-1 px-5"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1.5 ml-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="2-20个字符"
              autoCapitalize="none"
              autoCorrect="off"
              className="w-full px-5 py-4 text-base bg-white rounded-[20px] text-[#111] placeholder-[#9E9EA7] focus:outline-none focus:ring-2 focus:ring-[#17C964]/30 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1.5 ml-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-5 py-4 text-base bg-white rounded-[20px] text-[#111] placeholder-[#9E9EA7] focus:outline-none focus:ring-2 focus:ring-[#17C964]/30 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1.5 ml-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-5 py-4 text-base bg-white rounded-[20px] text-[#111] placeholder-[#9E9EA7] focus:outline-none focus:ring-2 focus:ring-[#17C964]/30 transition-all shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="text-sm text-red-500 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 text-base font-semibold text-white bg-gradient-to-r from-[#17C964] to-[#12A554] rounded-[20px] shadow-[0_8px_24px_rgba(23,201,100,0.35)] disabled:opacity-50 transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                注册中...
              </span>
            ) : (
              '注册'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-sm text-[#17C964] font-medium"
          >
            已有账号？<span className="underline">立即登录</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default RegisterPage

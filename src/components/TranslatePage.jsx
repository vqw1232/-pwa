import { useState, useCallback } from 'react'

function hasChinese(text) {
  return /[一-鿿]/.test(text)
}

function TranslatePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const translate = useCallback(async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult('')
    setCopied(false)

    const toZh = !hasChinese(input.trim())
    const langpair = toZh ? 'en|zh-CN' : 'zh-CN|en'

    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(input.trim())}&langpair=${langpair}`
      )
      const data = await res.json()
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        setResult(data.responseData.translatedText)
      } else {
        setError('翻译失败，请稍后重试')
      }
    } catch {
      setError('网络错误，请检查连接后重试')
    } finally {
      setLoading(false)
    }
  }, [input])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      translate()
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="shrink-0 px-4 pt-4 pb-2">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">翻译</h2>
          <p className="text-xs text-gray-400 mb-3">
            {input.trim() && !hasChinese(input.trim())
              ? '英 → 中'
              : input.trim() && hasChinese(input.trim())
              ? '中 → 英'
              : '自动识别语言方向'}
          </p>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4">
        <div className="max-w-md mx-auto flex flex-col h-full">
          {/* Input area */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); setCopied(false) }}
              onKeyDown={handleKeyDown}
              placeholder="输入要翻译的文本..."
              className="w-full h-28 resize-none text-base text-gray-900 placeholder-gray-300 focus:outline-none leading-relaxed"
            />
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-300">{input.length} 字符</span>
              <button
                onClick={translate}
                disabled={loading || !input.trim()}
                className={`px-6 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
                  loading || !input.trim()
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700'
                }`}
              >
                {loading ? '翻译中...' : '翻译'}
              </button>
            </div>
          </div>

          {/* Result area */}
          {(result || error) && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              {error ? (
                <p className="text-sm text-red-500">{error}</p>
              ) : (
                <>
                  <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                    {result}
                  </p>
                  <div className="flex justify-end mt-3 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        copied
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? '已复制' : '复制'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Hint */}
          <p className="text-xs text-gray-300 text-center pb-2">
            支持中英互译 · Ctrl+Enter 快速翻译
          </p>
        </div>
      </div>
    </div>
  )
}
export default TranslatePage

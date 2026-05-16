import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WordPopover({ word, phonetic, meaning, rect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const close = () => onClose()
    const timer = setTimeout(() => {
      document.addEventListener('click', close)
      document.addEventListener('scroll', close, true)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', close)
      document.removeEventListener('scroll', close, true)
    }
  }, [onClose])

  const pw = 260
  let top = rect.bottom + 10
  let left = rect.left + rect.width / 2
  let arrowClass = ''

  if (top + 140 > window.innerHeight - 36) {
    top = rect.top - 10
    arrowClass = 'bottom-full'
  }

  if (left - pw / 2 < 16) left = pw / 2 + 16
  if (left + pw / 2 > window.innerWidth - 16) left = window.innerWidth - pw / 2 - 16

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.94 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      onClick={e => e.stopPropagation()}
      className="fixed z-50 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] px-5 py-4"
      style={{ top, left, width: pw, transform: 'translateX(-50%)', maxWidth: 'calc(100vw - 32px)' }}
    >
      {arrowClass !== '' && (
        <div className={`absolute left-1/2 -translate-x-1/2 ${arrowClass === 'bottom-full' ? 'bottom-full' : ''}`}>
          <div className={`w-0 h-0 border-l-8 border-r-8 ${arrowClass === 'bottom-full' ? 'border-t-8 border-t-white border-l-transparent border-r-transparent' : 'border-b-8 border-b-white border-l-transparent border-r-transparent'}`} />
        </div>
      )}
      <p className="text-lg font-bold text-[#111] leading-tight">{word}</p>
      {phonetic && <p className="text-sm text-[#8E8E93] mt-0.5">{phonetic}</p>}
      <div className="h-px bg-[#EFEFEF] my-2.5" />
      <p className="text-sm text-[#555] leading-relaxed">{meaning}</p>
    </motion.div>
  )
}

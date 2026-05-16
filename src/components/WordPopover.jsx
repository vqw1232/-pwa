import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export default function WordPopover({ word, phonetic, meaning, rect, onClose }) {
  const ref = useRef(null)
  const isNotFound = meaning === '未收录'

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

  if (top + 140 > window.innerHeight - 36) {
    top = rect.top - 10
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
      <p className="text-lg font-bold text-[#111] leading-tight">{word}</p>
      {!isNotFound && phonetic && (
        <p className="text-sm text-[#8E8E93] mt-0.5">{phonetic}</p>
      )}
      <div className="h-px bg-[#EFEFEF] my-2.5" />
      {isNotFound ? (
        <p className="text-sm text-[#B0B0B8] leading-relaxed">暂未收录该词</p>
      ) : (
        <p className="text-sm text-[#555] leading-relaxed">{meaning}</p>
      )}
    </motion.div>
  )
}

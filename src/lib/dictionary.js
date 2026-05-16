import words from '../data/ielts_words.json'

const dict = new Map()
words.forEach(w => {
  dict.set(w.word.toLowerCase(), {
    word: w.word,
    phonetic: w.phonetic || '',
    meaning: w.meaning || '',
  })
})

export function lookupWord(text) {
  return dict.get(text.toLowerCase()) || null
}

const translateCache = new Map()

export async function lookupWordAsync(text) {
  const lower = text.toLowerCase()

  const local = dict.get(lower)
  if (local) return local

  if (translateCache.has(lower)) return translateCache.get(lower)

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(lower)}&langpair=en|zh-CN`
    )
    if (!res.ok) return null
    const data = await res.json()
    const meaning = data?.responseData?.translatedText
    if (!meaning || meaning === lower) return null
    const entry = {
      word: text,
      phonetic: '',
      meaning,
    }
    translateCache.set(lower, entry)
    return entry
  } catch {
    return null
  }
}

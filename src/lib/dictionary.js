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

const apiCache = new Map()

export async function lookupWordAsync(text) {
  const lower = text.toLowerCase()

  const local = dict.get(lower)
  if (local) return local

  if (apiCache.has(lower)) return apiCache.get(lower)

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(lower)}`
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.[0]) return null
    const entry = {
      word: data[0].word,
      phonetic: data[0].phonetic || data[0].phonetics?.[0]?.text || '',
      meaning: data[0].meanings?.[0]?.definitions?.[0]?.definition || '释义暂无',
    }
    apiCache.set(lower, entry)
    return entry
  } catch {
    return null
  }
}

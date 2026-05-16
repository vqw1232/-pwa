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

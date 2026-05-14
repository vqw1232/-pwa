const fs = require('fs')
const path = require('path')

function parseNdjson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n').filter(l => l.trim())
  const words = []

  for (const line of lines) {
    try {
      const obj = JSON.parse(line)
      const headWord = obj.headWord || obj.content?.word?.wordHead
      if (!headWord) continue

      const wordData = obj.content?.word?.content || obj.content?.word || {}
      const trans = wordData.trans || []
      const meaning = trans.map(t => t.tranCn).filter(Boolean).join('；') || ''

      const sentences = wordData.sentence?.sentences || []
      const firstSentence = sentences[0]
      const example = firstSentence ? (firstSentence.sContent || '') : ''
      const exampleCn = firstSentence ? (firstSentence.sCn || '') : ''

      const usphone = wordData.usphone || ''
      const ukphone = wordData.ukphone || ''
      const phonetic = usphone || ukphone || ''

      words.push({ headWord, phonetic, meaning, example, exampleCn })
    } catch (e) {
      // skip malformed lines
    }
  }

  return words
}

// Parse all source files
const dir = 'C:/Users/25413/Desktop/新建文件夹'
const files = [
  path.join(dir, 'sources/1521164666922_IELTS_3/IELTS_3.json'),
  path.join(dir, 'sources/1521164657744_IELTS_2/IELTS_2.json'),
  path.join(dir, 'sources/1521164624473_IELTSluan_2/IELTSluan_2.json'),
  path.join(dir, 'sources/1521164640451_TOEFL_2/TOEFL_2.json'),
  path.join(dir, 'sources/1521164667985_TOEFL_3/TOEFL_3.json'),
]

let allWords = []
for (const f of files) {
  const w = parseNdjson(f)
  console.log(`${path.basename(f)}: ${w.length} words`)
  allWords = allWords.concat(w)
}

// Deduplicate by headWord (case-insensitive)
const seen = new Set()
const unique = []
for (const w of allWords) {
  const key = w.headWord.toLowerCase()
  if (!seen.has(key)) {
    seen.add(key)
    unique.push(w)
  }
}
console.log(`\nTotal unique: ${unique.length}`)

// Shuffle
for (let i = unique.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [unique[i], unique[j]] = [unique[j], unique[i]]
}

// Assign IDs and format
// outDir = dir (defined above)
const output = unique.map((w, idx) => ({
  id: idx + 1,
  word: w.headWord,
  phonetic: w.phonetic,
  meaning: w.meaning || '',
  example: w.example || '',
  exampleCn: w.exampleCn || '',
}))

fs.writeFileSync(
  path.join(dir, 'src/data/ielts_words.json'),
  JSON.stringify(output, null, 2)
)

// Stats
const withEx = output.filter(w => w.example).length
const withExCn = output.filter(w => w.exampleCn).length
console.log(`\nSaved ${output.length} words to src/data/ielts_words.json`)
console.log(`With example: ${withEx}, With exampleCn: ${withExCn}`)
console.log('Sample:', output.slice(0, 5).map(w => `${w.word} | ${w.example} → ${w.exampleCn}`).join('\n'))

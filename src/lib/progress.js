import { supabase, getUserId } from './supabase'

export async function loadProgress() {
  const userId = getUserId()
  const { data, error } = await supabase
    .from('user_progress')
    .select('word_id, correct_count, wrong_count')
    .eq('user_id', userId)

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') {
      console.warn('user_progress table not found. Run supabase_setup.sql in Supabase Dashboard > SQL Editor.')
    } else {
      console.error('Failed to load progress:', error.message)
    }
    return {}
  }

  const map = {}
  for (const row of data) {
    map[row.word_id] = { correct: row.correct_count, wrong: row.wrong_count }
  }
  return map
}

export async function saveProgress(wordId, known) {
  const userId = getUserId()

  const { data: existing } = await supabase
    .from('user_progress')
    .select('correct_count, wrong_count')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .single()

  const correct = (existing?.correct_count ?? 0) + (known ? 1 : 0)
  const wrong = (existing?.wrong_count ?? 0) + (known ? 0 : 1)

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      word_id: wordId,
      correct_count: correct,
      wrong_count: wrong,
      last_reviewed_at: new Date().toISOString(),
    }, { onConflict: 'user_id, word_id' })

  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') {
      console.warn('user_progress table not found. Progress not saved to cloud.')
      return false
    }
    console.error('Failed to save progress:', error.message)
    return false
  }
  return true
}

import { api } from './api'

export async function loadProgress() {
  try {
    return await api.loadProgress()
  } catch (err) {
    console.warn('Failed to load progress:', err.message)
    return {}
  }
}

export async function saveProgress(wordId, known) {
  try {
    return await api.saveProgress(wordId, known)
  } catch (err) {
    console.warn('Failed to save progress:', err.message)
    return false
  }
}

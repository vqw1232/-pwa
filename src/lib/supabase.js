import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hwxvvaklrcdcnmrtihqk.supabase.co'
const supabaseAnonKey = 'sb_publishable_jdBp8kmyno86DTyWvjqO7A_8k72LzIY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getUserId() {
  let id = localStorage.getItem('ielts_user_id')
  if (!id) {
    id = crypto.randomUUID().slice(0, 8)
    localStorage.setItem('ielts_user_id', id)
  }
  return id
}

export function setUserId(id) {
  if (id && id.trim()) {
    localStorage.setItem('ielts_user_id', id.trim())
    return true
  }
  return false
}

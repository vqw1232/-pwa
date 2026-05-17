import { Router } from 'express'
import { query, sql } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// GET /api/progress — load all progress for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT word_id, correct_count, wrong_count FROM user_progress WHERE user_id = @userId',
      { userId: sql.Int, userId: req.user.id }
    )

    const map = {}
    for (const row of result.recordset) {
      map[row.word_id] = { correct: row.correct_count, wrong: row.wrong_count }
    }
    res.json(map)
  } catch (err) {
    console.error('Load progress error:', err)
    res.status(500).json({ error: '加载进度失败' })
  }
})

// POST /api/progress — save progress for a word
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { word_id, known } = req.body

    if (word_id == null || known == null) {
      return res.status(400).json({ error: '缺少 word_id 或 known' })
    }

    // Try to get existing
    const existing = await query(
      'SELECT correct_count, wrong_count FROM user_progress WHERE user_id = @userId AND word_id = @wordId',
      {
        userId: sql.Int, wordId: sql.Int,
        userId: req.user.id, wordId: word_id,
      }
    )

    const current = existing.recordset[0]
    const correct = (current?.correct_count ?? 0) + (known ? 1 : 0)
    const wrong = (current?.wrong_count ?? 0) + (known ? 0 : 1)

    await query(
      `MERGE user_progress AS target
       USING (SELECT @userId AS user_id, @wordId AS word_id) AS source
       ON target.user_id = source.user_id AND target.word_id = source.word_id
       WHEN MATCHED THEN
         UPDATE SET correct_count = @correct, wrong_count = @wrong, last_reviewed_at = GETDATE()
       WHEN NOT MATCHED THEN
         INSERT (user_id, word_id, correct_count, wrong_count)
         VALUES (@userId, @wordId, @correct, @wrong);`,
      {
        userId: sql.Int, wordId: sql.Int,
        correct: sql.Int, wrong: sql.Int,
        userId: req.user.id, wordId: word_id,
        correct, wrong,
      }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('Save progress error:', err)
    res.status(500).json({ error: '保存进度失败' })
  }
})

export default router

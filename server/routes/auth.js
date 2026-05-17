import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, sql } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    if (username.length < 2 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度应在2-20个字符之间' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' })
    }

    // Check if username exists
    const existing = await query(
      'SELECT id FROM users WHERE username = @username',
      { username: sql.NVarChar(50), username }
    )
    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: '用户名已被注册' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await query(
      'INSERT INTO users (username, password_hash) OUTPUT INSERTED.id VALUES (@username, @passwordHash)',
      {
        username: sql.NVarChar(50),
        passwordHash: sql.NVarChar(255),
        username,
        passwordHash,
      }
    )

    const userId = result.recordset[0].id
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '30d' })

    res.json({ token, user: { id: userId, username } })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: '注册失败，请稍后重试' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const result = await query(
      'SELECT id, username, password_hash FROM users WHERE username = @username',
      { username: sql.NVarChar(50), username }
    )

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const user = result.recordset[0]
    const valid = await bcrypt.compare(password, user.password_hash)

    if (!valid) {
      return res.status(401).json({ error: '用户名或密码错误' })
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' })

    res.json({ token, user: { id: user.id, username: user.username } })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: '登录失败，请稍后重试' })
  }
})

// GET /api/auth/me — verify token and return user info
router.get('/me', async (req, res) => {
  // Use the auth middleware
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    res.json({ user: { id: decoded.id, username: decoded.username } })
  } catch {
    res.status(401).json({ error: '登录已过期' })
  }
})

export default router

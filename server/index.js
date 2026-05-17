import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import authRouter from './routes/auth.js'
import progressRouter from './routes/progress.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/progress', progressRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

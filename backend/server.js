import 'dotenv/config'
import app from './src/app.js'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`[huby] API running on http://localhost:${PORT}`)
  console.log(`[huby] Health check: http://localhost:${PORT}/api/health`)
})

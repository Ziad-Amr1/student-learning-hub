import 'dotenv/config'
import { initDatabase } from './src/db/init.js'
import app from './src/app.js'

const PORT = process.env.PORT || 5000

// Open the SQLite database and apply pending schema migrations before serving.
initDatabase()

app.listen(PORT, () => {
  console.log(`[huby] API running on http://localhost:${PORT}`)
  console.log(`[huby] Health check: http://localhost:${PORT}/api/health`)
})

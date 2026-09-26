import 'dotenv/config'
import { initDatabase } from './src/db/init.js'
import { runLegacyJsonMigration } from './src/db/legacyMigration.js'
import app from './src/app.js'

const PORT = process.env.PORT || 5000

// Startup order (S2 contract): open the SQLite database and apply pending
// schema migrations, then migrate the legacy JSON domain files into it. The
// server must NOT listen until the database is fully migrated and verified —
// a failed migration refuses to start rather than serving incomplete data.
initDatabase()
try {
  runLegacyJsonMigration()
} catch (error) {
  console.error('[huby] Legacy JSON → SQLite migration FAILED — refusing to start.')
  console.error(error.message)
  process.exit(1)
}

app.listen(PORT, () => {
  console.log(`[huby] API running on http://localhost:${PORT}`)
  console.log(`[huby] Health check: http://localhost:${PORT}/api/health`)
})

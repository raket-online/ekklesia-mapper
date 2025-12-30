import 'dotenv/config'
import { db } from '../src/lib/db'
import * as schema from '../src/lib/schema'
import { writeFileSync } from 'fs'
import { eq } from 'drizzle-orm'

async function backupDatabase() {
  console.log('🔄 Starting database backup...')

  try {
    // Backup all tables
    const [users, accounts, sessions, churches, userMetrics, settings] = await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.account),
      db.select().from(schema.sessions),
      db.select().from(schema.churches),
      db.select().from(schema.userMetrics),
      db.select().from(schema.settings),
    ])

    const backup = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        accounts,
        sessions,
        churches,
        userMetrics,
        settings,
      }
    }

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    writeFileSync(filename, JSON.stringify(backup, null, 2))

    console.log('✅ Backup created successfully!')
    console.log(`📁 File: ${filename}`)
    console.log(`📊 Statistics:`)
    console.log(`   - Users: ${users.length}`)
    console.log(`   - Accounts: ${accounts.length}`)
    console.log(`   - Sessions: ${sessions.length}`)
    console.log(`   - Churches: ${churches.length}`)
    console.log(`   - Metrics: ${userMetrics.length}`)
    console.log(`   - Settings: ${settings.length}`)
  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

backupDatabase()

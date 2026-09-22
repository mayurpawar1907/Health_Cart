import { query, closePool } from '../src/config/database.js'

const tables = await query('SHOW TABLES')
console.log('table count', tables.length)
for (const t of tables) {
  const name = Object.values(t)[0]
  const rows = await query(`SELECT COUNT(*) AS c FROM \`${name}\``)
  console.log(`${name}: ${rows[0].c}`)
}
await closePool()

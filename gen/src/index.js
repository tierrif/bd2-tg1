import mssql from 'mssql'
import config from '../config.json' assert { type: 'json' }
import promptSync from 'prompt-sync'
import { inject, registrations } from './injection-manager.js'

const reg = await registrations()

const prompt = promptSync({ sigint: true })

const dbConfig = config.dbConfig

console.info('Welcome to the data generator. Connecting to SQL Server...\n')

mssql.connect(dbConfig, async (err) => {
  const pool = new mssql.ConnectionPool(dbConfig)
  await pool.connect()
  
  if (err) {
    console.error(err)
  } else {
    console.info('Connected to the SQL Server database.')
  }

  let answer = 'null'
  while (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'n' && answer.toLowerCase() !== '') {
    answer = prompt('Drop all data and generate new? (y/N) ')
    if (answer.toLowerCase() === 'y') {
      console.info('Dropping all data...')
      let now = new Date().getTime()
  
      for (const r of reg.reverse()) {
        if (r.enabled) {
          for (const tableName of r.tableNames) {
            const request = new mssql.Request()
            request.input('tableName', mssql.VarChar, tableName)
            await request.query(`
            ALTER TABLE ${tableName} NOCHECK CONSTRAINT ALL
            DELETE FROM ${tableName}
            ALTER TABLE ${tableName} WITH CHECK CHECK CONSTRAINT ALL
            IF (OBJECTPROPERTY(OBJECT_ID(@tableName), 'TableHasIdentity') = 1) DBCC CHECKIDENT (@tableName, RESEED, 0)
          `)
          }
        }
      }

      console.info(`\nData successfully dropped in ${new Date().getTime() - now}ms.`)
      console.info('Generating new data...\n')
      now = new Date().getTime()
      await inject(reg.reverse())
  
      console.info(`\nData successfully generated in ${new Date().getTime() - now}ms.`)
    }
  }

  if (answer.toLowerCase() !== 'y') console.info('\nAborted.')
})

import mssql from 'mssql'
import config from '../config.json' assert { type: 'json' }
import promptSync from 'prompt-sync'
import { inject } from './injection-manager.js'

const prompt = promptSync({ sigint: true })

const dbConfig = config.dbConfig

console.info('Welcome to the data generator. Connecting to SQL Server...\n')

mssql.connect(dbConfig, async (err) => {
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
  
      const request = new mssql.Request()
      await request.query(`
        EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
        
        EXEC sp_MSForEachTable 'DELETE FROM ?'
        
        EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'
  
        EXEC sp_MSForEachTable 'IF (OBJECTPROPERTY(OBJECT_ID(''?''), ''TableHasIdentity'') = 1) DBCC CHECKIDENT (''?'', RESEED, 0)'
      `)
      console.info(`\nData successfully dropped in ${new Date().getTime() - now}ms.`)
      console.info('Generating new data...\n')
      now = new Date().getTime()
      await inject()
  
      console.info(`\nData successfully generated in ${new Date().getTime() - now}ms.`)
    }
  }

  if (answer.toLowerCase() !== 'y') console.info('\nAborted.')
})

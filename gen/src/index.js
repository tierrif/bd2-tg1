const sql = require('mssql')
const prompt = require('prompt-sync')({ sigint: true })
const inject = require('./injection-manager')

const config = {
  user: 'server',
  password: 'server',
  server: 'localhost',
  database: 'tg1',
  trustServerCertificate: true
}

console.info('Welcome to the data generator. Connecting to SQL Server...\n')

sql.connect(config, async (err) => {
  if (err) {
    console.error(err)
  } else {
    console.info('Connected to the SQL Server database.')
  }

  const answer = prompt('Drop all data and generate new? (y/N) ')
  if (answer.toLowerCase() === 'y') {
    console.info('Dropping all data...')
    let now = new Date().getTime()

    const request = new sql.Request()
    await request.query(`
      EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'
      
      EXEC sp_MSForEachTable 'DELETE FROM ?'
      
      EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'

      EXEC sp_MSForEachTable 'IF (OBJECTPROPERTY(OBJECT_ID(''?''), ''TableHasIdentity'') = 1) DBCC CHECKIDENT (''?'', RESEED, 0)'
    `)

    console.info(`\nData successfully dropped in ${new Date().getTime() - now}ms.`)
    console.info('Generating new data...\n')
    now = new Date().getTime()

    await inject(sql)

    console.info(`\nData successfully generated in ${new Date().getTime() - now}ms.`)
  } else {
    console.info('\nAborted.')
  }
})

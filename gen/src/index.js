const sql = require('mssql')

const config = {
  user: 'server',
  password: 'server',
  server: 'localhost',
  database: 'tg1',
  trustServerCertificate: true
}

sql.connect(config, err => {
  if (err) {
    console.log(err)
  } else {
    console.log('Connected')
  }
})

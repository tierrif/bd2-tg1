const fs = require('fs')

module.exports = async (sql) => {
  const rawFiles = fs.readdirSync('./src/io')
  const files = rawFiles.filter((file) => file.endsWith('.js'))
    .map((file) => file.replace('.js', ''))
    .sort((a, b) => a - b)
    .map((file) => require(`./io/${file}`))
    
  for (const module of files) {
    await module.inject(sql)
  }
}
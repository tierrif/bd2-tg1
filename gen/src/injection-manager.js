const fs = require('fs')

module.exports = async (sql) => {
  const files = fs.readdirSync('./src/io')
  await Promise.all(files.map((file) => file.replace('.js', ''))
    .map((file) => require(`./io/${file}`))
    .map(async (module) => await module.inject(sql)))
}
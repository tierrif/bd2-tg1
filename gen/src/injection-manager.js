const fs = require('fs')
const engine = require('./insertion-engine')
const { threadAmount } = require('../config.json')

module.exports = {
  async inject() {
    const registrations = this.registrations()
    for (let i = 0; i < registrations.length; i++) {
      await engine.inject(i + 1, registrations.length, registrations[i].type, threadAmount)
    }
  },
  registrations() {
    const rawFiles = fs.readdirSync('./src/io')
    const files = rawFiles.filter((file) => file.endsWith('.js'))
      .map((file) => file.replace('.js', ''))
      .sort((a, b) => a - b)
      .map((file) => ({ fileName: file, mod: require(`./io/${file}`) }))

    return files.map(({ fileName, mod }) => ({ 
      type: fileName, // Tipo de dados a serem inseridos.
      insert: mod.insert, // Função que insere os dados.
      multithread: mod.multithread, // Se a inserção é feita em vários threads e automaticamente.
      amountOfDataToInsert: mod.amountOfDataToInsert, // Quantidade de dados a serem inseridos.
      iterableDataStatement: mod.iterableDataStatement, // Statement que buscará dados que serão iterados para inserção.
      iterableDataPrimaryKey: mod.iterableDataPrimaryKey, // Chave primária da tabela que será iterada.
    }))
  },
}


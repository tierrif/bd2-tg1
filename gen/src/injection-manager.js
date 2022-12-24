import { readdirSync } from 'fs'
import { inject as _inject } from './insertion-engine.js'
import config from '../config.json' assert { type: 'json' }

export async function inject(reg) {
  for (let i = 0; i < reg.length; i++) {
    await _inject(i + 1, reg.length, reg[i].type, config.threadAmount)
  }
}

export async function registrations() {
  const rawFiles = readdirSync('./src/io')
  const files = (await Promise.all(rawFiles.filter((file) => file.endsWith('.js'))
    .sort((a, b) => a - b)
    .map(async (file) => ({ fileName: file, mod: await import(`./io/${file}`) }))
  )).filter((file) => file.mod.enabled)

  return files.map(({ fileName, mod }) => ({
    type: fileName,
    insert: mod.insert,
    multithread: mod.multithread,
    insertSinglethread: mod.insertSinglethread,
    amountOfDataToInsert: mod.amountOfDataToInsert,
    iterableDataStatement: mod.iterableDataStatement,
    iterableDataPrimaryKey: mod.iterableDataPrimaryKey, // Chave primária da tabela que será iterada.
  }))
}

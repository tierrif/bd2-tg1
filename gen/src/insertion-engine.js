import { Worker, isMainThread, workerData, parentPort } from 'node:worker_threads'
import config from '../config.json' assert { type: 'json' }
import { fileURLToPath } from 'url'
import mssql from 'mssql'
import { registrations } from './injection-manager.js'

const dbConfig = config.dbConfig

export let inject

export const getIndex = (type) => {
  return parseInt(type.split('-')[0])
}

if (isMainThread) {
  inject = (j, total, type, workerAmount) => {
    const now = new Date().getTime()
    return new Promise((resolve) => {
      if (getIndex(type) > 1) {
        process.stdout.write(`\r(${j}/${total}) Generating ${_formatFileName(type)}...                                    `)
      }
      const workers = new Array(workerAmount)
      let workersFinished = 0
      for (let i = 0; i < workers.length; i++) {
        const currentWorker = i
        workers[i] = new Worker(fileURLToPath(import.meta.url), { workerData: { i, workerAmount, type, total }, argv: process.argv })
        const onDone = () => {
          process.stdout.write(`\r(${j}/${total}) Generating ${_formatFileName(type)}... Done in ${new Date().getTime() - now}ms.                                          \n`)
          workers.forEach((worker) => worker.terminate())
          resolve()
        }
        workers[i].on('error', (error) => {
          console.error(error)
        })
        workers[i].on('exit', (code) => {
          if (code !== 0) return console.error((`Worker ${currentWorker} stopped with exit code ${code}.`))
          else workersFinished++
          if (workersFinished === workers.length) onDone()
        })
        workers[i].on('message', (message) => {
          if (message === 'start') workers.forEach((worker) => worker.postMessage('start'))
        })
      }
    })
  }
} else {
  inject = null
  const manager = await registrations()

  let pool
  mssql.connect(dbConfig).then(async () => {
    pool = new mssql.ConnectionPool(dbConfig)
    await pool.connect()

    const { i, workerAmount, type, total } = workerData
    const registration = manager.find((r) => r.type === type)

    if (!registration.multithread) {
      // Inserção feita apenas no thread 0.
      if (i === 0) registration.insert(mssql, pool, getIndex(type), total, parentPort).then(() => process.exit(0))
      else process.exit(0)

      return
    }

    if (registration.insertSinglethread) {
      // Inserção feita apenas no thread 0 antes da inserção multithread.
      if (i === 0) {
        await registration.insertSinglethread(mssql, pool, getIndex(type), total)
        // Tell the other threads to start.
        parentPort.postMessage('start')
      } else {
        // Wait for the first thread to finish.
        await new Promise((resolve) => {
          parentPort.on('message', (message) => {
            if (message === 'start') resolve()
          })
        })
      }
    }

    let totalData
    let set
    if (registration.iterableDataStatement) {
      const request = new mssql.Request(pool)
      // Inserção feita por statement iterável.
      set = (await request.query(registration.iterableDataStatement)).recordset
      totalData = set.length
    } else {
      // Inserção simples.
      totalData = registration.amountOfDataToInsert
    }

    const dataPerWorker = Math.floor(totalData / workerAmount)
    const start = i * dataPerWorker
    const end = Math.min(start + dataPerWorker, totalData)
    let compensation = 0
    if (i === workerAmount - 1) {
      compensation = totalData % workerAmount
    }
    
    for (let j = start; j < end + compensation; j++) {
      const pKey = registration.iterableDataPrimaryKey
      await registration.insert(mssql, pool, pKey
        ? set?.[j]?.[registration.iterableDataPrimaryKey]
        : set?.[j])
    }

    process.exit(0)
  })
}

const _formatFileName = (type) => {
  return type.split('-').slice(1).join('-').replace(/-/g, ' ')
    .split(' ')
    .join(' ')
    .replace('.js', '')
}
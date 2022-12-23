const { Worker, isMainThread, workerData } = require('node:worker_threads')
const { dbConfig } = require('../config.json')

if (isMainThread) {
  module.exports = {
    async inject(j, total, type, workerAmount) {
      return new Promise((resolve) => {
        process.stdout.write(`\r(${j}/${total}) Generating ${_formatFileName(type)}...                                    `)
        const workers = new Array(workerAmount)
        let workersFinished = 0
        for (let i = 0; i < workers.length; i++) {
          const currentWorker = i
          workers[i] = new Worker(__filename, { workerData: { i, workerAmount, type, total } })
          const onDone = () => {
            process.stdout.write(`\r(${j}/${total}) Generating ${_formatFileName(type)}... Done.                                          `)
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
        }
      })
    }
  }
} else {
  const mssql = require('mssql')
  const { registrations } = require('./injection-manager')
  const manager = registrations()

  let pool
  mssql.connect(dbConfig).then(async () => {
    pool = new mssql.ConnectionPool(dbConfig)
    await pool.connect()

    const { i, workerAmount, type, total } = workerData
    const registration = manager.find((r) => r.type === type)
    if (!registration.multithread) {
      // Inserção feita apenas no thread 0.
      if (i === 0) registration.insert(mssql, pool, _getIndex(type), total).then(() => process.exit(0))
      else process.exit(0)

      return
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
      await registration.insert(mssql, pool, set?.[j]?.[registration.iterableDataPrimaryKey])
    }

    process.exit(0)
  })
}

const _formatFileName = (type) => {
  return type.split('-').slice(1).join('-').replace(/-/g, ' ')
    .split(' ')
    .join(' ')
}

const _getIndex = (type) => {
  return parseInt(type.split('-')[0])
}
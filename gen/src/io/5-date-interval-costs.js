export const multithread = true

export const enabled = false

export const amountOfDataToInsert = 5000

export const tableNames = ['HighFrequency.DateIntervalCost']

export const insert = async (mssql, pool) => {
  const request = new mssql.Request(pool)

  const housing = (await request.query('SELECT TOP 1 housingId, defaultCost FROM General.Housing ORDER BY NEWID()')).recordset[0]
  const housingId = parseInt(housing.housingId)
  request.input('housingId', mssql.Int, housingId)

  const costPerNight = housing.defaultCost + (Math.floor(Math.random() * 200) + 10)

  // Futura data aleatória.
  const dateFrom = new Date(new Date().getTime() + Math.random() * daysToMilliseconds(365))
  const dateTo = new Date(dateFrom.getTime() + (Math.random() * daysToMilliseconds(14)) + daysToMilliseconds(1))

  request.input('dateFrom', mssql.DateTime, dateFrom)
  request.input('dateTo', mssql.DateTime, dateTo)
  request.input('costPerNight', mssql.Int, costPerNight)

  await request.query(`INSERT INTO HighFrequency.DateIntervalCost (housingId, dateFrom, dateTo, costPerNight)
    VALUES (@housingId, @dateFrom, @dateTo, @costPerNight)`)
}

const daysToMilliseconds = (days) => {
  return days * 1000 * 60 * 60 * 24
}

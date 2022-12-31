export const multithread = true

export const enabled = false

export const amountOfDataToInsert = 5000

export const tableNames = ['HighFrequency.Reservation']

export const insert = async (mssql, pool) => {
  const request = new mssql.Request(pool)

  const { siteUserId: clientUserId } = (await request.query(
    'SELECT TOP 1 siteUserId FROM General.SiteUser WHERE isHost = 0 ORDER BY NEWID()')).recordset[0]
  const housing = (await request.query('SELECT TOP 1 housingId FROM General.Housing ORDER BY NEWID()')).recordset[0]
  const housingId = parseInt(housing.housingId)
  request.input('housingId', mssql.Int, housingId)
  const { roomId, maxGuestCount } = (await request.query(
    'SELECT TOP 1 roomId, maxGuestCount FROM General.Room WHERE housingId = @housingId ORDER BY NEWID()')).recordset[0]
  const guestCount = Math.floor(Math.random() * maxGuestCount) + 1
  request.input('guestCount', mssql.TinyInt, guestCount)

  // Futura data aleatória.
  const dateFrom = new Date(new Date().getTime() + Math.random() * daysToMilliseconds(365))
  const dateTo = new Date(dateFrom.getTime() + (Math.random() * daysToMilliseconds(14)) + daysToMilliseconds(1))

  request.input('clientUserId', mssql.Int, clientUserId)
  request.input('roomId', mssql.Int, roomId)
  request.input('dateFrom', mssql.DateTime, dateFrom)
  request.input('dateTo', mssql.DateTime, dateTo)

  await request.query(`INSERT INTO HighFrequency.Reservation (housingId, clientUserId, roomId, dateFrom, dateTo, guestCount) 
        VALUES (@housingId, @clientUserId, @roomId, @dateFrom, @dateTo, @guestCount)`)
}

const daysToMilliseconds = (days) => {
  return days * 1000 * 60 * 60 * 24
}

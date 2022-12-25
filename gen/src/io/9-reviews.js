import { loremIpsum } from "lorem-ipsum"

export const multithread = true

export const enabled = false

export const iterableDataStatement = `SELECT Reservation.reservationId, 
  Housing.hostUserId, Reservation.clientUserId, Reservation.housingId
    FROM Reservation INNER JOIN Housing ON Reservation.housingId = Housing.housingId`

export const insert = async (mssql, pool, reservation) => {
  // Insert into both HostUserReview and ClientUserReview.
  const psHost = new mssql.PreparedStatement(pool)
  psHost.input('housingId', mssql.Int)
  psHost.input('hostUserId', mssql.Int)
  psHost.input('authorClientId', mssql.Int)
  psHost.input('title', mssql.NVarChar)
  psHost.input('description', mssql.NVarChar)
  psHost.input('ratingValue', mssql.TinyInt)
  psHost.input('visible', mssql.Bit)

  await psHost.prepare(`INSERT INTO HostUserReview (housingId, hostUserId, authorClientId, title, description, ratingValue, visible)
    VALUES (@housingId, @hostUserId, @authorClientId, @title, @description, @ratingValue, @visible)`)

  const psClient = new mssql.PreparedStatement(pool)
  psClient.input('authorHostId', mssql.Int)
  psClient.input('clientUserId', mssql.Int)
  psClient.input('title', mssql.NVarChar)
  psClient.input('description', mssql.NVarChar)
  psClient.input('ratingValue', mssql.TinyInt)
  psClient.input('visible', mssql.Bit)

  await psClient.prepare(`INSERT INTO ClientUserReview (authorHostId, clientUserId, title, description, ratingValue, visible)
    VALUES (@authorHostId, @clientUserId, @title, @description, @ratingValue, @visible)`)

  const title = loremIpsum({ count: 1, units: 'sentences', sentenceLowerBound: 2, sentenceUpperBound: 5 })
  const description = loremIpsum({ count: 1, units: 'paragraphs', paragraphLowerBound: 3, paragraphUpperBound: 7 })
  const ratingValue = Math.floor(Math.random() * 5) + 1
  
  await psHost.execute({
    housingId: reservation.housingId,
    hostUserId: reservation.hostUserId,
    authorClientId: reservation.clientUserId,
    title,
    description,
    ratingValue,
    visible: true
  })

  await psClient.execute({
    authorHostId: reservation.hostUserId,
    clientUserId: reservation.clientUserId,
    title,
    description,
    ratingValue,
    visible: true
  })

  psHost.unprepare()
  psClient.unprepare()
}
import { loremIpsum } from "lorem-ipsum"

export const multithread = true

export const enabled = true

export const tableNames = ["Reviews.HostUserReview", "Reviews.ClientUserReview"]

export const iterableDataStatement = `SELECT HighFrequency.Reservation.reservationId, 
  General.Housing.hostUserId, HighFrequency.Reservation.clientUserId, HighFrequency.Reservation.housingId
    FROM HighFrequency.Reservation WITH (NOLOCK) INNER JOIN General.Housing WITH (NOLOCK) ON HighFrequency.Reservation.housingId = General.Housing.housingId`

export const insertSinglethread = async (mssql, pool) => {
  const request = new mssql.Request(pool)
  const set = (await request.query(iterableDataStatement)).recordset
  const totalData = set.length
  for (let i = 0; i < totalData; i++) {
    const reservation = set[i]
    // Insert into both HostUserReview and ClientUserReview.
    const psHost = new mssql.PreparedStatement(pool)
    psHost.input('housingId', mssql.Int)
    psHost.input('hostUserId', mssql.Int)
    psHost.input('authorClientId', mssql.Int)
    psHost.input('title', mssql.NVarChar)
    psHost.input('description', mssql.NVarChar)
    psHost.input('ratingValue', mssql.TinyInt)
    psHost.input('visible', mssql.Bit)

    await psHost.prepare(`SET DEADLOCK_PRIORITY LOW; INSERT INTO Reviews.HostUserReview (housingId, hostUserId, authorClientId, title, description, ratingValue, visible)
    VALUES (@housingId, @hostUserId, @authorClientId, @title, @description, @ratingValue, @visible) OPTION (LOOP JOIN)`)

    const psClient = new mssql.PreparedStatement(pool)
    psClient.input('authorHostId', mssql.Int)
    psClient.input('clientUserId', mssql.Int)
    psClient.input('title', mssql.NVarChar)
    psClient.input('description', mssql.NVarChar)
    psClient.input('ratingValue', mssql.TinyInt)
    psClient.input('visible', mssql.Bit)

    await psClient.prepare(`SET DEADLOCK_PRIORITY LOW; INSERT INTO Reviews.ClientUserReview (authorHostId, clientUserId, title, description, ratingValue, visible)
    VALUES (@authorHostId, @clientUserId, @title, @description, @ratingValue, @visible) OPTION (LOOP JOIN)`)

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
}

export const insert = () => { }

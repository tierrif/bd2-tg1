export const multithread = true

export const enabled = true

export const iterableDataStatement = `SELECT siteUserId FROM SiteUser WHERE isHost = 1`

export const iterableDataPrimaryKey = 'siteUserId'

const paymentMethods = [
  {
    name: 'Credit Card',
    description: 'Credit card payment'
  },
  {
    name: 'PayPal',
    description: 'PayPal payment'
  },
  {
    name: 'IBAN',
    description: 'IBAN payment'
  },
  {
    name: 'Stripe',
    description: 'Stripe payment'
  }
]

export const insertSinglethread = async (mssql, pool) => {
  const ps = new mssql.PreparedStatement(pool)
  ps.input('name', mssql.NVarChar(32))
  ps.input('description', mssql.NVarChar(128))
  await ps.prepare('INSERT INTO PaymentMethod ([name], [description]) VALUES (@name, @description)')

  for (const paymentMethod of paymentMethods) {
    await ps.execute(paymentMethod)
  }

  ps.unprepare()
}

export const insert = async (mssql, pool, hostUserId) => {
  const ps = new mssql.PreparedStatement(pool)
  ps.input('hostUserId', mssql.BigInt)
  ps.input('paymentMethodId', mssql.TinyInt)
  await ps.prepare(`INSERT INTO HostAcceptedPaymentMethod (hostUserId, paymentMethodId)
    VALUES (@hostUserId, @paymentMethodId)`)

  let insertedOnceAtLeast = false
  for (const paymentMethod of paymentMethods) {
    const request = new mssql.Request(pool)
    request.input('name', mssql.NVarChar(32), paymentMethod.name)
    const { paymentMethodId } = (await request.query(
      'SELECT paymentMethodId FROM PaymentMethod WHERE [name] = @name')).recordset[0]

    if (Math.random() < 0.5) continue

    await ps.execute({
      hostUserId,
      paymentMethodId
    })

    insertedOnceAtLeast = true
  }

  if (!insertedOnceAtLeast) {
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
    const request = new mssql.Request(pool)
    request.input('name', mssql.NVarChar(32), paymentMethod.name)
    const { paymentMethodId } = (await request.query(
      'SELECT paymentMethodId FROM PaymentMethod WHERE [name] = @name')).recordset[0]

    await ps.execute({
      hostUserId,
      paymentMethodId
    })
  }

  ps.unprepare()
}

import { loremIpsum } from 'lorem-ipsum'

export const multithread = true

export const enabled = true

export const iterableDataStatement = `SELECT housingId FROM Housing`

export const iterableDataPrimaryKey = 'housingId'

export const tableNames = ['HousingCategory', 'Category']

const categories = [
  'Private Rooms',
  'Entire Home',
  'Unique Spaces',
  'Shared Rooms',
  'Housings with Pools',
  'Luxury Homes',
  'Vacation Rentals',
  'Experiences',
]

export const insertSinglethread = async (mssql, pool) => {
  const ps = new mssql.PreparedStatement(pool)
  ps.input('name', mssql.NVarChar(32))
  ps.input('description', mssql.NVarChar(128))
  await ps.prepare('INSERT INTO Category ([name], [description]) VALUES (@name, @description)')

  for (const category of categories) {
    await ps.execute({
      name: category,
      description: loremIpsum({ count: 1, units: 'sentences', sentenceLowerBound: 3, sentenceUpperBound: 7 })
    })
  }

  ps.unprepare()
}

export const insert = async (mssql, pool, housingId) => {
  const ps = new mssql.PreparedStatement(pool)
  ps.input('housingId', mssql.BigInt)
  ps.input('categoryId', mssql.Int)
  await ps.prepare(`INSERT INTO HousingCategory (housingId, categoryId)
    VALUES (@housingId, @categoryId)`)

  // Máximo de 3 categorias por alojamento.
  const maxLength = Math.floor(Math.random() * 3) + 1
  const insertedIds = []
  for (let i = 0; i < maxLength; i++) {
    const { categoryId } = (await pool.request().query(`SELECT TOP 1 categoryId FROM Category ORDER BY NEWID()`)).recordset[0]
    if (insertedIds.includes(categoryId)) {
      --i
      continue
    }
    
    await ps.execute({
      housingId,
      categoryId
    })

    insertedIds.push(categoryId)
  }

  ps.unprepare()
}
import { genAddress } from './common/address-gen.js'

export const multithread = true

export const enabled = true

export const amountOfDataToInsert = 10000

export const tableNames = ['Housing']

export const insert = async (mssql, pool) => {
  const request = new mssql.Request(pool)

  const { siteUserId: hostUserId } = (await request.query('SELECT TOP 1 siteUserId FROM SiteUser WHERE isHost = 1 ORDER BY NEWID()')).recordset[0]
  const { locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode } = await genAddress(mssql, request)
  request.input('cityId', mssql.Int, cityId)
  const { name: cityName } = (await request.query('SELECT name FROM City WHERE cityId = @cityId', { cityId })).recordset[0]
  const name = randomName(cityName)
  const defaultCost = randomPrice()

  const ps = new mssql.PreparedStatement(pool)
  ps.input('hostUserId', mssql.Int)
  ps.input('name', mssql.NVarChar)
  ps.input('defaultCost', mssql.Int)
  ps.input('locationAddrLine1', mssql.NVarChar)
  ps.input('locationAddrLine2', mssql.NVarChar)
  ps.input('stateId', mssql.Int)
  ps.input('locationPostalCode', mssql.NVarChar)
  ps.input('cityId', mssql.Int)

  await ps.prepare(`INSERT INTO Housing (hostUserId, name, defaultCost, locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode)
    VALUES (@hostUserId, @name, @defaultCost, @locationAddrLine1, @locationAddrLine2, @cityId, @stateId, @locationPostalCode)`)
  await ps.execute({ hostUserId, name, defaultCost, locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode })
  await ps.unprepare()
}

const randomPrice = () => {
  return Math.floor(Math.random() * 500) + 20
}

const randomName = (cityName) => {
  // Array de adjetivos para casas.
  const adjectives = [
    'Luxurious', 'Cozy', 'Elegant', 'Opulent', 
    'Spacious', 'Inviting', 'Stylish', 'Modern', 
    'Immaculate', 'Grand', 'Classy', 'Vibrant',
    'Well-Decorated', 'Serene', 'Renovated', 'Efficient', 
    'Lovely', 'Charming', 'Unique', 'Exquisite', 
    'Gorgeous', 'Gleaming', 'Well-Kept', 'Welcoming', 
    'Ideal', 'Stunning', 'Beautiful', 'Light-Filled', 
    'Comfortable', 'Attractive', 'Quaint', 'Delightful', 
    'Bright', 'Open', 'Cheerful', 'Lavish', 
    'Trendy', 'Safe', 'Exclusive', 'Private', 
    'Plush', 'Well-Maintained', 'Airy', 'Secure', 
    'Splendid', 'Humid', 'Comfy'
  ]

  // Array de possíveis tipos de casa.
  const housingTypes = [
    'Apartment',
    'Condo',
    'Townhouse',
    'Duplex',
    'Loft',
    'Terrace House',
    'Mobile Home',
    'Tiny House',
    'Single-family Home',
    'Row House',
    'Villa',
    'Cottage',
    'Chalet',
    'Mansion',
    'Cabin'
  ]

  // Nome aleatório composto pela cidade (50% de probabilidade), um adjetivo e o tipo de casa.
  return (Math.random() > 0.5 ? cityName + ' ' : '')
    + adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' 
    + housingTypes[Math.floor(Math.random() * housingTypes.length)]
}
const { genAddress } = require('./common/address-gen')

module.exports = {
  async inject(mssql) {
    return
    for (let i = 0; i <= 10000; i++) {
      process.stdout.write(`\rGenerating housings: ${i / 100}%      `)

      const request = new mssql.Request()

      const { siteUserId: hostUserId } = (await request.query('SELECT TOP 1 siteUserId FROM SiteUser WHERE isHost = 1 ORDER BY NEWID()')).recordset[0]
      const { locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode } = await genAddress(mssql, request)
      request.input('cityId', mssql.Int, cityId)
      const { name: cityName } = (await request.query('SELECT name FROM City WHERE cityId = @cityId', { cityId })).recordset[0]
      const name = this.randomName(cityName)
      const defaultCost = this.randomPrice()

      request.input('hostUserId', mssql.Int, hostUserId)
      request.input('name', mssql.NVarChar, name)
      request.input('defaultCost', mssql.Int, defaultCost)
      request.input('locationAddrLine1', mssql.NVarChar, locationAddrLine1)
      request.input('locationAddrLine2', mssql.NVarChar, locationAddrLine2)
      request.input('stateId', mssql.Int, stateId)
      request.input('locationPostalCode', mssql.NVarChar, locationPostalCode)

      await request.query(`INSERT INTO Housing (hostUserId, name, defaultCost, locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode) 
        VALUES (@hostUserId, @name, @defaultCost, @locationAddrLine1, @locationAddrLine2, @cityId, @stateId, @locationPostalCode)`)
    }
  },
  randomPrice() {
    return Math.floor(Math.random() * 500) + 20
  },
  randomName(cityName) {
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
}
const { addresses } = require('../../../data/addresses-us-all.json')
const stateCodes = require('../../../data/states_hash.json')

let countryId = null

module.exports = {
  async genAddress(mssql, request) {
    // Pré-definir o país.
    if (!countryId) {
      countryId = (await request.query('SELECT countryId FROM Country WHERE Name = \'United States\'')).recordset[0].countryId
    }
    request.input('countryId', mssql.Int, countryId)

    let selectedAddress = addresses[Math.floor(Math.random() * addresses.length)]
    let locationAddrLine1 = selectedAddress.address1
    let locationAddrLine2 = selectedAddress.address2 || null
    let i = 0
    request.input('cityName' + (++i), mssql.NVarChar, selectedAddress.city)
    let cityId = (await request.query('SELECT cityId FROM City WHERE Name = @cityName' + i + ' AND countryId = @countryId')).recordset[0]
    while (!cityId) {
      // Nomes de cidades não coincidem, tentar de novo com outra.
      selectedAddress = addresses[Math.floor(Math.random() * addresses.length)]
      locationAddrLine1 = selectedAddress.address1
      locationAddrLine2 = selectedAddress.address2 || null
      request.input('cityName' + (++i), mssql.NVarChar, selectedAddress.city)
      cityId = (await request.query('SELECT cityId FROM City WHERE Name = @cityName' + i + ' AND countryId = @countryId')).recordset[0]
    }

    i = 0
    request.input('stateName' + (++i), mssql.NVarChar, stateCodes[selectedAddress.state])
    let stateId = (await request.query('SELECT stateId FROM State WHERE Name = @stateName' + i + ' AND countryId = @countryId')).recordset[0]
    if (!stateId) {
      // Usar estado por defeito.
      request.input('stateName' + (++i), mssql.NVarChar, stateCodes['CA'])
      stateId = (await request.query('SELECT stateId FROM State WHERE Name = @stateName' + i + ' AND countryId = @countryId')).recordset[0]
    }
    const locationPostalCode = selectedAddress.postalCode

    return {
      locationAddrLine1,
      locationAddrLine2,
      cityId: cityId.cityId,
      stateId: stateId.stateId,
      locationPostalCode
    }
  }
}

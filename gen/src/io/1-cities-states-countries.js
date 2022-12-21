const json = require('../../data/world-cities_json.json')
  .sort((a, b) => a.country.localeCompare(b.country))

module.exports = {
  async inject(mssql) {
    return
    const now = new Date().getTime()
    for (city of json) {
      const request = new mssql.Request()
      request.input('country', mssql.NVarChar, city.country)
      const [country] = (await request.query(`SELECT * FROM Country WHERE Name = @country`)).recordset

      let identity
      if (!country) {
        const processingStr = '\rProcessing country: ' + city.country + '...                                 '
        process.stdout.write(processingStr)
        identity = (await request.query(`INSERT INTO Country (Name) VALUES (@country); SELECT @@IDENTITY as countryId`)).recordset[0]
      } else {
        identity = (await request.query(`SELECT * FROM Country WHERE Name = @country`)).recordset[0]
      }

      request.input('country_id', mssql.Int, identity.countryId)

      // Apenas válido se o país tiver estados.
      if (city.subcountry) {
        request.input('state', mssql.NVarChar, city.subcountry)
        const [state] = (await request.query(`SELECT * FROM State WHERE Name = @state`)).recordset
  
        if (!state) {
          await request.query('INSERT INTO State (Name, CountryId) VALUES (@state, @country_id)')
        }
      }

      request.input('name', mssql.NVarChar, city.name)
      await request.query('INSERT INTO City (Name, CountryId) VALUES (@name, @country_id)')
      first = false
    }

    console.log('\n\nFinished processing countries in ' + (new Date().getTime() - now) + 'ms.')
  }
}

import json from '../../data/world-cities_json.json' assert { type: 'json' }

const iterableJson = json.sort((a, b) => a.country.localeCompare(b.country))

export const multithread = false

export const insert = async (mssql, pool, j, total) => {
  let i = 0
  for (const city of iterableJson) {
    const request = new mssql.Request(pool)
    request.input('country', mssql.NVarChar, city.country)
    const [country] = (await request.query(`SELECT * FROM Country WHERE Name = @country`)).recordset

    let identity
    if (!country) {
      const processingStr = `\r(${j}/${total}) Processing country: ${city.country} (${i++}/${244})...                                 `
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
    request.query('INSERT INTO City (Name, CountryId) VALUES (@name, @country_id)')
  }

  process.stdout.write(`\r(${j}/${total}) Countries inserted.                     \n`)
}

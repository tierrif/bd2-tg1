import { loremIpsum } from 'lorem-ipsum'
import sample from '../../data/airbnb-amenities-sample.json' assert { type: 'json' }

const records = sample.records

export const enabled = true

export const tableNames = ['General.HousingAmenity', 'LowFrequency.Amenity', 'LowFrequency.AmenityIcon']

const amenitiesSample = records.map(amenity => amenity.fields.amenities)
    .filter(amenity => amenity)
    .map(amenity => amenity.split(','))
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter(amenity => amenity !== '' && !amenity.startsWith('translation missing'))
    .reduce((all, curr) => {
      if (all[curr]) {
        all[curr]++
      } else {
        all[curr] = 1
      }
      return all
    }, {}) // Terá o número de ocorrências para usar como probabilidade.
const total = Object.values(amenitiesSample).reduce((acc, curr) => acc + curr, 0)

export const multithread = true

export const iterableDataStatement = 'SELECT housingId FROM General.Housing'

export const iterableDataPrimaryKey = 'housingId'

export const insertSinglethread = async (mssql, pool) => {
  const amenityPs = new mssql.PreparedStatement(pool)
  amenityPs.input('name', mssql.NVarChar)
  amenityPs.input('description', mssql.NVarChar)
  amenityPs.input('iconId', mssql.Int)

  await amenityPs.prepare('INSERT INTO LowFrequency.Amenity (name, description, iconId) VALUES (@name, @description, @iconId)')

  const insertedAmenities = []
  for (const amenity in amenitiesSample) {
    const request = new mssql.Request(pool)
    request.input('url', mssql.NVarChar, '/internal/icons/' + amenity.toLowerCase() + '_icon.svg')
    const { identity } = (await request.query(`INSERT INTO LowFrequency.AmenityIcon (iconUrl) VALUES (@url);
      SELECT @@IDENTITY AS 'identity'`)).recordset[0]

    if (insertedAmenities.includes(amenity)) {
      continue
    }

    await amenityPs.execute({
      name: amenity, iconId: identity, description: loremIpsum(
        { count: 1, units: 'sentences', paragraphLowerBound: 3, paragraphUpperBound: 7 }
      )
    })

    insertedAmenities.push(amenity)
  }

  amenityPs.unprepare()
}

export const insert = async (mssql, pool, housingId) => {
  const ps = new mssql.PreparedStatement(pool)
  ps.input('housingId', mssql.Int)
  ps.input('amenityId', mssql.Int)
  ps.input('isPresent', mssql.Bit)

  await ps.prepare(`INSERT INTO General.HousingAmenity (housingId, amenityId, isPresent) 
    VALUES (@housingId, @amenityId, @isPresent)`)
  const request = new mssql.Request(pool)
  const { recordset } = await request.query('SELECT amenityId, name FROM LowFrequency.Amenity')
  for (const { name, amenityId } of recordset) {
    const probability = amenitiesSample[name] / total * 10
    if (Math.random() < probability || (housingId === 1 && probability === 0)) {
      await ps.execute({
        housingId, amenityId, isPresent: Math.random() < 0.99,
      })
    }
  }

  ps.unprepare()
}

import { loremIpsum } from 'lorem-ipsum'

export const multithread = true

export const enabled = false

export const iterableDataStatement = 'SELECT housingId FROM Housing'

export const iterableDataPrimaryKey = 'housingId'

export const insert = async (mssql, pool, housingId) => {
  // Terá no máximo 4 fotografias (5 - 1: Math.floor()).
  const maxLength = (Math.floor(Math.random() * 5) || 1)
  const ps = new mssql.PreparedStatement(pool)
  ps.input('housingId', mssql.Int)
  ps.input('name', mssql.NVarChar)
  ps.input('description', mssql.NVarChar)
  ps.input('pictureUrl', mssql.NVarChar)

  await ps.prepare('INSERT INTO HousingPicture (housingId, name, description, pictureUrl) VALUES (@housingId, @name, @description, @pictureUrl)')
  
  for (let i = 0; i < maxLength; i++) {
    // Create a picture.
    const name = randomPictureName()
    const description = loremIpsum({
      count: 1,
      units: 'sentences',
      sentenceLowerBound: 3,
      sentenceUpperBound: 7,
    })
    const pictureUrl = '/gallery/' + housingId + '/' + (i + 1) + '.jpg'
    
    await ps.execute({ housingId, name, description, pictureUrl })
  }

  ps.unprepare()
}

const randomPictureName = () => {
  const pictureNames = [
    'Exterior front view',
    'Living room',
    'Dining room',
    'Kitchen',
    'Master bedroom',
    'Guest bedroom',
    'Bathroom',
    'Backyard',
    'Deck',
    'Patio',
    'Pool',
    'Hot tub',
    'View from the inside',
    'Washer and dryer',
    'Fireplace',
    'Artwork close-up',
    'Nearby attractions',
  ]

  return pictureNames[Math.floor(Math.random() * pictureNames.length)]
}

import firstNamesF from '../../data/firstnames_f.json' assert { type: 'json' }
import firstNamesM from '../../data/firstnames_m.json' assert { type: 'json' }
import surnames from '../../data/surnames.json' assert { type: 'json' }
import { genAddress } from './common/address-gen.js'
import { randomBytes, createHash } from 'crypto'

const length = surnames.length

export const multithread = true

export const enabled = false

export const amountOfDataToInsert = 10000

export const tableNames = ['General.SiteUser']

export const insert = async (mssql, pool) => {
  const request = new mssql.Request(pool)

  const name = randomName()
  // 70% dos utilizadores têm foto de perfil.
  const profilePictureUrl = Math.random() > 0.3 ? '/profiles/' + randomBytes(32).toString('hex') + '.png' : null
  // 5% dos utilizadores são anfitriões.
  const isHost = Math.random() > 0.95
  // 0.01% dos utilizadores são administradores.
  const isAdmin = Math.random() > 0.9995
  // Emails aleatórios compostos pelo nome, um número aleatório e servidor de email aleatório.
  const email = randomEmail(name)
  // 60% dos anfitriões tem identidade verificada.
  const identityVerified = isHost && Math.random() > 0.4
  // Número de telemóvel americano aleatório.
  const mobile = '+1555' + Math.random().toString().slice(2, 9)
  // Sal do hash da password de 128 bytes.
  const salt = randomBytes(64).toString('hex')
  // Hash da password.
  const unhashedPassword = salt + randomBytes(128).toString('hex')
  const password = createHash('sha512').update(unhashedPassword).digest().toString('hex')
  // Se o utilizador for anfitrião, tem um número de contribuinte fiscal aleatório, senão tem 70% de probabilidade de não ter.
  const fiscalId = isHost
    ? Math.random().toString().slice(2, 11)
    : Math.random() > 0.3 ? '999999990' : Math.random().toString().slice(2, 11)

  const { locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode } = await genAddress(mssql, request)

  const ps = new mssql.PreparedStatement(pool)

  ps.input('name', mssql.NVarChar)
  ps.input('profilePictureUrl', mssql.NVarChar)
  ps.input('isHost', mssql.Bit)
  ps.input('isAdmin', mssql.Bit)
  ps.input('email', mssql.NVarChar)
  ps.input('identityVerified', mssql.Bit)
  ps.input('mobile', mssql.NVarChar)
  ps.input('password', mssql.NVarChar)
  ps.input('salt', mssql.NVarChar)
  ps.input('locationAddrLine1', mssql.NVarChar)
  ps.input('locationAddrLine2', mssql.NVarChar)
  ps.input('cityId', mssql.Int)
  ps.input('stateId', mssql.Int)
  ps.input('locationPostalCode', mssql.NVarChar)
  ps.input('fiscalId', mssql.NVarChar)


  await ps.prepare(`
  INSERT INTO General.SiteUser (name, profilePictureUrl, isHost, 
    isAdmin, email, identityVerified, mobile, 
    password, salt, locationAddrLine1, 
    locationAddrLine2, cityId, stateId, 
    locationPostalCode, fiscalId)
  VALUES (@name, @profilePictureUrl, @isHost, @isAdmin, 
    @email, @identityVerified, @mobile, @password, @salt, 
    @locationAddrLine1, @locationAddrLine2, @cityId, 
    @stateId, @locationPostalCode, @fiscalId)
`)

  await ps.execute({
    name,
    profilePictureUrl,
    isHost,
    isAdmin,
    email,
    identityVerified,
    mobile,
    password,
    salt,
    locationAddrLine1,
    locationAddrLine2,
    cityId,
    stateId,
    locationPostalCode,
    fiscalId
  })

  await ps.unprepare()
}

const randomName = () => {
  const randomGender = Math.random() > 0.5 ? firstNamesF : firstNamesM
  return randomGender[Math.floor(Math.random() * randomGender.length)] + ' '
    + surnames[Math.floor(Math.random() * length)]
}

const randomEmail = (name) => {
  return name.toLowerCase().replace(/ /g, '.')
    + Math.floor(Math.random() * 10000)
    + (['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'])[Math.floor(Math.random() * 4)]
}
const firstNamesF = require('../../data/firstnames_f.json')
const firstNamesM = require('../../data/firstnames_m.json')
const surnames = require('../../data/surnames.json')
const { genAddress } = require('./common/address-gen')
const { randomBytes, createHash } = require('crypto')

module.exports = {
  // Gerará 10000 utilizadores americanos.
  async inject(mssql) {
    for (let i = 0; i <= 10000; i++) {
      const request = new mssql.Request()
      process.stdout.write(`\rGenerating site users: ${i / 100}%      `)

      const name = this.randomName()
      // 70% dos utilizadores têm foto de perfil.
      const profilePictureUrl = Math.random() > 0.3 ? '/profiles/' + randomBytes(32).toString('hex') + '.png' : null
      // 5% dos utilizadores são anfitriões.
      const isHost = Math.random() > 0.95
      // 0.01% dos utilizadores são administradores.
      const isAdmin = Math.random() > 0.9999
      // Emails aleatórios compostos pelo nome, um número aleatório e servidor de email aleatório.
      const email = this.randomEmail(name)
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
        : Math.random() > 0.3 ? null : Math.random().toString().slice(2, 11)
        
      const { locationAddrLine1, locationAddrLine2, cityId, stateId, locationPostalCode } = await genAddress(mssql, request)

      request.input('name', mssql.NVarChar, name)
      request.input('profilePictureUrl', mssql.NVarChar, profilePictureUrl)
      request.input('isHost', mssql.Bit, isHost)
      request.input('isAdmin', mssql.Bit, isAdmin)
      request.input('email', mssql.NVarChar, email)
      request.input('identityVerified', mssql.Bit, identityVerified)
      request.input('mobile', mssql.NVarChar, mobile)
      request.input('password', mssql.NVarChar, password)
      request.input('salt', mssql.NVarChar, salt)
      request.input('locationAddrLine1', mssql.NVarChar, locationAddrLine1)
      request.input('locationAddrLine2', mssql.NVarChar, locationAddrLine2)
      request.input('cityId', mssql.Int, cityId)
      request.input('stateId', mssql.Int, stateId)
      request.input('locationPostalCode', mssql.NVarChar, locationPostalCode)
      request.input('fiscalId', mssql.NVarChar, fiscalId)

      await request.query(`
        INSERT INTO SiteUser (name, profilePictureUrl, isHost, 
          isAdmin, email, identityVerified, mobile, 
          password, salt, locationAddrLine1, 
          locationAddrLine2, cityId, stateId, 
          locationPostalCode, fiscalId)
        VALUES (@name, @profilePictureUrl, @isHost, @isAdmin, 
          @email, @identityVerified, @mobile, @password, @salt, 
          @locationAddrLine1, @locationAddrLine2, @cityId, 
          @stateId, @locationPostalCode, ${fiscalId ? '@fiscalId' : 'DEFAULT'})
      `)
    }
  },
  randomName() {
    const randomGender = Math.random() > 0.5 ? firstNamesF : firstNamesM
    return randomGender[Math.floor(Math.random() * randomGender.length)] + ' '
      + surnames[Math.floor(Math.random() * surnames.length)]
  },
  randomEmail(name) {
    return name.toLowerCase().replace(/ /g, '.')
      + Math.floor(Math.random() * 10000)
      + (['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com'])[Math.floor(Math.random() * 4)]
  }
}
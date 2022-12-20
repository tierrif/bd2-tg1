module.exports = {
  async inject(mssql) {
    return
    // Get all housings.
    let request = new mssql.Request()
    const housings = (await request.query('SELECT * FROM Housing')).recordset
    
    let k = 1
    for (const housing of housings) {
      // Print current progress.
      process.stdout.write('\rProcessing housing and adding rooms: ' + (k++) + '/' + housings.length + '...                                 ')
      // Terá no máximo 3 quartos (4 - 1: Math.floor()).
      const maxLength = (Math.floor(Math.random() * 4) || 1)
      for (let i = 0; i < maxLength; i++) {
        request = new mssql.Request()
        // Create a room.
        const housingId = housing.housingId
        const name = 'Room ' + ['A', 'B', 'C'][i]
        const maxGuestCount = Math.floor(Math.random() * 3) + 1

        request.input('housingId', mssql.Int, housingId)
        request.input('name', mssql.NVarChar, name)
        request.input('maxGuestCount', mssql.TinyInt, maxGuestCount)

        await request.query('INSERT INTO Room (housingId, name, maxGuestCount) VALUES (@housingId, @name, @maxGuestCount)')
      }
    }
  }
}
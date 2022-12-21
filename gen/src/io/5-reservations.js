const { genAddress } = require('./common/address-gen')

module.exports = {
  async inject(mssql) {
    for (let i = 0; i <= 5000; i++) {
      process.stdout.write(`\rGenerating reservations: ${i / 50}%      `)

      const request = new mssql.Request()

      const { siteUserId: clientUserId } = (await request.query('SELECT TOP 1 siteUserId FROM SiteUser WHERE isHost = 0 ORDER BY NEWID()')).recordset[0]
      const { housingId } = (await request.query('SELECT TOP 1 housingId FROM Housing ORDER BY NEWID()')).recordset[0]
      request.input('housingId', mssql.Int, housingId)
      const { roomId } = (await request.query('SELECT TOP 1 roomId FROM Room WHERE housingId = @housingId ORDER BY NEWID()')).recordset[0]

      // Futura data aleatória.
      const dateFrom = new Date(new Date().getTime() + Math.random() * this.daysToMilliseconds(365))
      const dateTo = new Date(dateFrom.getTime() + (Math.random() * this.daysToMilliseconds(14)) + this.daysToMilliseconds(1))
    }
  },
  daysToMilliseconds(days) {
    return days * 1000 * 60 * 60 * 24
  }
}
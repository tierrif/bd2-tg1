export const multithread = true

export const enabled = true
  
export const iterableDataStatement = 'SELECT housingId FROM General.Housing'

export const iterableDataPrimaryKey = 'housingId'

export const tableNames = ['General.Room']

export const insert = async (mssql, pool, housingId) => {
  // Terá no máximo 3 quartos (4 - 1: Math.floor()).
  const maxLength = (Math.floor(Math.random() * 4) || 1)
  const ps = new mssql.PreparedStatement(pool)
  ps.input('housingId', mssql.Int)
  ps.input('name', mssql.NVarChar)
  ps.input('maxGuestCount', mssql.TinyInt)

  await ps.prepare('INSERT INTO General.Room (housingId, name, maxGuestCount) VALUES (@housingId, @name, @maxGuestCount)')
  for (let i = 0; i < maxLength; i++) {
    // Criar um quarto.
    const name = 'Room ' + ['A', 'B', 'C'][i]
    const maxGuestCount = Math.floor(Math.random() * 3) + 1
    
    await ps.execute({ housingId, name, maxGuestCount })
  }

  ps.unprepare()
}
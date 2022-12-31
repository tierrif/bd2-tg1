USE tg1
GO

-- server é o utilizador que vai ser usado ao nível aplicacional.
CREATE LOGIN [server] WITH PASSWORD = 'server', CHECK_POLICY = OFF
CREATE USER [server] FROM LOGIN [server]
GRANT INSERT, UPDATE, DELETE, SELECT ON SCHEMA::dbo TO [server]
GRANT CONTROL ON DATABASE::tg1 TO [server]
ALTER SERVER ROLE [sysadmin] ADD MEMBER [server]

-- operator é o utilizador para operações de manutenção da base de dados.
CREATE LOGIN [operator] WITH PASSWORD = '0p3r4t0r!'
CREATE USER [operator] FROM LOGIN [operator]

GRANT CONTROL ON SCHEMA::dbo TO [operator]
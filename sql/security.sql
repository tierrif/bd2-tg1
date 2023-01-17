USE tg1
GO

-- server é o utilizador que vai ser usado ao nível aplicacional.
CREATE LOGIN [server] WITH PASSWORD = 'server', CHECK_POLICY = OFF
CREATE USER [server] FROM LOGIN [server]
GRANT CONTROL ON DATABASE::tg1 TO [server]
ALTER SERVER ROLE [sysadmin] ADD MEMBER [server]

-- operator é o utilizador para operações de manutenção da base de dados.
CREATE LOGIN [operator] WITH PASSWORD = '0p3r4t0r!'
CREATE USER [operator] FROM LOGIN [operator]

DENY CONTROL ON SCHEMA::dbo TO [operator]
GRANT CONTROL ON SCHEMA::General TO [operator]
GRANT CONTROL ON SCHEMA::HighFrequency TO [operator]
GRANT CONTROL ON SCHEMA::Locations TO [operator]
GRANT CONTROL ON SCHEMA::LowFrequency TO [operator]
GRANT CONTROL ON SCHEMA::Reviews TO [operator]
DENY CONTROL ON SCHEMA::Moderation TO [operator]
GO

-- Apenas usar em produção. PERIGO! Ter cuidado com o IP do servidor que acede à base de dados.
/*
CREATE TRIGGER blockServerLogins ON ALL SERVER FOR LOGON AS BEGIN
	-- Alterar 127.0.0.1 para IP aplicável do servidor que acede à base de dados.
    IF ORIGINAL_LOGIN() = 'server' AND (SELECT client_net_address FROM sys.dm_exec_connections
			WHERE session_id = @@SPID) != '127.0.0.1' BEGIN
        ROLLBACK
	END
END
GO
*/

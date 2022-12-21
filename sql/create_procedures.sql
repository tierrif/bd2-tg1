USE tg1
GO

CREATE PROCEDURE verifyHostUser
	@hostUserId BIGINT
AS BEGIN
	IF NOT EXISTS (SELECT * FROM SiteUser WHERE siteUserId = @hostUserId) BEGIN
		RAISERROR ('This user does not exist.', 16, 1)
		RETURN
	END ELSE IF (SELECT isHost FROM SiteUser WHERE siteUserId = @hostUserId) = 0 BEGIN
		RAISERROR ('Verification only applies to host users - the selected user is not a host.', 16, 1)
		RETURN
	END

	UPDATE SiteUser SET identityVerified = 1 WHERE siteUserId = @hostUserId
END
GO

/*CREATE PROCEDURE findRoomForGuestAmount
	@housingId BIGINT,
	@amount TINYINT,
	@roomId BIGINT OUT
AS BEGIN
	SELECT TOP (1) roomId, MIN(maxGuestCount) FROM Room WHERE housingId = @housingId AND maxGuestCount < @amount ORDER BY maxGuestCount ASC
END
GO*/

CREATE PROCEDURE calculatePriceForDates
	@housingId BIGINT,
	@startDate DATETIME,
	@endDate DATETIME,
	@roomId BIGINT,
	
	@finalPrice MONEY OUT
AS BEGIN
	IF @startDate > @endDate BEGIN
		RAISERROR ('Start date must be before end date.', 16, 1)
		RETURN
	END

	DECLARE @toReturn MONEY = 0
	-- Obter preço por noite com base na tabela DateIntervalCost, iterando por datas.
	WHILE @startDate <= @endDate BEGIN
		IF EXISTS (SELECT * FROM DateIntervalCost WHERE @startDate
				BETWEEN dateFrom AND dateTo AND housingId = @housingId) BEGIN
			-- Somar ao preço final o preço da data atual.
			SELECT @toReturn = @toReturn + costPerNight FROM DateIntervalCost 
				WHERE @startDate BETWEEN dateFrom AND dateTo AND housingId = @housingId
		END ELSE BEGIN
			SELECT @toReturn = @toReturn + defaultCost FROM Housing WHERE housingId = @housingId
		END
		SET @startDate = DATEADD(DAY, 1, @startDate)
	END

	-- Retornar.
	SET @finalPrice = @toReturn
END


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

CREATE PROCEDURE findRoomForGuestAmount
	@housingId BIGINT,
	@amount TINYINT,
	@roomId BIGINT OUT
AS BEGIN
	SELECT TOP (1) roomId, MIN(maxGuestCount) FROM Room WHERE housingId = @housingId AND maxGuestCount < @amount ORDER BY maxGuestCount ASC
END
GO

--SELECT * FROM 
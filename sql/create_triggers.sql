USE tg1
GO

CREATE TRIGGER updateRating ON HostUserReview AFTER INSERT, UPDATE AS BEGIN
	UPDATE Housing SET ratingAvg = (SELECT AVG(CAST(ratingValue as FLOAT)) from HostUserReview)
		WHERE Housing.housingId = (SELECT housingId FROM inserted)
END
GO

CREATE TRIGGER verifyAdminAction ON AdminAction AFTER INSERT, UPDATE AS BEGIN
	IF (SELECT isAdmin FROM SiteUser WHERE siteUserId = (SELECT adminId FROM inserted)) = 0 BEGIN
		RAISERROR ('Admin actions can''t be executed by non-admins!', 16, 1)
		ROLLBACK
		RETURN
	END

	-- Verificar que pelo menos uma das chaves estrangeiras não é nula
	DECLARE @clientReviewId BIGINT,
			@siteUserId BIGINT,
			@hostReviewId BIGINT,
			@amenityId INT,
			@housingId BIGINT

	SELECT @clientReviewId = clientReviewId,
		   @siteUserId = siteUserId,
		   @hostReviewId = hostReviewId,
		   @amenityId = amenityId,
		   @housingId = housingId FROM inserted

	IF @clientReviewId IS NULL AND @siteUserId IS NULL
		AND @hostReviewId IS NULL AND @amenityId IS NULL
		AND @housingId IS NULL BEGIN
		RAISERROR ('Admin actions must at least reference one entity!', 16, 1)
		ROLLBACK
	END
END
GO

--On report update, if the virtual table's value has accepted set to 1, set ClientUserReview.visible 
-- to 0 if ReviewReport.clientReviewId IS NOT NULL or HostUserReview.visible to 0 if ReviewReport.hostReviewId IS NOT NULL

CREATE TRIGGER updateVisibilityOnReportAccepted ON ReviewReport AFTER UPDATE AS BEGIN
	IF (SELECT accepted FROM inserted) = 1 AND (SELECT accepted FROM deleted) = 0 BEGIN
		IF (SELECT clientReviewId FROM inserted) IS NOT NULL BEGIN
			UPDATE ClientUserReview SET visible = 0 WHERE clientReviewId = (SELECT clientReviewId FROM inserted)
		END ELSE IF (SELECT hostReviewId FROM inserted) IS NOT NULL BEGIN
			UPDATE HostUserReview SET visible = 0 WHERE hostReviewId = (SELECT hostReviewId FROM inserted)
		END
	END
END
GO

CREATE TRIGGER verifyReport ON ReviewReport AFTER INSERT AS BEGIN
	IF ((SELECT clientReviewId FROM inserted) IS NULL
			AND (SELECT hostReviewId FROM inserted) IS NULL)
			OR ((SELECT clientReviewId FROM inserted) IS NOT NULL
			AND (SELECT hostReviewId FROM inserted) IS NOT NULL) BEGIN
		RAISERROR ('Reports MUST have either hostReviewId or clientReviewId NULL, but NEVER both!', 16, 1)
		ROLLBACK
	END
END
GO

ALTER TRIGGER denyAdminActionDelete ON AdminAction AFTER DELETE AS BEGIN
	IF (SELECT SYSTEM_USER) = 'server' RETURN

	RAISERROR ('Admin action logs cannot be deleted.', 16, 1)
	ROLLBACK
END
GO

CREATE TRIGGER denyVerifyUserManually ON SiteUser AFTER UPDATE AS BEGIN
	IF (SELECT identityVerified FROM deleted)
			!= (SELECT identityVerified FROM inserted) BEGIN
		RAISERROR ('Manual verification on SiteUser denied. Please use the verifyHostUser Stored Procedure instead.', 16, 1)
		ROLLBACK
	END
END

-- SELECT ratingAvg FROM Housing
-- SELECT [name], ratingValue FROM HostUserReview INNER JOIN ClientUser ON ClientUser.clientUserId = HostUserReview.authorClientId
-- INSERT INTO City ([name], countryId) VALUES ('Funchal', (SELECT countryId FROM Country WHERE name = 'Portugal'))
-- INSERT INTO AdminAction (adminId, actionType) VALUES (1, 0)
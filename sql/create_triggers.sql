USE tg1
GO

CREATE TRIGGER updateRating ON Reviews.HostUserReview AFTER INSERT, UPDATE, DELETE AS BEGIN
	UPDATE General.Housing SET ratingAvg = (SELECT AVG(CAST(ratingValue as FLOAT)) from Reviews.HostUserReview)
		WHERE General.Housing.housingId = (SELECT housingId FROM inserted)
END
GO

CREATE TRIGGER verifyAdminAction ON Moderation.AdminAction AFTER INSERT, UPDATE AS BEGIN
	IF (SELECT isAdmin FROM General.SiteUser WHERE siteUserId = (SELECT adminId FROM inserted)) = 0 BEGIN
		RAISERROR ('Admin actions can''t be executed by non-admins!', 16, 1)
		ROLLBACK
		RETURN
	END

	-- Verificar que pelo menos uma das chaves estrangeiras n�o � nula
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

CREATE TRIGGER updateVisibilityOnReportAccepted ON Moderation.ReviewReport AFTER UPDATE AS BEGIN
	IF (SELECT accepted FROM inserted) = 1 AND (SELECT accepted FROM deleted) IS NULL BEGIN
		IF (SELECT adminId FROM inserted) IS NULL BEGIN
			RAISERROR ('You must supply an admin who accepted the report.', 16, 1)
			ROLLBACK
			RETURN
		END

		IF (SELECT clientReviewId FROM inserted) IS NOT NULL BEGIN
			UPDATE Reviews.ClientUserReview SET visible = 0 WHERE clientReviewId = (SELECT clientReviewId FROM inserted)
			UPDATE Moderation.ReviewReport SET accepted = 1, adminId = (SELECT adminId FROM inserted) 
				WHERE clientReviewId = (SELECT clientReviewId FROM inserted)
		END ELSE IF (SELECT hostReviewId FROM inserted) IS NOT NULL BEGIN
			UPDATE Reviews.HostUserReview SET visible = 0 WHERE hostReviewId = (SELECT hostReviewId FROM inserted)
			UPDATE Moderation.ReviewReport SET accepted = 1, adminId = (SELECT adminId FROM inserted) 
				WHERE hostReviewId = (SELECT hostReviewId FROM inserted)
		END
	END
END
GO

CREATE TRIGGER verifyReport ON Moderation.ReviewReport AFTER INSERT AS BEGIN
	IF ((SELECT clientReviewId FROM inserted) IS NULL
			AND (SELECT hostReviewId FROM inserted) IS NULL)
			OR ((SELECT clientReviewId FROM inserted) IS NOT NULL
			AND (SELECT hostReviewId FROM inserted) IS NOT NULL) BEGIN
		RAISERROR ('Reports MUST have either hostReviewId or clientReviewId NULL, but NEVER both!', 16, 1)
		ROLLBACK
	END

	IF (SELECT accepted FROM inserted) = 1 BEGIN
		RAISERROR ('Reports can''t be accepted on creation!', 16, 1)
		ROLLBACK
	END

	IF (SELECT adminId FROM inserted) IS NOT NULL BEGIN
		RAISERROR ('Reports must NOT have an adminId on creation!', 16, 1)
		ROLLBACK
	END
END
GO

CREATE TRIGGER denyAdminActionDelete ON Moderation.AdminAction AFTER DELETE AS BEGIN
	IF (SELECT SYSTEM_USER) = 'server' RETURN

	RAISERROR ('Admin action logs cannot be deleted.', 16, 1)
	ROLLBACK
END
GO

CREATE TRIGGER denyVerifyUserManually ON General.SiteUser AFTER UPDATE AS BEGIN
	IF (SELECT identityVerified FROM deleted)
			!= (SELECT identityVerified FROM inserted) BEGIN
		RAISERROR ('Manual verification on SiteUser denied. Please use the verifyHostUser Stored Procedure instead.', 16, 1)
		ROLLBACK
	END
END
GO

CREATE TRIGGER autoPriceSet ON HighFrequency.Reservation AFTER INSERT AS BEGIN
	IF (SELECT totalCost FROM inserted) IS NOT NULL BEGIN
		RAISERROR ('Total cost must be NULL when inserting a reservation.', 16, 1)
		ROLLBACK
		RETURN
	END

	DECLARE @housingId BIGINT,
			@startDate DATETIME,
			@endDate DATETIME,
			@roomId BIGINT,
			@guestCount TINYINT,
			@totalCost MONEY
	SELECT @housingId = housingId FROM inserted
	SELECT @startDate = dateFrom FROM inserted
	SELECT @endDate = dateTo FROM inserted
	SELECT @roomId = roomId FROM inserted
	SELECT @guestCount = guestCount FROM inserted
	EXEC calculatePriceForDates @housingId, @startDate, @endDate, @roomId, @guestCount, @totalCost OUT

	UPDATE Reservation SET totalCost = @totalCost
		WHERE reservationId = (SELECT reservationId FROM inserted)
END


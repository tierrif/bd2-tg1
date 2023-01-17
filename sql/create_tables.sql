USE tg1
GO

CREATE SCHEMA Locations
GO

CREATE SCHEMA General
GO

CREATE SCHEMA HighFrequency
GO

CREATE SCHEMA LowFrequency
GO

CREATE SCHEMA Reviews
GO

CREATE SCHEMA Moderation
GO

CREATE TABLE Locations.Country (
	countryId INT IDENTITY CONSTRAINT PK_Country PRIMARY KEY,
	[name] NVARCHAR(64) NOT NULL
) ON tg1_Locations

CREATE TABLE Locations.State (
	stateId INT IDENTITY CONSTRAINT PK_State PRIMARY KEY,
	countryId INT NOT NULL,
	[name] NVARCHAR(64) NOT NULL,

	FOREIGN KEY (countryId) REFERENCES Locations.Country(countryId)
) ON tg1_Locations

CREATE TABLE Locations.City (
	cityId INT IDENTITY CONSTRAINT PK_City PRIMARY KEY,
	countryId INT NOT NULL,
	[name] NVARCHAR(64) NOT NULL,

	FOREIGN KEY (countryId) REFERENCES Locations.Country(countryId)
) ON tg1_Locations

CREATE TABLE General.SiteUser (
	siteUserId BIGINT IDENTITY CONSTRAINT PK_SiteUser PRIMARY KEY,
	[name] NVARCHAR(64) NOT NULL,
	profilePictureUrl NVARCHAR(256),
	joinDate DATETIME NOT NULL DEFAULT GETDATE(),
	fiscalId BIGINT NOT NULL DEFAULT 999999990,
	identityVerified BIT NOT NULL DEFAULT 0,
	mobile NVARCHAR(32) NOT NULL,
	email NVARCHAR(64) NOT NULL,
	salt NVARCHAR(128) NOT NULL,
	[password] NVARCHAR(512) NOT NULL,
	locationAddrLine1 NVARCHAR(64) NOT NULL,
	locationAddrLine2 NVARCHAR(64),
	locationPostalCode NVARCHAR(16) NOT NULL,
	cityId INT NOT NULL,
	stateId INT,
	isHost BIT NOT NULL DEFAULT 0,
	isAdmin BIT NOT NULL DEFAULT 0,

	FOREIGN KEY (cityId) REFERENCES Locations.City(cityId),
	FOREIGN KEY (stateId) REFERENCES Locations.State(stateId)
) ON tg1_General

CREATE TABLE General.Housing (
	housingId BIGINT IDENTITY CONSTRAINT PK_Housing PRIMARY KEY,
	hostUserId BIGINT NOT NULL,
	[name] NVARCHAR(128) NOT NULL,
	defaultCost MONEY NOT NULL,
	ratingAvg FLOAT NOT NULL DEFAULT -1,
	locationAddrLine1 NVARCHAR(64) NOT NULL,
	locationAddrLine2 NVARCHAR(64),
	locationPostalCode NVARCHAR(16) NOT NULL,
	cityId INT NOT NULL,
	stateId INT,
	FOREIGN KEY (hostUserId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (cityId) REFERENCES Locations.City(cityId),
	FOREIGN KEY (stateId) REFERENCES Locations.State(stateId)
) ON tg1_General

CREATE TABLE General.Room (
	roomId BIGINT IDENTITY CONSTRAINT PK_Room PRIMARY KEY,
	housingId BIGINT NOT NULL,
	[name] NVARCHAR(32) NOT NULL,
	maxGuestCount TINYINT NOT NULL,
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId)
) ON tg1_General

CREATE TABLE HighFrequency.Reservation (
	reservationId BIGINT IDENTITY CONSTRAINT PK_Reservation PRIMARY KEY,
	clientUserId BIGINT NOT NULL,
	housingId BIGINT NOT NULL,
	roomId BIGINT NOT NULL,
	dateFrom DATE NOT NULL,
	dateTo DATE NOT NULL,
	guestCount TINYINT NOT NULL,
	totalCost MONEY,
	FOREIGN KEY (clientUserId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId),
	FOREIGN KEY (roomId) REFERENCES General.Room(roomId)
) ON tg1_HighFrequency

CREATE TABLE HighFrequency.DateIntervalCost (
	dateIntervalId BIGINT IDENTITY CONSTRAINT PK_DateInterval PRIMARY KEY,
	housingId BIGINT NOT NULL,
	dateFrom DATE NOT NULL,
	dateTo DATE NOT NULL,
	costPerNight MONEY NOT NULL,
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId)
) ON tg1_HighFrequency

CREATE TABLE HighFrequency.HousingPicture (
	pictureId BIGINT IDENTITY CONSTRAINT PK_HousingPicture PRIMARY KEY,
	housingId BIGINT NOT NULL,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(256),
	pictureUrl NVARCHAR(256),
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId)
) ON tg1_HighFrequency

CREATE TABLE LowFrequency.AmenityIcon (
	iconId INT IDENTITY CONSTRAINT PK_AmenityIcon PRIMARY KEY,
	iconUrl NVARCHAR(128) NOT NULL
) ON tg1_LowFrequency

CREATE TABLE LowFrequency.Amenity (
	amenityId INT IDENTITY CONSTRAINT PK_Amenity PRIMARY KEY,
	iconId INT NOT NULL,
	[name] NVARCHAR(32),
	[description] NVARCHAR(256),
	FOREIGN KEY (iconId) REFERENCES LowFrequency.AmenityIcon(iconId),
) ON tg1_LowFrequency

CREATE TABLE General.HousingAmenity (
	housingId BIGINT NOT NULL,
	amenityId INT NOT NULL,
	isPresent BIT NOT NULL,
	PRIMARY KEY (housingId, amenityId),
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId),
	FOREIGN KEY (amenityId) REFERENCES LowFrequency.Amenity(amenityId)
) ON tg1_General

CREATE TABLE Reviews.HostUserReview (
	hostReviewId BIGINT IDENTITY CONSTRAINT PK_HostUserReview PRIMARY KEY,
	housingId BIGINT NOT NULL,
	hostUserId BIGINT NOT NULL,
	authorClientId BIGINT NOT NULL,
	title NVARCHAR(64) NOT NULL,
	[description] NVARCHAR(2048),
	reviewDate DATE NOT NULL DEFAULT GETDATE(),
	ratingValue TINYINT NOT NULL,
	visible BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId),
	FOREIGN KEY (hostUserId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (authorClientId) REFERENCES General.SiteUser(siteUserId)
) ON tg1_Reviews

CREATE TABLE Reviews.ClientUserReview (
	clientReviewId BIGINT IDENTITY CONSTRAINT PK_ClientUserReview PRIMARY KEY,
	authorHostId BIGINT NOT NULL,
	clientUserId BIGINT NOT NULL,
	title NVARCHAR(64) NOT NULL,
	[description] NVARCHAR(2048),
	reviewDate DATE NOT NULL DEFAULT GETDATE(),
	ratingValue TINYINT NOT NULL,
	visible BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (authorHostId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (clientUserId) REFERENCES General.SiteUser(siteUserId)
) ON tg1_Reviews

CREATE TABLE LowFrequency.PaymentMethod (
	paymentMethodId TINYINT IDENTITY CONSTRAINT PK_PaymentMethod PRIMARY KEY,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(128) NOT NULL
) ON tg1_LowFrequency

CREATE TABLE General.HostAcceptedPaymentMethod (
	hostUserId BIGINT NOT NULL,
	paymentMethodId TINYINT NOT NULL,
	PRIMARY KEY (hostUserId, paymentMethodId),
	FOREIGN KEY (hostUserId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (paymentMethodId) REFERENCES LowFrequency.PaymentMethod(paymentMethodId)
) ON tg1_General

CREATE TABLE LowFrequency.Category (
	categoryId INT IDENTITY CONSTRAINT PK_Category PRIMARY KEY,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(128) NOT NULL
) ON tg1_LowFrequency

CREATE TABLE General.HousingCategory (
	housingId BIGINT NOT NULL,
	categoryId INT NOT NULL,
	PRIMARY KEY (housingId, categoryId),
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId),
	FOREIGN KEY (categoryId) REFERENCES LowFrequency.Category(categoryId)
) ON tg1_General

CREATE TABLE Moderation.ReviewReport (
	reportId BIGINT IDENTITY CONSTRAINT PK_ReviewReport PRIMARY KEY,
	adminId BIGINT,
	hostReviewId BIGINT,
	clientReviewId BIGINT,
	accepted BIT,
	[description] NVARCHAR(256) NOT NULL,
	FOREIGN KEY (adminId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (hostReviewId) REFERENCES Reviews.HostUserReview(hostReviewId),
	FOREIGN KEY (clientReviewId) REFERENCES Reviews.ClientUserReview(clientReviewId)
) ON tg1_Moderation

CREATE TABLE Moderation.AdminAction (
	actionId BIGINT IDENTITY CONSTRAINT PK_AdminAction PRIMARY KEY,
	adminId BIGINT NOT NULL,
	clientReviewId BIGINT,
	siteUserId BIGINT,
	hostReviewId BIGINT,
	amenityId INT,
	housingId BIGINT,
	actionType BIT NOT NULL, -- 0: update, 1: delete
	updateOldValue NVARCHAR(512),
	updateNewValue NVARCHAR(512),
	actionTimestamp DATETIME NOT NULL DEFAULT GETDATE(),
	FOREIGN KEY (adminId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (clientReviewId) REFERENCES Reviews.ClientUserReview(clientReviewId),
	FOREIGN KEY (siteUserId) REFERENCES General.SiteUser(siteUserId),
	FOREIGN KEY (hostReviewId) REFERENCES Reviews.HostUserReview(hostReviewId),
	FOREIGN KEY (amenityId) REFERENCES LowFrequency.Amenity(amenityId),
	FOREIGN KEY (housingId) REFERENCES General.Housing(housingId)
) ON tg1_Moderation

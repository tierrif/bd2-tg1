USE tg1
GO

CREATE TABLE Country (
	countryId INT PRIMARY KEY IDENTITY,
	[name] NVARCHAR(64) NOT NULL
)

SELECT * FROM Housing
SELECT * FROM SiteUser WHERE identityVerified = 1
SELECT (595.0 / 993.0)
DELETE FROM Room
SELECT Room.housingId, roomId, Room.name, Housing.name FROM Room, Housing WHERE Housing.housingId = Room.housingId
DBCC CHECKIDENT ('Room', RESEED, 0)

CREATE TABLE [State] (
	stateId INT PRIMARY KEY IDENTITY,
	countryId INT NOT NULL,
	[name] NVARCHAR(64) NOT NULL,

	FOREIGN KEY (countryId) REFERENCES Country(countryId)
)

CREATE TABLE City (
	cityId INT PRIMARY KEY IDENTITY,
	countryId INT NOT NULL,
	[name] NVARCHAR(64) NOT NULL,

	FOREIGN KEY (countryId) REFERENCES Country(countryId)
)

CREATE TABLE SiteUser (
	siteUserId BIGINT PRIMARY KEY IDENTITY,
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

	FOREIGN KEY (cityId) REFERENCES City(cityId),
	FOREIGN KEY (stateId) REFERENCES [State](stateId)
)

CREATE TABLE Housing (
	housingId BIGINT PRIMARY KEY IDENTITY,
	hostUserId BIGINT NOT NULL,
	[name] NVARCHAR(128) NOT NULL,
	defaultCost MONEY NOT NULL,
	ratingAvg FLOAT NOT NULL DEFAULT -1,
	locationAddrLine1 NVARCHAR(64) NOT NULL,
	locationAddrLine2 NVARCHAR(64),
	locationPostalCode NVARCHAR(16) NOT NULL,
	cityId INT NOT NULL,
	stateId INT,
	FOREIGN KEY (hostUserId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (cityId) REFERENCES City(cityId),
	FOREIGN KEY (stateId) REFERENCES [State](stateId)
)

CREATE TABLE Room (
	roomId BIGINT PRIMARY KEY IDENTITY,
	housingId BIGINT NOT NULL,
	[name] NVARCHAR(32) NOT NULL,
	maxGuestCount TINYINT NOT NULL,
	FOREIGN KEY (housingId) REFERENCES Housing(housingId)
)

CREATE TABLE Reservation (
	reservationId BIGINT PRIMARY KEY IDENTITY,
	clientUserId BIGINT NOT NULL,
	housingId BIGINT NOT NULL,
	roomId BIGINT NOT NULL,
	dateFrom DATE NOT NULL,
	dateTo DATE NOT NULL,
	totalCost MONEY NOT NULL,
	FOREIGN KEY (clientUserId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (housingId) REFERENCES Housing(housingId),
	FOREIGN KEY (roomId) REFERENCES Room(roomId)
)

CREATE TABLE DateIntervalCost (
	dateIntervalId BIGINT PRIMARY KEY IDENTITY,
	housingId BIGINT NOT NULL,
	dateFrom DATE NOT NULL,
	dateTo DATE NOT NULL,
	costPerNight MONEY NOT NULL,
	FOREIGN KEY (housingId) REFERENCES Housing(housingId)
)

CREATE TABLE HousingPicture (
	pictureId BIGINT PRIMARY KEY IDENTITY,
	housingId BIGINT NOT NULL,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(128),
	pictureUrl NVARCHAR(256),
	FOREIGN KEY (housingId) REFERENCES Housing(housingId)
)

CREATE TABLE AmenityCategory (
	categoryId INT PRIMARY KEY IDENTITY,
	[name] NVARCHAR(32) NOT NULL
)

CREATE TABLE AmenityIcon (
	iconId INT PRIMARY KEY IDENTITY,
	iconUrl NVARCHAR(32) NOT NULL
)

CREATE TABLE Amenity (
	amenityId INT PRIMARY KEY IDENTITY,
	iconId INT NOT NULL,
	categoryId INT NOT NULL,
	[name] NVARCHAR(32),
	[description] NVARCHAR(128),
	FOREIGN KEY (iconId) REFERENCES AmenityIcon(iconId),
	FOREIGN KEY (categoryId) REFERENCES AmenityCategory(categoryId)
)

CREATE TABLE HousingAmenity (
	housingId BIGINT NOT NULL,
	amenityId INT NOT NULL,
	isPresent BIT NOT NULL,
	PRIMARY KEY (housingId, amenityId),
	FOREIGN KEY (housingId) REFERENCES Housing(housingId),
	FOREIGN KEY (amenityId) REFERENCES Amenity(amenityId)
)

CREATE TABLE HostUserReview (
	hostReviewId BIGINT PRIMARY KEY IDENTITY,
	housingId BIGINT NOT NULL,
	hostUserId BIGINT NOT NULL,
	authorClientId BIGINT NOT NULL,
	title NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(512),
	reviewDate DATE NOT NULL,
	ratingValue TINYINT NOT NULL,
	visible BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (housingId) REFERENCES Housing(housingId),
	FOREIGN KEY (hostUserId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (authorClientId) REFERENCES SiteUser(siteUserId)
)

CREATE TABLE ClientUserReview (
	clientReviewId BIGINT PRIMARY KEY IDENTITY,
	authorHostId BIGINT NOT NULL,
	clientUserId BIGINT NOT NULL,
	title NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(512),
	reviewDate DATE NOT NULL,
	ratingValue TINYINT NOT NULL,
	visible BIT NOT NULL DEFAULT 1,
	FOREIGN KEY (authorHostId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (clientUserId) REFERENCES SiteUser(siteUserId)
)

CREATE TABLE PaymentMethod (
	paymentMethodId TINYINT PRIMARY KEY IDENTITY,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(128) NOT NULL
)

CREATE TABLE HostAcceptedPaymentMethod (
	hostUserId BIGINT NOT NULL,
	paymentMethodId TINYINT NOT NULL,
	PRIMARY KEY (hostUserId, paymentMethodId),
	FOREIGN KEY (hostUserId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (paymentMethodId) REFERENCES PaymentMethod(paymentMethodId)
)

CREATE TABLE Category (
	categoryId INT PRIMARY KEY IDENTITY,
	[name] NVARCHAR(32) NOT NULL,
	[description] NVARCHAR(128) NOT NULL
)

CREATE TABLE HousingCategory (
	housingId BIGINT NOT NULL,
	categoryId INT NOT NULL,
	PRIMARY KEY (housingId, categoryId),
	FOREIGN KEY (housingId) REFERENCES Housing(housingId),
	FOREIGN KEY (categoryId) REFERENCES Category(categoryId)
)

CREATE TABLE ReviewReport (
	reportId BIGINT PRIMARY KEY IDENTITY,
	adminId BIGINT,
	hostReviewId BIGINT,
	clientReviewId BIGINT,
	accepted BIT,
	[description] NVARCHAR(256) NOT NULL,
	FOREIGN KEY (adminId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (hostReviewId) REFERENCES HostUserReview(hostReviewId),
	FOREIGN KEY (clientReviewId) REFERENCES ClientUserReview(clientReviewId)
)

CREATE TABLE AdminAction (
	actionId BIGINT PRIMARY KEY IDENTITY,
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
	FOREIGN KEY (adminId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (clientReviewId) REFERENCES ClientUserReview(clientReviewId),
	FOREIGN KEY (siteUserId) REFERENCES SiteUser(siteUserId),
	FOREIGN KEY (hostReviewId) REFERENCES HostUserReview(hostReviewId),
	FOREIGN KEY (amenityId) REFERENCES Amenity(amenityId),
	FOREIGN KEY (housingId) REFERENCES Housing(housingId)
)
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Alabama');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Alaska');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Arizona');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Arkansas');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'California');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Colorado');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Connecticut');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Delaware');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Florida');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'Georgia');
INSERT INTO [State] (countryId, [name]) VALUES (187, 'New York');

INSERT INTO [State] (countryId, [name]) VALUES (33, 'Alberta');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'British Columbia');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Manitoba');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'New Brunswick');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Newfoundland and Labrador');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Northwest Territories');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Nova Scotia');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Nunavut');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Ontario');
INSERT INTO [State] (countryId, [name]) VALUES (33, 'Prince Edward Island');


INSERT INTO [State] (countryId, [name]) VALUES (111, 'Aguascalientes');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Baja California');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Baja California Sur');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Campeche');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Chiapas');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Chihuahua');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Coahuila');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Colima');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Durango');
INSERT INTO [State] (countryId, [name]) VALUES (111, 'Guanajuato');


INSERT INTO City (countryId, [name]) VALUES (187, 'New York');
INSERT INTO City (countryId, [name]) VALUES (187, 'Los Angeles');
INSERT INTO City (countryId, [name]) VALUES (187, 'Chicago');
INSERT INTO City (countryId, [name]) VALUES (187, 'Houston');
INSERT INTO City (countryId, [name]) VALUES (187, 'Phoenix');
INSERT INTO City (countryId, [name]) VALUES (187, 'Philadelphia');
INSERT INTO City (countryId, [name]) VALUES (187, 'San Antonio');
INSERT INTO City (countryId, [name]) VALUES (187, 'San Diego');
INSERT INTO City (countryId, [name]) VALUES (187, 'Dallas');
INSERT INTO City (countryId, [name]) VALUES (187, 'San Jose');

INSERT INTO City (countryId, [name]) VALUES (33, 'Toronto');
INSERT INTO City (countryId, [name]) VALUES (33, 'Montreal');
INSERT INTO City (countryId, [name]) VALUES (33, 'Vancouver');
INSERT INTO City (countryId, [name]) VALUES (33, 'Ottawa');
INSERT INTO City (countryId, [name]) VALUES (33, 'Edmonton');
INSERT INTO City (countryId, [name]) VALUES (33, 'Calgary');
INSERT INTO City (countryId, [name]) VALUES (33, 'Mississauga');
INSERT INTO City (countryId, [name]) VALUES (33, 'Winnipeg');
INSERT INTO City (countryId, [name]) VALUES (33, 'Hamilton');
INSERT INTO City (countryId, [name]) VALUES (33, 'Quebec City');

INSERT INTO City (countryId, [name]) VALUES (111, 'Mexico City');
INSERT INTO City (countryId, [name]) VALUES (111, 'Guadalajara');
INSERT INTO City (countryId, [name]) VALUES (111, 'Monterrey');
INSERT INTO City (countryId, [name]) VALUES (111, 'Puebla');
INSERT INTO City (countryId, [name]) VALUES (111, 'Tijuana');
INSERT INTO City (countryId, [name]) VALUES (111, 'León');
INSERT INTO City (countryId, [name]) VALUES (111, 'Zapopan');
INSERT INTO City (countryId, [name]) VALUES (111, 'Tlalnepantla');
INSERT INTO City (countryId, [name]) VALUES (111, 'Toluca');
INSERT INTO City (countryId, [name]) VALUES (111, 'Cancún');

INSERT INTO SiteUser ([name], profilePictureUrl, fiscalId, mobile, email, salt, [password], locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT 'John Smith', 'https://example.com/profile/johnsmith.jpg', 123456789, '+1234567890', 'john.smith@example.com', '$2b$10$m1d34l05h', 'p@ssw0rd', '123 Main Street', '12345', ct.cityId, s.stateId
FROM Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE c.name = 'United States of America' AND s.name = 'New York' AND ct.name = 'New York';

INSERT INTO SiteUser ([name], profilePictureUrl, fiscalId, mobile, email, salt, [password], locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT 'Jane Doe', 'https://example.com/profile/janedoe.jpg', 987654321, '+0987654321', 'jane.doe@example.com', '$2b$10$d4f5g6h', 'p@55w0rd', '456 Market Street', '54321', ct.cityId, s.stateId
FROM Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE c.name = 'Canada' AND s.name = 'Ontario' AND ct.name = 'Toronto';

INSERT INTO SiteUser ([name], profilePictureUrl, fiscalId, mobile, email, salt, [password], locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT 'Carlos Hernandez', 'https://example.com/profile/carloshernandez.jpg', 111222333, '+4445566677', 'carlos.hernandez@example.com', '$2b$10$h7i8j9k', 'p@55w0rd', '789 Broadway Avenue', '98765', ct.cityId, s.stateId
FROM Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE c.name = 'Mexico' AND s.name = 'Guanajuato' AND ct.name = 'León';

INSERT INTO SiteUser ([name], profilePictureUrl, fiscalId, mobile, email, salt, [password], locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT 'Sandra Kim', 'https://example.com/profile/sandrakim.jpg', 777888999, '+5566778899', 'sandra.kim@example.com', '$2b$10$l0m1n2o', 'p@55w0rd', '321 Park Avenue', '56789', ct.cityId, s.stateId
FROM Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE c.name = 'Mexico' AND s.name = 'Baja California' AND ct.name = 'Tijuana';

UPDATE SiteUser SET isHost = 1 WHERE siteUserId = 1
UPDATE SiteUser SET isAdmin = 1 WHERE siteUserId = 2

INSERT INTO Housing (hostUserId, [name], defaultCost, locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT su.siteUserId, 'Cozy Apartment', 100, '123 Main Street', '12345', ct.cityId, s.stateId
FROM SiteUser su, Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE su.siteUserId = 1 AND c.name = 'United States of America' AND s.name = 'New York' AND ct.name = 'New York';

INSERT INTO Housing (hostUserId, [name], defaultCost, locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT su.siteUserId, 'Spacious House', 200, '456 Market Street', '54321', ct.cityId, s.stateId
FROM SiteUser su, Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE su.siteUserId = 1 AND c.name = 'United States of America' AND s.name = 'New York' AND ct.name = 'New York';

INSERT INTO Housing (hostUserId, [name], defaultCost, locationAddrLine1, locationPostalCode, cityId, stateId)
SELECT su.siteUserId, 'Modern Condo', 150, '789 Broadway Avenue', '98765', ct.cityId, s.stateId
FROM SiteUser su, Country c
INNER JOIN [State] s ON c.countryId = s.countryId
INNER JOIN City ct ON c.countryId = ct.countryId
WHERE su.siteUserId = 1 AND c.name = 'United States of America' AND s.name = 'New York' AND ct.name = 'New York';

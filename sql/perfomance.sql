USE tg1date
GO

-- Índices non-clustered para velocidades de leitura mais rápidas.
CREATE NONCLUSTERED INDEX cities_index ON Locations.City ([name])
CREATE NONCLUSTERED INDEX states_index ON Locations.[State] ([name])
CREATE NONCLUSTERED INDEX countries_index ON Locations.Country ([name])

CREATE NONCLUSTERED INDEX housings_index ON General.Housing (hostUserId, cityId, stateId, ratingAvg)
CREATE NONCLUSTERED INDEX room_index ON General.Room (housingId, maxGuestCount)

CREATE NONCLUSTERED INDEX dateintervals_index ON HighFrequency.DateIntervalCost (dateFrom, dateTo)

CREATE NONCLUSTERED INDEX reviewreports_index ON Moderation.ReviewReport (hostReviewId, clientReviewId)


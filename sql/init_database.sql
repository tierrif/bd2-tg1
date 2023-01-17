CREATE DATABASE tg1
ON PRIMARY (
  NAME = 'tg1_Primary',
  FILENAME = 'C:\tg1-bd\tg1_Primary.mdf',
  SIZE = 4MB,
  MAXSIZE = 200MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_General (
  NAME = 'tg1_General_1',
  FILENAME = 'C:\tg1-bd\tg1_General_1.ndf',
  SIZE = 1MB,
  MAXSIZE = 250MB,
  FILEGROWTH = 10%
), (
  NAME = 'tg1_General_2',
  FILENAME = 'C:\tg1-bd\tg1_General_2.ndf',
  SIZE = 1MB,
  MAXSIZE = 250MB,
  FILEGROWTH = 10%
), (
  NAME = 'tg1_General_3',
  FILENAME = 'C:\tg1-bd\tg1_General_3.ndf',
  SIZE = 1MB,
  MAXSIZE = 250MB,
  FILEGROWTH = 10%
), (
  NAME = 'tg1_General_4',
  FILENAME = 'C:\tg1-bd\tg1_General_4.ndf',
  SIZE = 1MB,
  MAXSIZE = 250MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_Locations ( 
  NAME = 'tg1_Locations_Main',
  FILENAME = 'C:\tg1-bd\tg1_Locations_Main.ndf',
  SIZE = 1MB,
  MAXSIZE = 15MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_HighFrequency ( 
  NAME = 'tg1_HighFrequency_1',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_1.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_HighFrequency_2',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_2.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_HighFrequency_3',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_3.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_HighFrequency_4',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_4.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_HighFrequency_5',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_5.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_HighFrequency_6',
  FILENAME = 'C:\tg1-bd\tg1_HighFrequency_6.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_LowFrequency (
  NAME = 'tg1_LowFrequency_Main',
  FILENAME = 'C:\tg1-bd\tg1_LowFrequency_Main.ndf',
  SIZE = 1MB,
  MAXSIZE = 5MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_Reviews ( 
  NAME = 'tg1_Reviews_1',
  FILENAME = 'C:\tg1-bd\tg1_Reviews_1.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_Reviews_2',
  FILENAME = 'C:\tg1-bd\tg1_Reviews_2.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_Reviews_3',
  FILENAME = 'C:\tg1-bd\tg1_Reviews_3.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_Reviews_4',
  FILENAME = 'C:\tg1-bd\tg1_Reviews_4.ndf',
  SIZE = 1MB,
  MAXSIZE = 125MB,
  FILEGROWTH = 10%
), FILEGROUP tg1_Moderation ( 
  NAME = 'tg1_Moderation_1',
  FILENAME = 'C:\tg1-bd\tg1_Moderation_1.ndf',
  SIZE = 1MB,
  MAXSIZE = 50MB,
  FILEGROWTH = 10%
), ( 
  NAME = 'tg1_Moderation_2',
  FILENAME = 'C:\tg1-bd\tg1_Moderation_2.ndf',
  SIZE = 1MB,
  MAXSIZE = 50MB,
  FILEGROWTH = 10%
) LOG ON (
  NAME = 'tg1_Logs_1',
  FILENAME = 'C:\tg1-bd\tg1_Logs_1.ldf',
  SIZE = 1MB,
  MAXSIZE = 5GB,
  FILEGROWTH = 10%
), (
  NAME = 'tg1_Logs_2',
  FILENAME = 'C:\tg1-bd\tg1_Logs_2.ldf',
  SIZE = 1MB,
  MAXSIZE = 5GB,
  FILEGROWTH = 10%
);
GO

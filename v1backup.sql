-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: eondrive
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `file`
--

DROP TABLE IF EXISTS `file`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `file` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id` bigint unsigned NOT NULL DEFAULT '0',
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `size` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` bigint NOT NULL,
  `status` varchar(10) NOT NULL,
  `token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `file`
--

LOCK TABLES `file` WRITE;
/*!40000 ALTER TABLE `file` DISABLE KEYS */;
INSERT INTO `file` VALUES (1,0,'test1','folder',NULL,'2023-04-09 02:58:26','2023-04-09 02:58:41',1,'done',NULL),(2,1,'pexels-hristo-fidanov-1252869.jpg','file',7214054,'2023-04-09 02:58:26','2023-04-09 02:58:41',1,'done',NULL),(3,1,'folderintest1','folder',NULL,'2023-04-09 02:58:41','2023-04-09 02:58:41',1,'done',NULL),(4,3,'CHIHHUIX-customerchat-0.0.1-swagger.yaml','file',6744,'2023-04-09 02:58:41','2023-04-09 02:58:41',1,'done',NULL),(5,3,'CHIHHUIX-groupshopping-0.0.1-swagger.yaml','file',6136,'2023-04-09 02:58:41','2023-04-09 02:58:41',1,'done',NULL),(6,3,'level2','folder',NULL,'2023-04-09 02:58:41','2023-04-09 02:58:42',1,'done',NULL),(7,6,'beach1.jpg','file',238078,'2023-04-09 02:58:41','2023-04-09 02:58:42',1,'done',NULL),(8,6,'beach2.jpg','file',782879,'2023-04-09 02:58:42','2023-04-09 02:58:43',1,'done',NULL),(9,6,'test1.txt','file',121,'2023-04-09 03:00:10','2023-04-09 03:00:11',1,'done',NULL),(15,0,'a','folder',NULL,'2023-04-09 03:02:00','2023-04-09 03:02:00',1,'done',NULL),(16,15,'test3.txt','file',20,'2023-04-09 03:02:00','2023-04-09 03:02:00',1,'done',NULL),(17,15,'test4.txt','file',5,'2023-04-09 03:02:00','2023-04-09 03:02:01',1,'done',NULL),(31,0,'joint RR.xlsx','file',11399,'2023-04-09 05:18:45','2023-04-09 05:18:45',1,'done',NULL),(32,6,'level3','folder',NULL,'2023-04-09 06:00:58','2023-04-09 06:00:59',1,'done',NULL),(33,32,'2016_09_22__Age_Group.xlsx','file',37679,'2023-04-09 06:00:58','2023-04-09 06:00:59',1,'done',NULL),(34,32,'2016_09_29__Age_Group.xlsx','file',75039,'2023-04-09 06:00:59','2023-04-09 06:00:59',1,'done',NULL),(35,0,'test2','folder',NULL,'2023-04-09 13:11:33','2023-04-09 13:11:33',1,'done',NULL),(37,35,'b.txt','file',1,'2023-04-09 13:11:33','2023-04-09 13:11:34',1,'done',NULL),(38,35,'test2inside','folder',NULL,'2023-04-09 13:11:34','2023-04-09 13:11:34',1,'done',NULL),(39,38,'xxx.txt','file',0,'2023-04-09 13:11:34','2023-04-09 13:11:34',1,'done',NULL),(53,0,'os','folder',NULL,'2023-04-09 14:54:51','2023-04-09 14:55:01',1,'done',NULL),(54,53,'ch1.pptx','file',5640695,'2023-04-09 14:54:51','2023-04-09 14:55:01',1,'done',NULL),(55,53,'ch3.pptx','file',6082011,'2023-04-09 14:56:30','2023-04-09 14:56:41',1,'done',NULL),(56,0,'test1.txt','file',121,'2023-04-09 16:05:19','2023-04-09 16:05:19',1,'done',NULL),(57,1,'test2.txt','file',68,'2023-04-09 16:06:11','2023-04-09 16:06:11',1,'done',NULL),(58,1,'test3.txt','file',12,'2023-04-09 16:09:51','2023-04-09 16:09:51',1,'done',NULL),(59,3,'test1.txt','file',121,'2023-04-09 16:10:35','2023-04-09 16:10:36',1,'done',NULL),(61,53,'ch6.pptx','file',2308748,'2023-04-09 17:43:23','2023-04-09 17:43:27',1,'done',NULL),(62,0,'pic','folder',NULL,'2023-04-10 11:46:08','2023-04-10 11:46:09',2,'done',NULL),(63,62,'mountain','folder',NULL,'2023-04-10 11:46:08','2023-04-10 11:46:09',2,'done',NULL),(64,63,'mountain1.jpg','file',55543,'2023-04-10 11:46:08','2023-04-10 11:46:09',2,'done',NULL),(65,63,'mountain2.jpg','file',255744,'2023-04-10 11:46:09','2023-04-10 11:46:10',2,'done',NULL),(66,63,'mountain3.jpg','file',118173,'2023-04-10 11:46:10','2023-04-10 11:46:11',2,'done',NULL),(67,3,'create test','folder',NULL,'2023-04-10 15:35:04','2023-04-10 15:35:04',1,'done',NULL),(68,67,'101S112_AA01R01.docx','file',16520,'2023-04-10 15:36:04','2023-04-10 15:36:05',1,'done',NULL),(71,0,'code','folder',NULL,'2023-04-10 16:34:09','2023-04-10 16:34:09',2,'done',NULL),(73,71,'index.js','file',491,'2023-04-10 16:34:33','2023-04-10 16:34:33',2,'done',NULL),(74,71,'global','folder',NULL,'2023-04-10 16:35:06','2023-04-10 16:35:06',2,'done',NULL),(75,74,'constants.js','file',102,'2023-04-10 16:35:06','2023-04-10 16:35:06',2,'done',NULL),(76,62,'ocean','folder',NULL,'2023-04-11 01:30:07','2023-04-11 01:30:07',2,'done',NULL),(77,62,'galaxy','folder',NULL,'2023-04-11 01:30:17','2023-04-11 01:30:18',2,'done',NULL);
/*!40000 ALTER TABLE `file` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `share_link`
--

DROP TABLE IF EXISTS `share_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `share_link` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `file_id` bigint unsigned NOT NULL,
  `token` varchar(15) COLLATE utf8mb4_0900_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `file_id` (`file_id`),
  CONSTRAINT `share_link_ibfk_1` FOREIGN KEY (`file_id`) REFERENCES `file` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `share_link`
--

LOCK TABLES `share_link` WRITE;
/*!40000 ALTER TABLE `share_link` DISABLE KEYS */;
INSERT INTO `share_link` VALUES (1,2,'Vgu9vBkzX5tn4Co'),(2,56,'CnqD9bmcCHHaCb4'),(3,53,'wJZgUzUN0a2cLUi'),(4,16,'GDe4m7Uw86JPrMi'),(5,6,'CazOJ3wDBPBNgfL'),(6,5,'KVhwWqtIvzMH3Im'),(7,73,'Sql9aacRRX86Imy'),(8,74,'1lc5sr7Mxp7FfSc'),(9,64,'lCnfDLz5BS675lA'),(10,76,'v4UJbeNQiMfRKHY'),(11,63,'ILXcSLwuLtTcnEk');
/*!40000 ALTER TABLE `share_link` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8mb4_0900_bin NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_0900_bin NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_0900_bin NOT NULL,
  `plan` tinyint unsigned NOT NULL,
  `allocated` bigint unsigned NOT NULL,
  `used` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'test1@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$3DmcO/PILPInsqP0n0fVaA$hOqWin+wyot00IyH3GwFUnrbBbvUaOn8Go+PGlW0axU','test1',1,52428800,22420451,'2023-04-09 02:57:49','2023-04-10 15:36:04'),(2,'sprint1@gmail.com','$argon2id$v=19$m=65536,t=3,p=4$rL+Z45zkP9FkmEeRLIsfQw$KzPHivreUKfYLQcmOS+h4E2UzmyK1H7mUvl75rdhtqM','DEMO Sprint 1',1,52428800,430053,'2023-04-10 11:44:48','2023-04-11 05:19:33');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-11 19:29:48

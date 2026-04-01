-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 192.168.3.201    Database: etech_db
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_sessions`
--

DROP TABLE IF EXISTS `auth_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` varchar(45) NOT NULL,
  `emp_id` varchar(45) NOT NULL,
  `emp_name` varchar(255) DEFAULT NULL,
  `emp_firstname` varchar(255) DEFAULT NULL,
  `emp_jobtitle` varchar(255) DEFAULT NULL,
  `emp_dept` varchar(255) DEFAULT NULL,
  `emp_prodline` varchar(255) DEFAULT NULL,
  `emp_station` varchar(255) DEFAULT NULL,
  `generated_at` datetime NOT NULL,
  `emp_position` varchar(255) DEFAULT NULL,
  `login_ip` varchar(45) DEFAULT NULL,
  `user_agent` longtext,
  `login_hostname` varchar(45) DEFAULT NULL,
  `system` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token_UNIQUE` (`token`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20223 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_sessions`
--

LOCK TABLES `auth_sessions` WRITE;
/*!40000 ALTER TABLE `auth_sessions` DISABLE KEYS */;
INSERT INTO `auth_sessions` VALUES (19621,'D07DGYPBUkcaruUBAf5hoSUAVjqrHy3Ab1p17KRs','1283','Cahigan, Arman S.','Arman','Equipment Engineering Section Head','Equipment Engineering','G & A','Equipment Engineering','2026-03-25 08:19:21','3','192.168.2.186','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-LAP-060','Machine Inventory System'),(19926,'FDDpJuPFnmCvweD6dQrdadhP9M2FBPuPlWGfQ93M','5011','Lagapa, Joseph B.','Lagapa','Trainee - Equipment Technician 1','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-26 10:03:58','1','172.16.4.143','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36','21HSI250','Technician Activity System'),(20040,'FKFTcgqohDpK3oqdMZ83WR2zdNqohG0Add35rSu9','1789','Miro, Frelyn Mae D.','Frelyn Mae','Equipment Engineer','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-26 21:16:00','2','192.168.3.242','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-PC-056','Technician Activity System'),(20051,'MW22joY5VT4AHXHKvq0VFOypcGV1EVX0H2DYyzcQ','1827','Feranil, John Joseph C.','John Joseph','Equipment Technician 1','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-26 21:58:14','1','192.168.2.131','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-PC-112','Technician Activity System'),(20092,'iWKqQ5w4Fz0zcl91a5jdVU6dQ4BGMGcYsPBYAUsa','1789','Miro, Frelyn Mae D.','Frelyn Mae','Equipment Engineer','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-27 04:07:22','2','192.168.2.99','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-PC-081','Technician Activity System'),(20123,'ZogL4Heweobisyy9wBHaeGt3jduYuWSbnuFfxVjH','1836','Nierra, Josh Edward A.','Josh Edward','Equipment Technician 1','Equipment Engineering','G & A','PM / Calibration','2026-03-27 06:49:33','1','192.168.2.58','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-PC-040','PM Schedule System'),(20165,'wJbePb6TnU4D0Z8EfC24TR4tVGFaK4AKVkR95Hy1','1836','Nierra, Josh Edward A.','Josh Edward','Equipment Technician 1','Equipment Engineering','G & A','PM / Calibration','2026-03-27 09:15:20','1','192.168.0.184','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','TSPI-PC-042','PM Schedule System'),(20205,'08fEq9KTu6fiNKgyjddojJVFP2AF8JpNfhKVJGVl','953','Deymos, Kennedy B.','Kennedy','Senior Equipment Technician','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-27 13:29:46','1','172.16.5.30','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','19TR1000','Technician Activity System'),(20220,'YdGxC8AM4iQVU7u8gesqT6V6J4MblLQE7mhtfzzK','12652','Ignaco, Jessa D.','Jessa','Equipment Technician 1','Equipment Engineering','PL6 (ADLT)','Tray / Turret','2026-03-27 14:57:20','1','172.16.5.31','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36','07TR2000','Technician Activity System');
/*!40000 ALTER TABLE `auth_sessions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-27 15:17:54

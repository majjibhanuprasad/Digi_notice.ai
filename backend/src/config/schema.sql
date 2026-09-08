-- DigiNotice AI MySQL Database Schema
-- Database Name: diginotice

CREATE DATABASE IF NOT EXISTS `diginotice` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `diginotice`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `email` VARCHAR(128) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'STUDENT') NOT NULL,
  `department` VARCHAR(64) DEFAULT NULL,
  `academic_year` VARCHAR(32) DEFAULT NULL,
  `profile_image` TEXT,
  `clubs` JSON DEFAULT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `verification_token` VARCHAR(128) DEFAULT NULL,
  `verification_token_expires` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Notices Table
CREATE TABLE IF NOT EXISTS `notices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `summary` TEXT,
  `category` VARCHAR(64) NOT NULL,
  `priority` ENUM('CRITICAL', 'HIGH', 'NORMAL') NOT NULL DEFAULT 'NORMAL',
  `department` VARCHAR(64) DEFAULT NULL,
  `academic_years` JSON DEFAULT NULL,
  `target_groups` JSON DEFAULT NULL,
  `attachments` JSON DEFAULT NULL,
  `created_by` VARCHAR(64) NOT NULL,
  `created_by_name` VARCHAR(128) DEFAULT NULL,
  `created_by_department` VARCHAR(64) DEFAULT NULL,
  `status` ENUM('Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Scheduled', 'Published', 'Expired', 'Archived') NOT NULL DEFAULT 'Draft',
  `publish_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `views` INT DEFAULT 0,
  `acknowledgements` INT DEFAULT 0,
  `rejection_reason` TEXT DEFAULT NULL,
  `registration_link` TEXT DEFAULT NULL,
  `event_date` DATETIME DEFAULT NULL,
  `venue` VARCHAR(255) DEFAULT NULL,
  `target_audience` ENUM('STUDENTS', 'FACULTY', 'SUPER_ADMIN') DEFAULT 'STUDENTS',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bookmarks Table
CREATE TABLE IF NOT EXISTS `bookmarks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `notice_id` VARCHAR(64) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `notice_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('Critical', 'High Priority', 'Normal', 'Reminder', 'Event') NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Acknowledgements Table
CREATE TABLE IF NOT EXISTS `acknowledgements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `notice_id` VARCHAR(64) NOT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (`user_id`),
  INDEX (`notice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Student Queries Table
CREATE TABLE IF NOT EXISTS `queries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `notice_id` VARCHAR(64) NOT NULL,
  `notice_title` VARCHAR(255) DEFAULT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(128) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT DEFAULT NULL,
  `answered_by` VARCHAR(64) DEFAULT NULL,
  `answered_by_name` VARCHAR(128) DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `answered_at` DATETIME DEFAULT NULL,
  `status` ENUM('Open', 'Answered', 'Closed') NOT NULL DEFAULT 'Open',
  INDEX (`notice_id`),
  INDEX (`student_id`),
  INDEX (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Audit Logs Table
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `user_id` VARCHAR(64) NOT NULL,
  `user_name` VARCHAR(128) NOT NULL,
  `user_role` VARCHAR(64) NOT NULL,
  `action` TEXT NOT NULL,
  `notice_id` VARCHAR(64) DEFAULT NULL,
  `notice_title` VARCHAR(255) DEFAULT NULL,
  `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `code` VARCHAR(32) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `name` VARCHAR(64) UNIQUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Calendar Events Table
CREATE TABLE IF NOT EXISTS `calendar_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `_id` VARCHAR(64) UNIQUE NOT NULL,
  `notice_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `date` DATETIME NOT NULL,
  `start_time` VARCHAR(32) NOT NULL,
  `end_time` VARCHAR(32) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  INDEX (`notice_id`),
  INDEX (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

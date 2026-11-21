
-- =====================================
-- MYSQL DEMO DATABASE
-- =====================================

CREATE DATABASE IF NOT EXISTS mysql_demo
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE mysql_demo;

-- =====================================
-- NOTES TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS notes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    description VARCHAR(1000) DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_notes_name (name),
    INDEX idx_notes_created_at (created_at)
);

-- =====================================
-- USERS TABLE
-- =====================================

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
);

-- =====================================
-- DATABASE CHECK
-- =====================================

SHOW TABLES;

DESCRIBE notes;

DESCRIBE users;

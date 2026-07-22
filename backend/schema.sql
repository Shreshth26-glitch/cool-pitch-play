-- Database setup script for Don Bosco Turf
-- You can run this script directly in your MySQL client (e.g. phpMyAdmin, MySQL Workbench, or CLI)

CREATE DATABASE IF NOT EXISTS donboscoturf;
USE donboscoturf;

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  duration INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NULL,
  team VARCHAR(255) NULL,
  notes TEXT NULL,
  status ENUM('confirmed', 'cancelled', 'pending') NOT NULL DEFAULT 'confirmed',
  paymentMethod ENUM('court', 'online') NOT NULL DEFAULT 'court',
  paymentStatus ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  `key` VARCHAR(50) PRIMARY KEY,
  `value` TEXT NOT NULL
);


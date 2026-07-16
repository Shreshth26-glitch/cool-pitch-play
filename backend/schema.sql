-- Database setup script for FrostPitch Turf
-- You can run this script directly in your MySQL client (e.g. phpMyAdmin, MySQL Workbench, or CLI)

CREATE DATABASE IF NOT EXISTS frostpitch;
USE frostpitch;

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
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

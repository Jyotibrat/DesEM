-- Event Registration Module - Database Schema
-- Drupal 10 Custom Module
-- 
-- This file contains the SQL schema for the event_registration module.
-- These tables are automatically created when the module is installed via Drupal,
-- but this file is provided for reference and manual installation if needed.

-- Table: event_registration_config
-- Stores event configuration data created by administrators
CREATE TABLE IF NOT EXISTS `event_registration_config` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique event ID',
  `registration_start_date` INT(11) NOT NULL COMMENT 'Registration start date timestamp',
  `registration_end_date` INT(11) NOT NULL COMMENT 'Registration end date timestamp',
  `event_date` INT(11) NOT NULL COMMENT 'Event date timestamp',
  `event_name` VARCHAR(255) NOT NULL COMMENT 'Name of the event',
  `category` VARCHAR(100) NOT NULL COMMENT 'Category of the event',
  `created` INT(11) NOT NULL COMMENT 'Timestamp when the event was created',
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `event_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores event configuration data';

-- Table: event_registration_data
-- Stores user event registration submissions
CREATE TABLE IF NOT EXISTS `event_registration_data` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Primary Key: Unique registration ID',
  `full_name` VARCHAR(255) NOT NULL COMMENT 'Full name of the registrant',
  `email` VARCHAR(255) NOT NULL COMMENT 'Email address of the registrant',
  `college_name` VARCHAR(255) NOT NULL COMMENT 'College name of the registrant',
  `department` VARCHAR(255) NOT NULL COMMENT 'Department of the registrant',
  `category` VARCHAR(100) NOT NULL COMMENT 'Category of the event',
  `event_date` INT(11) NOT NULL COMMENT 'Event date timestamp',
  `event_id` INT(10) UNSIGNED NOT NULL COMMENT 'Foreign key to event_registration_config.id',
  `created` INT(11) NOT NULL COMMENT 'Timestamp when the registration was created',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_event_date` (`email`, `event_date`),
  KEY `event_id` (`event_id`),
  KEY `email` (`email`),
  KEY `event_date` (`event_date`),
  CONSTRAINT `fk_event_config` FOREIGN KEY (`event_id`) REFERENCES `event_registration_config` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Stores user event registration data';

-- PostgreSQL Version (Alternative)
-- Uncomment below if using PostgreSQL instead of MySQL

/*
-- Table: event_registration_config (PostgreSQL)
CREATE TABLE IF NOT EXISTS event_registration_config (
  id SERIAL PRIMARY KEY,
  registration_start_date INTEGER NOT NULL,
  registration_end_date INTEGER NOT NULL,
  event_date INTEGER NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  created INTEGER NOT NULL
);

CREATE INDEX idx_category ON event_registration_config(category);
CREATE INDEX idx_event_date ON event_registration_config(event_date);

-- Table: event_registration_data (PostgreSQL)
CREATE TABLE IF NOT EXISTS event_registration_data (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  event_date INTEGER NOT NULL,
  event_id INTEGER NOT NULL,
  created INTEGER NOT NULL,
  CONSTRAINT fk_event_config FOREIGN KEY (event_id) REFERENCES event_registration_config(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_email_event_date ON event_registration_data(email, event_date);
CREATE INDEX idx_event_id ON event_registration_data(event_id);
CREATE INDEX idx_email ON event_registration_data(email);
CREATE INDEX idx_event_date_data ON event_registration_data(event_date);
*/

-- Sample Data (Optional - for testing)
-- Uncomment below to insert sample event data

/*
-- Insert sample events
INSERT INTO event_registration_config (registration_start_date, registration_end_date, event_date, event_name, category, created) VALUES
(UNIX_TIMESTAMP('2026-02-01'), UNIX_TIMESTAMP('2026-02-28'), UNIX_TIMESTAMP('2026-03-15'), 'Introduction to Drupal', 'Online Workshop', UNIX_TIMESTAMP()),
(UNIX_TIMESTAMP('2026-02-01'), UNIX_TIMESTAMP('2026-03-15'), UNIX_TIMESTAMP('2026-03-20'), 'Web Development Hackathon', 'Hackathon', UNIX_TIMESTAMP()),
(UNIX_TIMESTAMP('2026-02-10'), UNIX_TIMESTAMP('2026-03-10'), UNIX_TIMESTAMP('2026-03-25'), 'PHP Conference 2026', 'Conference', UNIX_TIMESTAMP()),
(UNIX_TIMESTAMP('2026-02-15'), UNIX_TIMESTAMP('2026-03-01'), UNIX_TIMESTAMP('2026-03-10'), 'Database Design Workshop', 'One-day Workshop', UNIX_TIMESTAMP());
*/

-- Notes:
-- 1. These tables are automatically created by Drupal when the module is installed
-- 2. The schema is defined in event_registration.install file using Drupal's Schema API
-- 3. Drupal handles table prefixes automatically
-- 4. Foreign key constraints ensure data integrity
-- 5. Unique constraint on (email, event_date) prevents duplicate registrations

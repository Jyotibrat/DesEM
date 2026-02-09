# Event Registration Module - Drupal 10

**FOSSEE Internship Task Submission**

A custom Drupal 10 module for managing event registrations with AJAX-enabled forms, email notifications, and comprehensive admin tools.

---

## Overview

This module provides a complete event registration system for Drupal 10, allowing administrators to create and manage events while users can register through an intuitive AJAX-powered form.

**Developed for**: FOSSEE Internship Task Round  
**Drupal Version**: 10.x  
**Database**: MySQL (PostgreSQL compatible)

---

## Features

### Event Configuration
- Admin interface to create events
- Registration date range management
- Multiple event categories (Online Workshop, Hackathon, Conference, One-day Workshop)
- Form validation with user-friendly error messages

### User Registration
- AJAX cascading dropdowns (Category → Event Date → Event Name)
- Real-time form updates without page reload
- Duplicate registration prevention (email + event date)
- Email format validation
- Special character filtering
- Only shows events within registration period

### Email Notifications
- Automated confirmation emails to users
- Admin notification emails (configurable)
- Personalized email content

### Admin Dashboard
- View all registrations
- AJAX-powered filters (Event Date and Event Name)
- Participant count display
- CSV export with all registration fields
- Permission-based access control

---

## Module Structure

```
event_registration/
├── config/
│   └── install/
│       └── event_registration.settings.yml
├── src/
│   ├── Controller/
│   │   └── RegistrationListController.php
│   ├── Form/
│   │   ├── AdminConfigForm.php
│   │   ├── EventConfigForm.php
│   │   └── EventRegistrationForm.php
│   └── Service/
│       └── EmailService.php
├── event_registration.info.yml
├── event_registration.install
├── event_registration.module
├── event_registration.permissions.yml
├── event_registration.routing.yml
├── event_registration.services.yml
├── event_registration.sql
└── README.md
```

---

## Requirements

- **Drupal**: 10.x
- **PHP**: 8.1 or higher
- **Database**: MySQL 5.7+ / MariaDB 10.3+ / PostgreSQL 12+

---

## Installation

Read the [*docs*](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Setup) for the Installation.

---

## Configuration

Read the [*docs*](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Configure) for the configuration.

---

## Technical Details

- **PSR-4 Autoloading**: Proper namespacing
- **Dependency Injection**: Full DI implementation
- **Drupal Coding Standards**: Compliant
- **AJAX Framework**: Drupal core AJAX
- **Config API**: All settings configurable

---

## Database Schema

### Table: event_registration_config

Stores event configuration data.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| registration_start_date | int | Registration start timestamp |
| registration_end_date | int | Registration end timestamp |
| event_date | int | Event date timestamp |
| event_name | varchar(255) | Name of the event |
| category | varchar(100) | Event category |
| created | int | Creation timestamp |

### Table: event_registration_data

Stores user registration submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| full_name | varchar(255) | Registrant's full name |
| email | varchar(255) | Registrant's email |
| college_name | varchar(255) | College name |
| department | varchar(255) | Department |
| category | varchar(100) | Event category |
| event_date | int | Event date timestamp |
| event_id | int | Foreign key to event_registration_config.id |
| created | int | Registration timestamp |

**Unique Constraint**: `(email, event_date)` - Prevents duplicate registrations  
**Foreign Key**: `event_id` → `event_registration_config.id`

**SQL File**: See `event_registration.sql` for complete schema

---

## Usage

### For Users

1. Visit `/event-registration`
2. Fill in personal information
3. Select Category (AJAX updates Event Date)
4. Select Event Date (AJAX updates Event Name)
5. Select Event Name
6. Click "Register"

### For Administrators

#### View Registrations
Visit `/admin/event-registration/list`

#### Export Data
Click "Export to CSV" on the listing page

---
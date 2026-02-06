# DesEM - Drupal Event Management System

A comprehensive *`Drupal 10-based`* Event Management and Registration System designed to streamline event planning, registration management, and attendee communication.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Module Documentation](#module-documentation)
- [Support](#support)
- [Project Information](#project-information)
- [Project Attribution](#project-attribution)

---

## Overview

*`DesEM`* is a *Custom Drupal Event Registration Module*. It provides a robust platform for managing events, handling attendee registrations, and automating event-related communications. The system is built with professional development standards and includes comprehensive documentation for setup, configuration, and usage.

**Version**: 1.0.0  
**Drupal Version**: 10.x  
**PHP Version**: 7.4+ (as per Drupal 10 requirements)

---

## Features

### Core Capabilities
- **Event Management** - Create and manage events with flexible registration periods
- **User Registration** - Secure registration system with duplicate prevention
- **Email Notifications** - Automated email communications for admins and users
- **Admin Dashboard** - Comprehensive management interface with filtering and sorting
- **Data Export** - CSV export functionality for event data and registrations
- **Dynamic Forms** - AJAX-powered cascading dropdowns for enhanced user experience
- **Configuration Management** - Flexible admin configuration panel

---

## Project Structure

```
DesEM/
├── composer.json
├── composer.lock
├── README.md
├── Docs/
│   ├── Docs.md
│   ├── Configure/
│   │   ├── Configure.md
│   │   ├── Order_of_Configuration.md
│   │   ├── Drupal/
│   │   ├── MySQL/
│   │   └── XAMPP/
│   ├── Setup/
│   │   ├── Setup.md
│   │   ├── Drupal Installation/
│   │   ├── MySQL Installation/
│   │   └── XAMPP Installation/
│   └── Testing.md
├── modules/
│   └── custom/
│       └── event_registration/
│           ├── src/
│           ├── config/
│           ├── event_registration.sql
│           ├── event_registration.info.yml
│           ├── event_registration.module
│           ├── event_registration.permissions.yml
│           ├── event_registration.routing.yml
│           ├── event_registration.services.yml
│           ├── README.md
│           └── ...
└── archive/
    ├── Archive.md
    ├── backend/
    │   ├── requirements.txt
    │   ├── event_registration/
    │   ├── events/
    │   ├── registrations/
    │   └── templates/
    └── frontend/
        ├── package.json
        └── src/
```

---

## Prerequisites

Before installing DesEM, ensure you have the following:

- **XAMPP** or similar local development environment with:
  - Apache Web Server 2.4+
  - MySQL 5.7+ (or MariaDB 10.3+)
  - PHP 7.4+
- **Composer** 2.0+ (PHP dependency manager)
- **Git** (version control)
- **Drush** (Drupal command-line tool) - installed via Composer (optional)
- **Web Browser** (Chrome, Firefox, Safari, or Edge)

---

## Installation & Setup

For detailed installation and setup instructions, please refer to the documentation in the [**`docs/setup/`**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Setup) directory. This includes comprehensive guides for:

- [**XAMPP Installation**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Setup/XAMPP%20Installation)
- [**Drupal Installation**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Setup/Drupal%20Installation)
- [**MySQL Installation**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Setup/MySQL%20Installation)

All step-by-step instructions are available in the setup documentation.

---

## Configuration

For complete configuration instructions, please refer to the documentation in the [**`docs/configure/`**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Configure) directory. This includes detailed guides for:

- [**XAMPP Configuration**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Configure/XAMPP)
- [**Drupal Configuration**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Configure/Drupal)
- [**MySQL Configuration**](https://github.com/Jyotibrat/DesEM/tree/main/Docs/Configure/MySQL)
- [**Configuration order**](https://github.com/Jyotibrat/DesEM/blob/main/Docs/Configure/Order_of_Configuration.md)

All configuration guides and documentation are available in the configure directory.

---

## Usage

### Managing Events
1. Navigate to Admin Panel
2. Go to Event Registration section
3. Create new events with registration periods
4. Configure event settings and notification emails

### Viewing Registrations
1. Access the registration dashboard
2. View all event registrations
3. Filter and search registrations
4. Export data to CSV format

---

## Module Documentation

For complete documentation on the custom event registration module, please refer to:
- [Module README](modules/custom/event_registration/README.md)

The module documentation includes details about the module structure, key files, controllers, forms, services, and configuration.

---

## Archive

The [**`archive/`**](https://github.com/Jyotibrat/DesEM/tree/main/archive) directory contains unusable code from the development phase. This includes experimental implementations using Django as the backend and React as the frontend, which were developed during the initial development process but are not part of the final Drupal-based system.

---

## Support

If you need any support or have questions about this project, please feel free to contact me through:

- **Email**: [bjyotibrat@gmail.com](mailto:bjyotibrat@gmail.com)
- **LinkedIn**: [bindupautra-jyotibrat](https://www.linkedin.com/in/bindupautra-jyotibrat)
- **Issue Tracker**: [Create an issue in the repository](https://github.com/Jyotibrat/DesEM/issues)

Your feedback and questions are welcome!

---

## Project Information

- **Project Name**: DesEM (Drupal Event Management System)
- **Version**: 1.0.0
- **Created**: February 2026
- **Drupal Version**: 10.x
- **License**: [GNU GENERAL PUBLIC LICENSE Version 2](LICENSE)
- **Author**: [Bindupautra Jyotibrat](https://github.com/Jyotibrat)

---

## Project Attribution

This project was developed as a task round for **FOSSEE (Free and Open-Source Software for Education)** for [**Drupal**](https://new.drupal.org/home).

---

**For more information, please refer to the complete documentation in the [**`docs/`**](https://github.com/Jyotibrat/DesEM/tree/main/Docs) folder.**
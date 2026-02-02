# Event Registration System - Drupal 10

**FOSSEE Internship Task Submission**

A complete Drupal 10 installation with a custom Event Registration module.

---

## 📋 Submission Contents

This repository contains:

1. ✅ **composer.json** - Drupal 10 dependencies
2. ✅ **composer.lock** - Locked dependency versions
3. ✅ **modules/custom/event_registration/** - Custom event registration module
4. ✅ **event_registration.sql** - Database schema
5. ✅ **README.md** - This file

---

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/fossee-event-registration.git
cd fossee-event-registration

# 2. Install dependencies
composer install

# 3. Install Drupal (visit /install.php in browser)

# 4. Enable module
vendor/bin/drush en event_registration -y
vendor/bin/drush cr
```

---

## 📦 Module Features

- Event management with registration periods
- AJAX cascading dropdowns
- Duplicate prevention
- Email notifications
- Admin dashboard with filters
- CSV export

---

## 📁 Repository Structure

```
event_registration/
├── composer.json
├── composer.lock
├── .gitignore
├── README.md
└── modules/
    └── custom/
        └── event_registration/
            ├── src/
            ├── config/
            ├── event_registration.sql
            └── README.md
```

---

## 🗄️ Database Schema

See `modules/custom/event_registration/event_registration.sql`

---

## 📖 Documentation

- **Module Documentation**: `modules/custom/event_registration/README.md`
- **Database Schema**: `modules/custom/event_registration/event_registration.sql`

---

## ✅ FOSSEE Requirements

- [x] composer.json
- [x] composer.lock
- [x] Custom module directory
- [x] .sql file for database tables
- [x] README.md (mandatory)

---

## 👤 Author

**FOSSEE Internship Task Submission**  
**Date**: February 2026  
**Drupal Version**: 10.x

---

**GitHub Repository**: https://github.com/YOUR_USERNAME/fossee-event-registration

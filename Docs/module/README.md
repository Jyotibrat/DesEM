# Event Registration Module - Code Documentation

## Overview

This directory contains technical documentation explaining the code implementation of the Event Registration module for Drupal 10.

## Documentation Files

1. [***Module Structure***](MODULE_STRUCTURE.md) - Overall architecture and file organization
2. [***Forms Implementation***](FORMS.md) - Detailed explanation of form classes
3. [***Controller Implementation***](CONTROLLER.md) - Controller class documentation
4. [***Service Implementation***](SERVICE.md) - Email service implementation
5. [***Database Layer***](DATABASE_LAYER.md) - Database operations and schema
6. [***Hooks and*** ***Callbacks***](HOOKS.md) - Hook implementations and AJAX callbacks
7. [***Routing and*** ***Permissions***](ROUTING.md) - Route definitions and access control

## Purpose

These documents provide in-depth technical explanations of the module's code, including:

- Class structure and methods
- Implementation patterns
- Code flow and logic
- Database operations
- Security measures
- AJAX functionality
- Dependency injection

## Target Audience

- Developers maintaining or extending the module
- Code reviewers
- Technical evaluators
- Students learning Drupal module development

## Module Information

**Name:** Event Registration  
**Machine Name:** event_registration  
**Type:** Custom Drupal Module  
**Drupal Version:** 10.x  
**PHP Version:** 8.1+

## Quick Reference

**Main Components:**
- 3 Form classes (EventRegistrationForm, EventConfigForm, AdminConfigForm)
- 1 Controller class (RegistrationListController)
- 1 Service class (EmailService)
- 2 Database tables (event_registration_config, event_registration_data)
- 5 Routes
- 2 Permissions

**Key Features:**
- AJAX cascading dropdowns
- Form validation
- Email notifications
- CSV export
- Database abstraction
- Dependency injection

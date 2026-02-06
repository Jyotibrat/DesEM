# Module Structure

## Directory Structure

```
modules/
└── custom/
    └── event_registration/
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

## File Purposes

### Root Level Files

#### event_registration.info.yml

Defines module metadata for Drupal.

```yaml
name: Event Registration
type: module
description: 'Custom module for event registration with AJAX forms'
core_version_requirement: ^10
package: Custom
```

**Key Elements:**
- `name`: Display name in Drupal UI
- `type`: Identifies this as a module
- `core_version_requirement`: Drupal version compatibility
- `package`: Groups module in "Custom" section

#### event_registration.module

Contains hook implementations and helper functions.

**Functions Defined:**
- `event_registration_mail()`: Defines email templates

**Purpose:**
- Implements Drupal hooks
- Provides module-level functionality
- Defines email message templates

#### event_registration.install

Handles installation, updates, and uninstallation.

**Functions Defined:**
- `event_registration_schema()`: Defines database schema
- `event_registration_install()`: Installation tasks
- `event_registration_uninstall()`: Cleanup tasks

**Purpose:**
- Create database tables on installation
- Remove data on uninstallation
- Handle module updates

#### event_registration.routing.yml

Defines URL routes and their handlers.

**Routes Defined:**
- `/event-registration`: Public registration form
- `/admin/config/event-registration/config`: Event configuration
- `/admin/config/event-registration/settings`: Admin settings
- `/admin/event-registration/list`: Registration listing
- `/admin/event-registration/export`: CSV export

**Structure:**
```yaml
route_name:
  path: '/path'
  defaults:
    _form: 'FormClass'
    _title: 'Page Title'
  requirements:
    _permission: 'permission_name'
```

#### event_registration.permissions.yml

Defines custom permissions.

**Permissions:**
- `access event registration form`: For public users
- `administer event registration`: For administrators

**Structure:**
```yaml
permission_name:
  title: 'Permission Title'
  description: 'Permission description'
  restrict access: true/false
```

#### event_registration.services.yml

Defines dependency injection services.

**Services:**
- `event_registration.email`: Email service

**Structure:**
```yaml
services:
  service_name:
    class: Namespace\ClassName
    arguments: ['@dependency1', '@dependency2']
```

#### event_registration.sql

Contains raw SQL schema for reference.

**Purpose:**
- Documentation of database structure
- Manual table creation if needed
- Reference for database administrators

### config/install/

Contains default configuration installed with the module.

#### event_registration.settings.yml

Default configuration values.

```yaml
admin_email: ''
enable_notifications: false
```

**Purpose:**
- Provides initial configuration
- Defines configuration schema
- Sets default values

### src/ Directory

Contains all PHP classes following PSR-4 autoloading.

#### Namespace Structure

All classes use the base namespace:
```php
Drupal\event_registration\{Type}\{ClassName}
```

**Examples:**
- `Drupal\event_registration\Form\EventRegistrationForm`
- `Drupal\event_registration\Controller\RegistrationListController`
- `Drupal\event_registration\Service\EmailService`

#### src/Form/

Contains form classes extending Drupal's Form API.

**Files:**
- `EventRegistrationForm.php`: Public registration form
- `EventConfigForm.php`: Event creation form
- `AdminConfigForm.php`: Admin settings form

**Base Classes:**
- `FormBase`: For standard forms
- `ConfigFormBase`: For configuration forms

#### src/Controller/

Contains controller classes for page rendering.

**Files:**
- `RegistrationListController.php`: Handles listing and export

**Base Class:**
- `ControllerBase`: Provides common controller functionality

#### src/Service/

Contains service classes for reusable functionality.

**Files:**
- `EmailService.php`: Handles email sending

**Purpose:**
- Encapsulate business logic
- Provide reusable functionality
- Enable dependency injection

## Autoloading

The module uses PSR-4 autoloading provided by Drupal.

**Mapping:**
```
Drupal\event_registration\ => modules/custom/event_registration/src/
```

**Example:**
```
Class: Drupal\event_registration\Form\EventRegistrationForm
File:  modules/custom/event_registration/src/Form/EventRegistrationForm.php
```

## Dependency Management

### External Dependencies

None. The module uses only Drupal core dependencies.

### Internal Dependencies

**Service Dependencies:**
- Database connection (`@database`)
- Mail manager (`@plugin.manager.mail`)
- Config factory (`@config.factory`)
- Language manager (`@language_manager`)

**Dependency Injection:**

All dependencies are injected through constructors:

```php
public function __construct(Connection $database, EmailService $email_service) {
  $this->database = $database;
  $this->emailService = $email_service;
}

public static function create(ContainerInterface $container) {
  return new static(
    $container->get('database'),
    $container->get('event_registration.email')
  );
}
```

## Configuration Management

### Configuration Storage

Configuration is stored in Drupal's configuration system.

**Config Name:** `event_registration.settings`

**Access:**
```php
$config = \Drupal::config('event_registration.settings');
$admin_email = $config->get('admin_email');
```

### Editable Configuration

Managed through `AdminConfigForm` extending `ConfigFormBase`.

## Database Schema

### Tables Created

1. **event_registration_config**
   - Stores event configuration
   - Primary key: `id`
   - Indexes: `category`, `event_date`

2. **event_registration_data**
   - Stores user registrations
   - Primary key: `id`
   - Foreign key: `event_id` → `event_registration_config.id`
   - Unique constraint: `(email, event_date)`

### Schema Definition

Defined in `event_registration_schema()` hook in `event_registration.install`.

## Code Organization Principles

### Separation of Concerns

- **Forms**: Handle user input and validation
- **Controllers**: Handle page rendering and responses
- **Services**: Encapsulate business logic
- **Hooks**: Integrate with Drupal systems

### Single Responsibility

Each class has a single, well-defined purpose:
- `EventRegistrationForm`: User registration
- `EventConfigForm`: Event creation
- `AdminConfigForm`: Settings management
- `RegistrationListController`: Data display and export
- `EmailService`: Email operations

### Dependency Injection

All dependencies are injected, not instantiated directly:
- Improves testability
- Reduces coupling
- Follows Drupal best practices

### Drupal API Usage

The module uses Drupal APIs exclusively:
- Form API for forms
- Database API for queries
- Mail API for emails
- Config API for settings
- Routing API for URLs

## Security Measures

### Input Validation

- Form API validation
- Database API parameterized queries
- XSS prevention through render arrays

### Access Control

- Permission-based route access
- CSRF token validation (automatic)
- SQL injection prevention (Database API)

### Data Sanitization

- User input sanitized through Form API
- Output escaped through render system
- Email addresses validated

## Performance Considerations

### Database Optimization

- Indexes on frequently queried columns
- Foreign key relationships
- Efficient query structure

### Caching

- Respects Drupal's caching system
- No custom caching implemented

### AJAX Optimization

- Minimal data transfer
- Targeted element updates
- Efficient callbacks

## Extensibility

### Extension Points

1. **Add new event categories**: Modify form options
2. **Customize email templates**: Modify `event_registration_mail()`
3. **Add new fields**: Update schema, forms, and validation
4. **Add new export formats**: Extend `RegistrationListController`

### Hook System

The module implements standard Drupal hooks:
- `hook_schema()`: Database schema
- `hook_mail()`: Email templates
- `hook_install()`: Installation tasks
- `hook_uninstall()`: Cleanup tasks

## Testing Strategy

### Manual Testing

- Form submission
- Validation rules
- AJAX functionality
- Email delivery
- Data export

### Automated Testing

Can be tested using:
- Drupal's PHPUnit framework
- Functional tests
- Kernel tests

## Documentation Standards

### Code Comments

- PHPDoc blocks for classes and methods
- Inline comments for complex logic
- Clear variable naming

### Naming Conventions

- Classes: PascalCase
- Methods: camelCase
- Variables: camelCase
- Constants: UPPER_SNAKE_CASE
- Database tables: snake_case

## Version Control

### Git Ignore

Standard Drupal .gitignore patterns apply.

### Commit Strategy

- Atomic commits
- Descriptive commit messages
- Feature branches for development

## Deployment

### Installation Process

1. Copy module to `modules/custom/`
2. Enable via Drush or UI
3. Configure permissions
4. Configure settings

### Update Process

1. Update module files
2. Run database updates (if any)
3. Clear cache
4. Test functionality
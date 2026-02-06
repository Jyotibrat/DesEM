# Routing and Permissions

## Overview

This document explains the routing system and permission structure of the Event Registration module.

## Routing System

### Route Definition File

**File:** `event_registration.routing.yml`  
**Purpose:** Defines all URLs and their handlers.

### Route Structure

```yaml
route_name:
  path: '/url-path'
  defaults:
    _form: 'FormClass'  # or _controller
    _title: 'Page Title'
  requirements:
    _permission: 'permission_name'
  options:
    _admin_route: TRUE  # Optional
```

## Defined Routes

### event_registration.form

**Public registration form route.**

```yaml
event_registration.form:
  path: '/event-registration'
  defaults:
    _form: '\Drupal\event_registration\Form\EventRegistrationForm'
    _title: 'Event Registration'
  requirements:
    _permission: 'access event registration form'
```

**Components:**
- **path:** URL path (`/event-registration`)
- **_form:** Form class to display
- **_title:** Page title
- **_permission:** Required permission

**Access:** Any user with 'access event registration form' permission.

**URL:** `http://example.com/event-registration`

### event_registration.config

**Event configuration form route.**

```yaml
event_registration.config:
  path: '/admin/config/event-registration/config'
  defaults:
    _form: '\Drupal\event_registration\Form\EventConfigForm'
    _title: 'Event Configuration'
  requirements:
    _permission: 'administer event registration'
  options:
    _admin_route: TRUE
```

**Components:**
- **path:** Admin path (`/admin/config/event-registration/config`)
- **_admin_route:** Marks as admin route (uses admin theme)

**Access:** Only administrators.

**URL:** `http://example.com/admin/config/event-registration/config`

### event_registration.settings

**Admin settings form route.**

```yaml
event_registration.settings:
  path: '/admin/config/event-registration/settings'
  defaults:
    _form: '\Drupal\event_registration\Form\AdminConfigForm'
    _title: 'Event Registration Settings'
  requirements:
    _permission: 'administer event registration'
  options:
    _admin_route: TRUE
```

**Access:** Only administrators.

**URL:** `http://example.com/admin/config/event-registration/settings`

### event_registration.list

**Registration listing route.**

```yaml
event_registration.list:
  path: '/admin/event-registration/list'
  defaults:
    _controller: '\Drupal\event_registration\Controller\RegistrationListController::listRegistrations'
    _title: 'Event Registrations'
  requirements:
    _permission: 'administer event registration'
  options:
    _admin_route: TRUE
```

**Components:**
- **_controller:** Controller method (Class::method format)

**Access:** Only administrators.

**URL:** `http://example.com/admin/event-registration/list`

### event_registration.export

**CSV export route.**

```yaml
event_registration.export:
  path: '/admin/event-registration/export'
  defaults:
    _controller: '\Drupal\event_registration\Controller\RegistrationListController::exportCsv'
    _title: 'Export Registrations'
  requirements:
    _permission: 'administer event registration'
  options:
    _admin_route: TRUE
```

**Access:** Only administrators.

**URL:** `http://example.com/admin/event-registration/export`

**Returns:** CSV file download (not HTML page).

## Permission System

### Permission Definition File

**File:** `event_registration.permissions.yml`  
**Purpose:** Defines custom permissions.

### Permission Structure

```yaml
permission_name:
  title: 'Permission Title'
  description: 'Permission description'
  restrict access: true/false
```

## Defined Permissions

### access event registration form

**Public form access permission.**

```yaml
access event registration form:
  title: 'Access event registration form'
  description: 'Allows users to view and submit the event registration form'
```

**Purpose:** Controls who can register for events.

**Typical Assignment:**
- Anonymous users: Yes
- Authenticated users: Yes
- Administrators: Yes

**Routes Using This:**
- `event_registration.form`

### administer event registration

**Administrative permission.**

```yaml
administer event registration:
  title: 'Administer event registration'
  description: 'Allows users to configure events, view registrations, and manage settings'
  restrict access: TRUE
```

**Components:**
- **restrict access:** Marks as administrative permission (shows warning in UI)

**Purpose:** Controls access to all administrative functions.

**Typical Assignment:**
- Anonymous users: No
- Authenticated users: No
- Administrators: Yes

**Routes Using This:**
- `event_registration.config`
- `event_registration.settings`
- `event_registration.list`
- `event_registration.export`

## Route Types

### Form Routes

**Use _form in defaults:**

```yaml
defaults:
  _form: '\Drupal\event_registration\Form\EventRegistrationForm'
```

**Characteristics:**
- Displays a form
- Handles form submission
- Includes CSRF protection
- Supports AJAX

**Module Examples:**
- Event registration form
- Event configuration form
- Admin settings form

### Controller Routes

**Use _controller in defaults:**

```yaml
defaults:
  _controller: '\Drupal\event_registration\Controller\RegistrationListController::listRegistrations'
```

**Characteristics:**
- Returns render array or Response object
- More flexible than forms
- Can return non-HTML responses (CSV, JSON, etc.)

**Module Examples:**
- Registration listing
- CSV export

## Access Control

### Permission-Based Access

**Most common pattern:**

```yaml
requirements:
  _permission: 'permission_name'
```

**Access granted if:** User has the specified permission.

### Multiple Permissions

**Require ANY permission (OR):**

```yaml
requirements:
  _permission: 'permission1+permission2'
```

**Require ALL permissions (AND):**

```yaml
requirements:
  _permission: 'permission1,permission2'
```

**Not used in this module.**

### Role-Based Access

**Alternative to permissions:**

```yaml
requirements:
  _role: 'administrator'
```

**Not used in this module** (permissions are more flexible).

### Custom Access Checks

**For complex logic:**

```yaml
requirements:
  _custom_access: '\Drupal\module\Access\CustomAccessCheck::access'
```

**Not needed in this module** (simple permission checks suffice).

## Admin Routes

### Admin Route Option

```yaml
options:
  _admin_route: TRUE
```

**Effects:**
- Uses admin theme (instead of default theme)
- Appears in admin menu/toolbar
- Indicates administrative function

**All admin routes in module use this.**

## URL Generation

### In Code

**Generate URL from route:**

```php
$url = \Drupal\Core\Url::fromRoute('event_registration.form');
```

**Generate URL with parameters:**

```php
$url = \Drupal\Core\Url::fromRoute('event_registration.export', [
  'event_id' => $id,
]);
```

**Generate link:**

```php
$link = \Drupal\Core\Link::fromTextAndUrl('Register', 
  \Drupal\Core\Url::fromRoute('event_registration.form'));
```

### In Render Arrays

**Link element:**

```php
$build['link'] = [
  '#type' => 'link',
  '#title' => $this->t('Export to CSV'),
  '#url' => \Drupal\Core\Url::fromRoute('event_registration.export'),
];
```

**Used in RegistrationListController for export link.**

### In Twig Templates

**Generate URL:**

```twig
{{ url('event_registration.form') }}
```

**Generate link:**

```twig
<a href="{{ path('event_registration.form') }}">Register</a>
```

## Route Parameters

### Dynamic Parameters

**Not used in current module, but example:**

```yaml
route_name:
  path: '/event/{event_id}'
  defaults:
    _controller: 'Controller::method'
  requirements:
    event_id: '\d+'  # Must be numeric
```

**Access in controller:**

```php
public function method($event_id) {
  // $event_id available as parameter
}
```

## Menu Integration

### Menu Links

**Not defined in module** (routes accessible via direct URL).

**Could be added in event_registration.links.menu.yml:**

```yaml
event_registration.admin:
  title: 'Event Registration'
  route_name: event_registration.list
  parent: system.admin_config
  weight: 10
```

## Route Caching

### Cache Clearing

**When to clear:**
- After modifying routing.yml
- After adding new routes
- After changing permissions

**How to clear:**

```bash
drush cr
```

**Or via UI:**
- Configuration > Development > Performance > Clear all caches

## Security Considerations

### CSRF Protection

**Forms:** Automatic CSRF token validation.

**Controllers:** No automatic CSRF protection (not needed for read-only operations).

### Permission Checks

**Always required:**

```yaml
requirements:
  _permission: 'some_permission'
```

**Never omit permission requirements** (except for truly public routes).

### Access Denied

**If user lacks permission:**
- Returns 403 Forbidden
- Shows "Access denied" message
- Logs access attempt

## Best Practices Demonstrated

1. **Descriptive route names** - Use module_name.action format
2. **Logical URL paths** - Admin routes under /admin
3. **Appropriate permissions** - Separate public and admin permissions
4. **Admin route marking** - Use _admin_route for admin pages
5. **Consistent naming** - Route names match functionality
6. **Security first** - All routes require permissions
7. **Clear titles** - Descriptive page titles

## Route Overview Table

| Route | Path | Handler | Permission | Public |
|-------|------|---------|------------|--------|
| event_registration.form | /event-registration | EventRegistrationForm | access event registration form | Yes |
| event_registration.config | /admin/config/event-registration/config | EventConfigForm | administer event registration | No |
| event_registration.settings | /admin/config/event-registration/settings | AdminConfigForm | administer event registration | No |
| event_registration.list | /admin/event-registration/list | RegistrationListController::listRegistrations | administer event registration | No |
| event_registration.export | /admin/event-registration/export | RegistrationListController::exportCsv | administer event registration | No |
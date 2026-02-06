# Database Layer

## Overview

The module uses Drupal's Database API for all database operations, providing security, abstraction, and database independence.

## Database Tables

### event_registration_config

**Purpose:** Stores event configuration created by administrators.

**Schema Definition (event_registration.install):**

```php
$schema['event_registration_config'] = [
  'description' => 'Stores event configuration data',
  'fields' => [
    'id' => [
      'type' => 'serial',
      'not null' => TRUE,
      'description' => 'Primary Key: Unique event ID',
    ],
    'registration_start_date' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Registration start date timestamp',
    ],
    'registration_end_date' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Registration end date timestamp',
    ],
    'event_date' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Event date timestamp',
    ],
    'event_name' => [
      'type' => 'varchar',
      'length' => 255,
      'not null' => TRUE,
      'description' => 'Name of the event',
    ],
    'category' => [
      'type' => 'varchar',
      'length' => 100,
      'not null' => TRUE,
      'description' => 'Category of the event',
    ],
    'created' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Timestamp when the event was created',
    ],
  ],
  'primary key' => ['id'],
  'indexes' => [
    'category' => ['category'],
    'event_date' => ['event_date'],
  ],
];
```

**Field Types:**
- `serial`: Auto-incrementing integer (becomes INT AUTO_INCREMENT in MySQL)
- `int`: Unix timestamp (32-bit integer)
- `varchar`: Variable-length string

**Indexes:**
- `category`: Speeds up category-based queries
- `event_date`: Speeds up date-based queries and sorting

### event_registration_data

**Purpose:** Stores user registration submissions.

**Schema Definition:**

```php
$schema['event_registration_data'] = [
  'description' => 'Stores user event registration data',
  'fields' => [
    'id' => [
      'type' => 'serial',
      'not null' => TRUE,
      'description' => 'Primary Key: Unique registration ID',
    ],
    'full_name' => [
      'type' => 'varchar',
      'length' => 255,
      'not null' => TRUE,
      'description' => 'Full name of the registrant',
    ],
    'email' => [
      'type' => 'varchar',
      'length' => 255,
      'not null' => TRUE,
      'description' => 'Email address of the registrant',
    ],
    'college_name' => [
      'type' => 'varchar',
      'length' => 255,
      'not null' => TRUE,
      'description' => 'College name of the registrant',
    ],
    'department' => [
      'type' => 'varchar',
      'length' => 255,
      'not null' => TRUE,
      'description' => 'Department of the registrant',
    ],
    'category' => [
      'type' => 'varchar',
      'length' => 100,
      'not null' => TRUE,
      'description' => 'Category of the event',
    ],
    'event_date' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Event date timestamp',
    ],
    'event_id' => [
      'type' => 'int',
      'unsigned' => TRUE,
      'not null' => TRUE,
      'description' => 'Foreign key to event_registration_config.id',
    ],
    'created' => [
      'type' => 'int',
      'not null' => TRUE,
      'description' => 'Timestamp when the registration was created',
    ],
  ],
  'primary key' => ['id'],
  'unique keys' => [
    'email_event_date' => ['email', 'event_date'],
  ],
  'indexes' => [
    'event_id' => ['event_id'],
    'email' => ['email'],
    'event_date' => ['event_date'],
  ],
  'foreign keys' => [
    'event_config' => [
      'table' => 'event_registration_config',
      'columns' => ['event_id' => 'id'],
    ],
  ],
];
```

**Unique Key:**
- `email_event_date`: Prevents duplicate registrations (same email for same event date)

**Foreign Key:**
- `event_id` references `event_registration_config.id`
- Ensures referential integrity
- CASCADE delete (deleting event deletes registrations)

## Database API Usage

### SELECT Queries

**Basic Select:**
```php
$results = $this->database->select('event_registration_config', 'e')
  ->fields('e')
  ->execute()
  ->fetchAll();
```

**With Conditions:**
```php
$results = $this->database->select('event_registration_config', 'e')
  ->fields('e')
  ->condition('category', $category)
  ->condition('event_date', $event_date)
  ->execute()
  ->fetchAll();
```

**With JOIN:**
```php
$query = $this->database->select('event_registration_data', 'r');
$query->leftJoin('event_registration_config', 'e', 'r.event_id = e.id');
$query->fields('r');
$query->fields('e', ['event_name']);
$results = $query->execute()->fetchAll();
```

**Fetch Methods:**
- `fetchAll()`: Returns array of all result objects
- `fetchObject()`: Returns single result object
- `fetchField()`: Returns single field value
- `fetchAssoc()`: Returns associative array

### INSERT Queries

**Basic Insert:**
```php
$this->database->insert('event_registration_data')
  ->fields([
    'full_name' => $name,
    'email' => $email,
    'created' => time(),
  ])
  ->execute();
```

**Why fields() Method:**
- Accepts associative array of column => value
- Automatically escapes values
- Prevents SQL injection

### UPDATE Queries

**Example (not used in current module):**
```php
$this->database->update('event_registration_config')
  ->fields(['event_name' => $new_name])
  ->condition('id', $event_id)
  ->execute();
```

### DELETE Queries

**Example (not used in current module):**
```php
$this->database->delete('event_registration_data')
  ->condition('event_id', $event_id)
  ->execute();
```

## Query Building Patterns

### Method Chaining

All Database API methods return the query object, allowing chaining:

```php
$results = $this->database->select('table', 't')
  ->fields('t')
  ->condition('field', $value)
  ->orderBy('created', 'DESC')
  ->range(0, 10)
  ->execute()
  ->fetchAll();
```

### Conditional Query Building

```php
$query = $this->database->select('event_registration_data', 'r');
$query->fields('r');

if (!empty($selected_date)) {
  $query->condition('event_date', $selected_date);
}

if (!empty($selected_event)) {
  $query->condition('event_id', $selected_event);
}

$results = $query->execute()->fetchAll();
```

**Pattern:** Build query conditionally based on filters.

### DISTINCT Queries

```php
$dates = $this->database->select('event_registration_config', 'e')
  ->fields('e', ['event_date'])
  ->distinct()
  ->execute()
  ->fetchAll();
```

**Purpose:** Get unique values (removes duplicates).

### Ordering

```php
$query->orderBy('created', 'DESC');  // Newest first
$query->orderBy('event_date', 'ASC'); // Oldest first
```

### Limiting Results

```php
$query->range(0, 10);  // LIMIT 10 OFFSET 0
```

## Security Features

### Parameterized Queries

Database API automatically uses parameterized queries:

```php
// SAFE - value is parameterized
$query->condition('email', $user_input);

// Generates: WHERE email = :email
// Parameters: [':email' => $user_input]
```

### SQL Injection Prevention

**Never do this:**
```php
// UNSAFE - direct concatenation
$query = "SELECT * FROM table WHERE email = '$email'";
```

**Always do this:**
```php
// SAFE - using Database API
$query->condition('email', $email);
```

### Value Escaping

All values are automatically escaped:
- Strings are quoted
- Special characters are escaped
- NULL values handled correctly

## Database Independence

### Abstraction Layer

Database API works with:
- MySQL / MariaDB
- PostgreSQL
- SQLite

**Same code works on all databases.**

### Schema API

Schema definitions are database-independent:

```php
'type' => 'serial'  // Becomes AUTO_INCREMENT (MySQL) or SERIAL (PostgreSQL)
'type' => 'varchar' // Becomes VARCHAR on all databases
'type' => 'int'     // Becomes INT or INTEGER
```

## Transaction Support

### Example (not used in current module):

```php
$transaction = $this->database->startTransaction();
try {
  // Multiple queries
  $this->database->insert('table1')->fields([...])->execute();
  $this->database->insert('table2')->fields([...])->execute();
  // Transaction commits automatically when $transaction goes out of scope
} catch (\Exception $e) {
  $transaction->rollBack();
  throw $e;
}
```

## Performance Optimization

### Indexes

**Purpose:** Speed up queries on indexed columns.

**Module Indexes:**
- `category`: Used in WHERE clauses
- `event_date`: Used in WHERE and ORDER BY
- `event_id`: Used in JOINs
- `email`: Used in duplicate checking

### Query Optimization

**Use specific fields instead of *:**
```php
// Better
->fields('e', ['id', 'event_name'])

// Avoid
->fields('e')  // Selects all columns
```

**Use DISTINCT only when needed:**
```php
// Only when duplicates are possible
->distinct()
```

**Add indexes for frequently queried columns.**

## Common Query Patterns in Module

### Get Active Events

```php
$current_time = \Drupal::time()->getRequestTime();
$active_events = $this->database->select('event_registration_config', 'e')
  ->fields('e')
  ->condition('registration_start_date', $current_time, '<=')
  ->condition('registration_end_date', $current_time, '>=')
  ->execute()
  ->fetchAll();
```

### Check for Duplicate Registration

```php
$existing = $this->database->select('event_registration_data', 'r')
  ->fields('r', ['id'])
  ->condition('email', $email)
  ->condition('event_date', $event_date)
  ->execute()
  ->fetchField();

if ($existing) {
  // Duplicate found
}
```

### Get Registrations with Event Details

```php
$query = $this->database->select('event_registration_data', 'r');
$query->leftJoin('event_registration_config', 'e', 'r.event_id = e.id');
$query->fields('r');
$query->fields('e', ['event_name']);
$results = $query->execute()->fetchAll();
```

## Date Handling

### Storing Dates

**Always use Unix timestamps:**
```php
'created' => \Drupal::time()->getRequestTime()
'event_date' => strtotime($date_string)
```

**Why Unix timestamps:**
- Database independent
- Easy to compare
- Compact storage (4 bytes)
- No timezone issues

### Converting for Display

```php
date('F j, Y', $timestamp)           // "February 4, 2026"
date('Y-m-d', $timestamp)            // "2026-02-04"
date('Y-m-d H:i:s', $timestamp)      // "2026-02-04 14:30:00"
date('F j, Y - g:i A', $timestamp)   // "February 4, 2026 - 2:30 PM"
```

### Converting from Input

```php
strtotime('2026-02-04')  // Converts to Unix timestamp
```

## Error Handling

### Database Exceptions

Database errors throw `DatabaseExceptionWrapper`:

```php
try {
  $this->database->insert('table')->fields([...])->execute();
} catch (DatabaseExceptionWrapper $e) {
  \Drupal::logger('event_registration')->error($e->getMessage());
}
```

### Constraint Violations

Unique key violations throw exceptions:

```php
// Duplicate email + event_date
// Throws: IntegrityConstraintViolationException
```

**Module handles this via validation before insert.**

## Best Practices Demonstrated

1. **Use Database API exclusively** - Never write raw SQL
2. **Parameterized queries** - Automatic SQL injection prevention
3. **Proper indexing** - Optimize frequently queried columns
4. **Foreign keys** - Maintain referential integrity
5. **Unique constraints** - Prevent duplicate data
6. **Unix timestamps** - Database-independent date storage
7. **Conditional queries** - Build queries based on filters
8. **Specific field selection** - Don't select unnecessary data
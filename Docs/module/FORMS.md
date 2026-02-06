# Forms Implementation

## Overview

The module contains three form classes that handle different aspects of the event registration system. All forms extend Drupal's Form API base classes and follow dependency injection patterns.

## EventRegistrationForm

### Purpose

Public-facing form for users to register for events. Features AJAX cascading dropdowns and comprehensive validation.

### Class Declaration

```php
namespace Drupal\event_registration\Form;

class EventRegistrationForm extends FormBase {
  protected $database;
  protected $emailService;
}
```

### Dependencies

**Injected Services:**
- `Connection $database`: Database connection for querying events and saving registrations
- `EmailService $email_service`: Custom service for sending confirmation emails

**Dependency Injection Implementation:**

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

**Why Dependency Injection:**
- Improves testability (dependencies can be mocked)
- Reduces coupling between classes
- Follows Drupal 10 best practices
- Enables service reuse across the application

### Form ID

```php
public function getFormId() {
  return 'event_registration_form';
}
```

**Purpose:** Unique identifier for the form used by Drupal's Form API.

### buildForm() Method

**Signature:**
```php
public function buildForm(array $form, FormStateInterface $form_state): array
```

**Flow:**

1. **Check for Active Events (Lines 66-80)**
   ```php
   $current_time = \Drupal::time()->getRequestTime();
   $active_events = $this->database->select('event_registration_config', 'e')
     ->fields('e')
     ->condition('registration_start_date', $current_time, '<=')
     ->condition('registration_end_date', $current_time, '>=')
     ->execute()
     ->fetchAll();
   ```
   
   **Logic:**
   - Gets current Unix timestamp
   - Queries database for events where current time falls within registration period
   - If no active events, displays warning message and returns early
   
   **Why:** Prevents users from seeing an empty form when no events are available

2. **Personal Information Fields (Lines 82-108)**
   
   **Full Name Field:**
   ```php
   $form['full_name'] = [
     '#type' => 'textfield',
     '#title' => $this->t('Full Name'),
     '#required' => TRUE,
     '#maxlength' => 255,
   ];
   ```
   
   **Email Field:**
   ```php
   $form['email'] = [
     '#type' => 'email',
     '#title' => $this->t('Email Address'),
     '#required' => TRUE,
     '#maxlength' => 255,
   ];
   ```
   
   **Field Properties:**
   - `#type`: Defines HTML input type and validation
   - `#title`: Label displayed to user
   - `#required`: Makes field mandatory
   - `#maxlength`: Matches database column length (255 characters)
   
   **Why email type:** Provides built-in HTML5 email validation in browsers

3. **Category Dropdown with AJAX (Lines 110-126)**
   
   ```php
   // Extract unique categories from active events
   $categories = [];
   foreach ($active_events as $event) {
     $categories[$event->category] = $event->category;
   }
   
   $form['category'] = [
     '#type' => 'select',
     '#title' => $this->t('Category of the Event'),
     '#required' => TRUE,
     '#options' => ['' => $this->t('- Select Category -')] + $categories,
     '#ajax' => [
       'callback' => '::updateEventDates',
       'wrapper' => 'event-date-wrapper',
       'event' => 'change',
     ],
   ];
   ```
   
   **AJAX Configuration:**
   - `callback`: Method to call when dropdown changes (`updateEventDates`)
   - `wrapper`: HTML element ID to replace with response
   - `event`: JavaScript event that triggers AJAX ('change')
   
   **Why Dynamic Categories:** Only shows categories for events currently open for registration

4. **Event Date Dropdown (Lines 128-150)**
   
   ```php
   $form['event_date_wrapper'] = [
     '#type' => 'container',
     '#attributes' => ['id' => 'event-date-wrapper'],
   ];
   
   $form['event_date_wrapper']['event_date'] = [
     '#type' => 'select',
     '#title' => $this->t('Event Date'),
     '#required' => TRUE,
     '#options' => ['' => $this->t('- Select Event Date -')],
     '#ajax' => [
       'callback' => '::updateEventNames',
       'wrapper' => 'event-name-wrapper',
       'event' => 'change',
     ],
   ];
   ```
   
   **Container Wrapper:**
   - Required for AJAX to replace the element
   - ID matches the 'wrapper' in category AJAX config
   
   **Dynamic Population:**
   ```php
   $selected_category = $form_state->getValue('category');
   if (!empty($selected_category)) {
     $event_dates = $this->getEventDatesByCategory($selected_category);
     $form['event_date_wrapper']['event_date']['#options'] = 
       ['' => $this->t('- Select Event Date -')] + $event_dates;
   }
   ```
   
   **Why:** Populates dates during form rebuild (after AJAX or validation errors)

5. **Event Name Dropdown (Lines 152-169)**
   
   ```php
   $form['event_name_wrapper'] = [
     '#type' => 'container',
     '#attributes' => ['id' => 'event-name-wrapper'],
   ];
   
   $form['event_name_wrapper']['event_name'] = [
     '#type' => 'select',
     '#title' => $this->t('Event Name'),
     '#required' => TRUE,
     '#options' => ['' => $this->t('- Select Event Name -')],
   ];
   
   $selected_date = $form_state->getValue('event_date');
   if (!empty($selected_category) && !empty($selected_date)) {
     $event_names = $this->getEventNamesByCategoryAndDate($selected_category, $selected_date);
     $form['event_name_wrapper']['event_name']['#options'] = 
       ['' => $this->t('- Select Event Name -')] + $event_names;
   }
   ```
   
   **Cascading Logic:** Requires both category AND date to be selected before populating

6. **Submit Button (Lines 171-179)**
   
   ```php
   $form['actions'] = [
     '#type' => 'actions',
   ];
   
   $form['actions']['submit'] = [
     '#type' => 'submit',
     '#value' => $this->t('Register'),
     '#button_type' => 'primary',
   ];
   ```
   
   **button_type:** 'primary' gives the button prominent styling

### AJAX Callback Methods

#### updateEventDates()

```php
public function updateEventDates(array &$form, FormStateInterface $form_state) {
  return $form['event_date_wrapper'];
}
```

**Purpose:** Returns the event date wrapper to replace via AJAX

**Flow:**
1. User selects category
2. JavaScript triggers 'change' event
3. Drupal calls this method
4. Method returns event_date_wrapper element
5. AJAX replaces the wrapper with new content
6. Event dates are now populated based on selected category

**Why Return Wrapper:** AJAX needs to replace the entire container to update the dropdown options

#### updateEventNames()

```php
public function updateEventNames(array &$form, FormStateInterface $form_state) {
  return $form['event_name_wrapper'];
}
```

**Purpose:** Returns the event name wrapper to replace via AJAX

**Same pattern as updateEventDates but for the second level of cascading**

### Helper Methods

#### getEventDatesByCategory()

```php
protected function getEventDatesByCategory($category) {
  $current_time = \Drupal::time()->getRequestTime();
  $results = $this->database->select('event_registration_config', 'e')
    ->fields('e', ['event_date'])
    ->condition('category', $category)
    ->condition('registration_start_date', $current_time, '<=')
    ->condition('registration_end_date', $current_time, '>=')
    ->distinct()
    ->execute()
    ->fetchAll();
  
  $dates = [];
  foreach ($results as $result) {
    $dates[$result->event_date] = date('F j, Y', $result->event_date);
  }
  
  return $dates;
}
```

**Query Breakdown:**
- `select('event_registration_config', 'e')`: Query the config table, alias as 'e'
- `fields('e', ['event_date'])`: Select only event_date column
- `condition('category', $category)`: Filter by selected category
- `condition('registration_start_date', ...)`: Only active events
- `distinct()`: Remove duplicate dates
- `fetchAll()`: Get all results as objects

**Date Formatting:**
- Key: Unix timestamp (for database storage)
- Value: Formatted date like "February 4, 2026" (for display)

**Why Distinct:** Multiple events can have the same date

#### getEventNamesByCategoryAndDate()

```php
protected function getEventNamesByCategoryAndDate($category, $event_date) {
  $current_time = \Drupal::time()->getRequestTime();
  $results = $this->database->select('event_registration_config', 'e')
    ->fields('e', ['id', 'event_name'])
    ->condition('category', $category)
    ->condition('event_date', $event_date)
    ->condition('registration_start_date', $current_time, '<=')
    ->condition('registration_end_date', $current_time, '>=')
    ->execute()
    ->fetchAll();
  
  $names = [];
  foreach ($results as $result) {
    $names[$result->id] = $result->event_name;
  }
  
  return $names;
}
```

**Key Difference from getEventDatesByCategory:**
- Selects both 'id' and 'event_name'
- Filters by both category AND event_date
- No distinct() needed (event names are unique per date/category combination)
- Returns array with event ID as key (needed for form submission)

**Why ID as Key:** When form is submitted, we need the event ID to create the foreign key relationship

### validateForm() Method

```php
public function validateForm(array &$form, FormStateInterface $form_state) {
  // Validation logic
}
```

**Validation Rules:**

1. **Special Character Validation (Lines 251-258)**
   
   ```php
   $text_fields = ['full_name', 'college_name', 'department'];
   foreach ($text_fields as $field) {
     $value = $form_state->getValue($field);
     if (!preg_match('/^[a-zA-Z0-9\s]+$/', $value)) {
       $form_state->setErrorByName($field, 
         $this->t('@field should not contain special characters.', 
           ['@field' => ucfirst(str_replace('_', ' ', $field))]));
     }
   }
   ```
   
   **Regex Pattern:** `/^[a-zA-Z0-9\s]+$/`
   - `^`: Start of string
   - `[a-zA-Z0-9\s]+`: One or more letters, numbers, or spaces
   - `$`: End of string
   
   **Allowed:** Letters, numbers, spaces
   **Not Allowed:** @, #, $, %, &, *, etc.
   
   **Why:** Prevents potential security issues and ensures clean data

2. **Email Validation (Lines 260-264)**
   
   ```php
   $email = $form_state->getValue('email');
   if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
     $form_state->setErrorByName('email', 
       $this->t('Please enter a valid email address.'));
   }
   ```
   
   **Why Additional Validation:** Although we use '#type' => 'email', server-side validation is essential for security

3. **Duplicate Registration Check (Lines 266-279)**
   
   ```php
   $event_date = $form_state->getValue('event_date');
   if (!empty($email) && !empty($event_date)) {
     $existing = $this->database->select('event_registration_data', 'r')
       ->fields('r', ['id'])
       ->condition('email', $email)
       ->condition('event_date', $event_date)
       ->execute()
       ->fetchField();
     
     if ($existing) {
       $form_state->setErrorByName('email', 
         $this->t('You have already registered for this event on the selected date.'));
     }
   }
   ```
   
   **Logic:**
   - Queries registration_data table
   - Checks for existing record with same email AND event_date
   - `fetchField()` returns the ID if found, or FALSE if not found
   
   **Why:** Prevents duplicate registrations (also enforced by database unique constraint)

4. **Registration Period Validation (Lines 281-296)**
   
   ```php
   $event_id = $form_state->getValue('event_name');
   if (!empty($event_id)) {
     $current_time = \Drupal::time()->getRequestTime();
     $event = $this->database->select('event_registration_config', 'e')
       ->fields('e')
       ->condition('id', $event_id)
       ->execute()
       ->fetchObject();
     
     if ($event) {
       if ($current_time < $event->registration_start_date || 
           $current_time > $event->registration_end_date) {
         $form_state->setErrorByName('event_name', 
           $this->t('Registration for this event is currently closed.'));
       }
     }
   }
   ```
   
   **Why:** Prevents race conditions where registration period ends between page load and submission

### submitForm() Method

```php
public function submitForm(array &$form, FormStateInterface $form_state) {
  // Submission logic
}
```

**Flow:**

1. **Get Form Values (Line 303)**
   ```php
   $values = $form_state->getValues();
   $event_id = $values['event_name'];
   ```

2. **Fetch Event Details (Lines 306-311)**
   ```php
   $event = $this->database->select('event_registration_config', 'e')
     ->fields('e')
     ->condition('id', $event_id)
     ->execute()
     ->fetchObject();
   ```
   
   **Why:** Need event_name for email confirmation

3. **Insert Registration (Lines 313-325)**
   ```php
   $this->database->insert('event_registration_data')
     ->fields([
       'full_name' => $values['full_name'],
       'email' => $values['email'],
       'college_name' => $values['college_name'],
       'department' => $values['department'],
       'category' => $values['category'],
       'event_date' => $values['event_date'],
       'event_id' => $event_id,
       'created' => \Drupal::time()->getRequestTime(),
     ])
     ->execute();
   ```
   
   **Database API:**
   - `insert()`: Creates INSERT query
   - `fields()`: Specifies column-value pairs
   - `execute()`: Runs the query
   
   **Security:** Database API automatically escapes values (prevents SQL injection)

4. **Prepare Email Data (Lines 327-336)**
   ```php
   $email_data = [
     'full_name' => $values['full_name'],
     'email' => $values['email'],
     'college_name' => $values['college_name'],
     'department' => $values['department'],
     'category' => $values['category'],
     'event_date' => date('F j, Y', $values['event_date']),
     'event_name' => $event->event_name,
   ];
   ```
   
   **Date Formatting:** Converts Unix timestamp to readable format for email

5. **Send Emails (Line 339)**
   ```php
   $this->emailService->sendConfirmationEmails($email_data);
   ```
   
   **Delegation:** Email logic is in separate service class (separation of concerns)

6. **Display Success Message (Line 341)**
   ```php
   $this->messenger()->addStatus(
     $this->t('Thank you for registering! A confirmation email has been sent to @email.', 
       ['@email' => $values['email']]));
   ```
   
   **Messenger Service:** Drupal's built-in service for displaying messages to users

## EventConfigForm

### Purpose

Administrative form for creating events.

### Class Declaration

```php
namespace Drupal\event_registration\Form;

class EventConfigForm extends FormBase {
  protected $database;
}
```

### Key Differences from EventRegistrationForm

- Only injects database connection (no email service needed)
- Simpler form structure (no AJAX)
- Date fields instead of dropdowns
- Category dropdown with fixed options

### buildForm() Implementation

**Date Fields:**
```php
$form['registration_start_date'] = [
  '#type' => 'date',
  '#title' => $this->t('Registration Start Date'),
  '#required' => TRUE,
];
```

**Category Options:**
```php
$form['category'] = [
  '#type' => 'select',
  '#title' => $this->t('Category'),
  '#required' => TRUE,
  '#options' => [
    '' => $this->t('- Select Category -'),
    'Online Workshop' => $this->t('Online Workshop'),
    'Hackathon' => $this->t('Hackathon'),
    'Conference' => $this->t('Conference'),
    'One-day Workshop' => $this->t('One-day Workshop'),
  ],
];
```

**Why Fixed Options:** Maintains consistency across the system

### validateForm() Implementation

**Date Logic Validation:**
```php
$start_date = strtotime($form_state->getValue('registration_start_date'));
$end_date = strtotime($form_state->getValue('registration_end_date'));
$event_date = strtotime($form_state->getValue('event_date'));

if ($end_date < $start_date) {
  $form_state->setErrorByName('registration_end_date', 
    $this->t('Registration end date must be after start date.'));
}
```

**strtotime():** Converts date string to Unix timestamp for comparison

### submitForm() Implementation

```php
$this->database->insert('event_registration_config')
  ->fields([
    'registration_start_date' => strtotime($values['registration_start_date']),
    'registration_end_date' => strtotime($values['registration_end_date']),
    'event_date' => strtotime($values['event_date']),
    'event_name' => $values['event_name'],
    'category' => $values['category'],
    'created' => \Drupal::time()->getRequestTime(),
  ])
  ->execute();
```

**Date Conversion:** Converts date strings to Unix timestamps for database storage

## AdminConfigForm

### Purpose

Configuration form for admin email settings.

### Class Declaration

```php
namespace Drupal\event_registration\Form;

class AdminConfigForm extends ConfigFormBase {
  // No dependencies needed
}
```

### Key Differences

- Extends `ConfigFormBase` instead of `FormBase`
- Uses Drupal's configuration system
- No database operations
- Simpler implementation

### getEditableConfigNames()

```php
protected function getEditableConfigNames() {
  return ['event_registration.settings'];
}
```

**Purpose:** Defines which configuration can be edited by this form

### buildForm() Implementation

```php
$config = $this->config('event_registration.settings');

$form['admin_email'] = [
  '#type' => 'email',
  '#title' => $this->t('Admin Notification Email'),
  '#default_value' => $config->get('admin_email'),
  '#required' => TRUE,
];

$form['enable_notifications'] = [
  '#type' => 'checkbox',
  '#title' => $this->t('Enable Admin Notifications'),
  '#default_value' => $config->get('enable_notifications'),
];
```

**Config System:**
- `$this->config()`: Loads configuration
- `get()`: Retrieves config value
- `#default_value`: Populates form with saved values

### submitForm() Implementation

```php
$this->config('event_registration.settings')
  ->set('admin_email', $form_state->getValue('admin_email'))
  ->set('enable_notifications', $form_state->getValue('enable_notifications'))
  ->save();
```

**Config API:**
- `set()`: Sets configuration value
- `save()`: Persists changes to database
- Chainable methods for clean code

## Form Security

### CSRF Protection

All forms automatically include CSRF tokens via Drupal's Form API.

### Input Sanitization

- Form API sanitizes input
- Database API escapes values
- Validation prevents malicious input

### XSS Prevention

- `$this->t()` escapes output
- Render arrays prevent direct HTML injection

## Best Practices Demonstrated

1. **Dependency Injection:** All dependencies injected via constructor
2. **Separation of Concerns:** Email logic in separate service
3. **Code Reuse:** Helper methods for common operations
4. **Validation:** Server-side validation for all inputs
5. **User Feedback:** Clear error messages and success notifications
6. **Database Abstraction:** Using Drupal's Database API
7. **Configuration Management:** Using Config API for settings
8. **Accessibility:** Proper form labels and structure
9. **Security:** Multiple layers of protection
# Hooks and Callbacks

## Overview

This document explains the Drupal hooks and AJAX callbacks implemented in the Event Registration module.

## Drupal Hooks

### hook_schema()

**Function:** `event_registration_schema()`  
**File:** `event_registration.install`  
**Purpose:** Defines database schema for module tables.

**Implementation:**

```php
function event_registration_schema() {
  $schema = [];
  
  $schema['event_registration_config'] = [
    // Table definition
  ];
  
  $schema['event_registration_data'] = [
    // Table definition
  ];
  
  return $schema;
}
```

**When Called:**
- During module installation
- When running `drush updatedb`
- When Drupal needs schema information

**Return Value:** Array of table definitions.

### hook_install()

**Function:** `event_registration_install()`  
**File:** `event_registration.install`  
**Purpose:** Performs actions when module is installed.

**Implementation:**

```php
function event_registration_install() {
  \Drupal::messenger()->addStatus(__FUNCTION__);
}
```

**When Called:** Once, when module is first enabled.

**Use Cases:**
- Set default configuration
- Create initial data
- Display installation message

### hook_uninstall()

**Function:** `event_registration_uninstall()`  
**File:** `event_registration.install`  
**Purpose:** Cleanup when module is uninstalled.

**Implementation:**

```php
function event_registration_uninstall() {
  \Drupal::messenger()->addStatus(__FUNCTION__);
}
```

**When Called:** When module is uninstalled (not just disabled).

**Use Cases:**
- Delete configuration
- Remove custom data
- Clean up files

**Note:** Database tables are automatically dropped (defined by hook_schema).

### hook_mail()

**Function:** `event_registration_mail()`  
**File:** `event_registration.module`  
**Purpose:** Defines email templates.

**Implementation:**

```php
function event_registration_mail($key, &$message, $params) {
  switch ($key) {
    case 'user_confirmation':
      $message['subject'] = t('Event Registration Confirmation');
      $message['body'][] = t('Dear @name,', ['@name' => $params['full_name']]);
      $message['body'][] = t('Thank you for registering for the following event:');
      $message['body'][] = '';
      $message['body'][] = t('Event Name: @event', ['@event' => $params['event_name']]);
      $message['body'][] = t('Category: @category', ['@category' => $params['category']]);
      $message['body'][] = t('Event Date: @date', ['@date' => $params['event_date']]);
      $message['body'][] = '';
      $message['body'][] = t('We look forward to seeing you at the event!');
      $message['body'][] = '';
      $message['body'][] = t('Best regards,');
      $message['body'][] = t('Event Registration Team');
      break;

    case 'admin_notification':
      $message['subject'] = t('New Event Registration');
      $message['body'][] = t('A new registration has been received:');
      $message['body'][] = '';
      $message['body'][] = t('Name: @name', ['@name' => $params['full_name']]);
      $message['body'][] = t('Email: @email', ['@email' => $params['email']]);
      $message['body'][] = t('College: @college', ['@college' => $params['college_name']]);
      $message['body'][] = t('Department: @dept', ['@dept' => $params['department']]);
      $message['body'][] = t('Event: @event', ['@event' => $params['event_name']]);
      $message['body'][] = t('Category: @category', ['@category' => $params['category']]);
      $message['body'][] = t('Event Date: @date', ['@date' => $params['event_date']]);
      break;
  }
}
```

**Parameters:**
- `$key`: Email type identifier ('user_confirmation' or 'admin_notification')
- `$message`: Message array to populate (passed by reference)
- `$params`: Data from mailManager->mail() call

**Message Array Structure:**
- `subject`: Email subject line
- `body`: Array of body lines (joined with \n)
- `headers`: Email headers (optional)

**When Called:** When `mailManager->mail()` is called with module name 'event_registration'.

## AJAX Callbacks

### Form AJAX Callbacks

#### EventRegistrationForm::updateEventDates()

**Purpose:** Updates event date dropdown when category changes.

**Implementation:**

```php
public function updateEventDates(array &$form, FormStateInterface $form_state) {
  return $form['event_date_wrapper'];
}
```

**Trigger:** User selects category from dropdown.

**AJAX Configuration:**

```php
'#ajax' => [
  'callback' => '::updateEventDates',
  'wrapper' => 'event-date-wrapper',
  'event' => 'change',
]
```

**Flow:**
1. User selects category
2. JavaScript 'change' event fires
3. AJAX request sent to callback
4. Callback returns event_date_wrapper element
5. Drupal replaces #event-date-wrapper with new content
6. Event dates are now populated

**Return Value:** Form element (event_date_wrapper).

#### EventRegistrationForm::updateEventNames()

**Purpose:** Updates event name dropdown when event date changes.

**Implementation:**

```php
public function updateEventNames(array &$form, FormStateInterface $form_state) {
  return $form['event_name_wrapper'];
}
```

**Trigger:** User selects event date from dropdown.

**AJAX Configuration:**

```php
'#ajax' => [
  'callback' => '::updateEventNames',
  'wrapper' => 'event-name-wrapper',
  'event' => 'change',
]
```

**Same pattern as updateEventDates but for second level of cascading.**

### Controller AJAX Callbacks

#### RegistrationListController::updateEventNameFilter()

**Purpose:** Updates event name filter when event date filter changes.

**Implementation:**

```php
public function updateEventNameFilter(array &$form, $form_state) {
  $response = new AjaxResponse();
  
  $request = $this->requestStack->getCurrentRequest();
  $selected_date = $request->query->get('event_date');

  $name_options = ['' => $this->t('- All Events -')];
  
  if (!empty($selected_date)) {
    $events = $this->database->select('event_registration_config', 'e')
      ->fields('e', ['id', 'event_name'])
      ->condition('event_date', $selected_date)
      ->execute()
      ->fetchAll();

    foreach ($events as $event) {
      $name_options[$event->id] = $event->event_name;
    }
  }

  $element = [
    '#type' => 'select',
    '#title' => $this->t('Event Name'),
    '#options' => $name_options,
    '#ajax' => [
      'callback' => '::updateRegistrationTable',
      'wrapper' => 'registration-table-wrapper',
      'event' => 'change',
    ],
  ];

  $response->addCommand(new ReplaceCommand('#event-name-filter-wrapper', $element));
  return $response;
}
```

**Differences from Form AJAX:**
- Returns `AjaxResponse` object (not form element)
- Uses `ReplaceCommand` to specify replacement
- Reads filter value from request query parameters
- Rebuilds element programmatically

**Why AjaxResponse:** Controller callbacks need more control over AJAX commands.

#### RegistrationListController::updateRegistrationTable()

**Purpose:** Updates registration table when filters change.

**Implementation:**

```php
public function updateRegistrationTable(array &$form, $form_state) {
  $response = new AjaxResponse();
  $table = $this->buildRegistrationTable();
  $response->addCommand(new ReplaceCommand('#registration-table-wrapper', $table));
  return $response;
}
```

**Trigger:** User changes event date or event name filter.

**Flow:**
1. User changes filter
2. AJAX request sent
3. Callback rebuilds table with current filters
4. ReplaceCommand updates DOM
5. Table shows filtered results

## AJAX Command Types

### ReplaceCommand

**Purpose:** Replace HTML element with new content.

**Usage:**

```php
$response->addCommand(new ReplaceCommand('#element-id', $new_content));
```

**Parameters:**
- Selector: CSS selector for element to replace
- Content: New content (render array or HTML)

### Other Available Commands

**Not used in module, but available:**

- `InvokeCommand`: Call JavaScript function
- `AppendCommand`: Append content to element
- `PrependCommand`: Prepend content to element
- `RemoveCommand`: Remove element
- `CssCommand`: Change CSS properties
- `HtmlCommand`: Replace inner HTML
- `AlertCommand`: Show JavaScript alert

## AJAX Wrapper Pattern

### Container Wrapper

**Pattern:**

```php
$form['wrapper'] = [
  '#type' => 'container',
  '#attributes' => ['id' => 'wrapper-id'],
];

$form['wrapper']['element'] = [
  '#type' => 'select',
  // ...
];
```

**Why Needed:**
- AJAX replaces entire wrapper
- Allows element to be rebuilt
- Maintains proper DOM structure

### Wrapper ID

**Must match AJAX configuration:**

```php
'#ajax' => [
  'wrapper' => 'wrapper-id',  // Matches container ID
]
```

## Form Rebuild Process

### AJAX Form Rebuild

**When AJAX callback fires:**

1. Form is rebuilt with current values
2. `$form_state` contains user input
3. Callback method is called
4. Returned element replaces wrapper
5. Form continues to be interactive

### Preserving State

**Form state is maintained:**

```php
$selected_category = $form_state->getValue('category');
if (!empty($selected_category)) {
  // Populate dependent dropdown
}
```

**Values are available during rebuild.**

## AJAX Security

### CSRF Protection

All AJAX requests include CSRF token automatically.

### Form Token Validation

Drupal validates form tokens on AJAX requests.

### Access Control

AJAX callbacks respect form/route permissions.

## AJAX Performance

### Minimal Data Transfer

Only changed elements are returned:

```php
return $form['event_date_wrapper'];  // Not entire form
```

### Targeted Updates

ReplaceCommand updates only necessary DOM elements.

### Efficient Queries

Callbacks query only needed data:

```php
->fields('e', ['id', 'event_name'])  // Not all fields
```

## Debugging AJAX

### Browser Developer Tools

**Network Tab:**
- See AJAX requests
- View request/response data
- Check for errors

**Console Tab:**
- JavaScript errors
- AJAX debugging messages

### Drupal Debugging

**Disable AJAX temporarily:**

```php
'#ajax' => [
  'callback' => '::updateEventDates',
  'wrapper' => 'event-date-wrapper',
  'event' => 'change',
  'disable-refocus' => TRUE,  // Debugging option
]
```

**Log callback execution:**

```php
\Drupal::logger('event_registration')->debug('AJAX callback fired');
```

## Best Practices Demonstrated

1. **Return minimal data** - Only return changed elements
2. **Use wrappers** - Wrap AJAX-updated elements in containers
3. **Preserve state** - Use form_state to maintain values
4. **Efficient queries** - Query only needed data in callbacks
5. **Proper IDs** - Use unique, descriptive wrapper IDs
6. **Error handling** - Let Drupal handle AJAX errors
7. **Security** - Rely on Drupal's built-in AJAX security
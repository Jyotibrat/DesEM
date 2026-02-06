# Controller Implementation

## RegistrationListController

### Purpose

Handles displaying registration listings with AJAX filters and CSV export functionality.

### Class Declaration

```php
namespace Drupal\event_registration\Controller;

class RegistrationListController extends ControllerBase {
  protected $database;
  protected $requestStack;
}
```

### Dependencies

**Injected Services:**
- `Connection $database`: For querying registration data
- `RequestStack $request_stack`: For accessing query parameters (filters)

**Why RequestStack:** Needed to read filter values from URL query parameters for AJAX callbacks.

### Dependency Injection

```php
public function __construct(Connection $database, RequestStack $request_stack) {
  $this->database = $database;
  $this->requestStack = $request_stack;
}

public static function create(ContainerInterface $container) {
  return new static(
    $container->get('database'),
    $container->get('request_stack')
  );
}
```

## listRegistrations() Method

### Purpose

Builds the main registration listing page with filters, table, and export link.

### Return Value

Returns a render array containing:
- Filter dropdowns (Event Date, Event Name)
- Apply Filters button
- Export to CSV link
- Registration table with participant count

### Implementation Details

**1. Build Event Date Filter (Lines 61-88)**

```php
$event_dates = $this->database->select('event_registration_config', 'e')
  ->fields('e', ['event_date'])
  ->distinct()
  ->orderBy('event_date', 'DESC')
  ->execute()
  ->fetchAll();

$date_options = ['' => $this->t('- All Dates -')];
foreach ($event_dates as $date) {
  $date_options[$date->event_date] = date('F j, Y', $date->event_date);
}

$build['filters']['event_date'] = [
  '#type' => 'select',
  '#title' => $this->t('Event Date'),
  '#options' => $date_options,
  '#ajax' => [
    'callback' => '::updateEventNameFilter',
    'wrapper' => 'event-name-filter-wrapper',
    'event' => 'change',
  ],
];
```

**Logic:**
- Query distinct event dates from config table
- Order by date descending (newest first)
- Format dates for display
- Add AJAX callback to update event name filter

**2. Build Event Name Filter (Lines 90-104)**

```php
$build['filters']['event_name_wrapper'] = [
  '#type' => 'container',
  '#attributes' => ['id' => 'event-name-filter-wrapper'],
];

$build['filters']['event_name_wrapper']['event_name'] = [
  '#type' => 'select',
  '#title' => $this->t('Event Name'),
  '#options' => ['' => $this->t('- All Events -')],
  '#ajax' => [
    'callback' => '::updateRegistrationTable',
    'wrapper' => 'registration-table-wrapper',
    'event' => 'change',
  ],
];
```

**Why Container Wrapper:** Required for AJAX to replace the element.

**3. Export Link (Lines 116-124)**

```php
$build['export'] = [
  '#type' => 'link',
  '#title' => $this->t('Export to CSV'),
  '#url' => \Drupal\Core\Url::fromRoute('event_registration.export'),
  '#attributes' => [
    'class' => ['button', 'button--primary'],
  ],
];
```

**Url::fromRoute():** Generates URL from route name defined in routing.yml.

**4. Registration Table (Lines 126-136)**

```php
$build['table_wrapper'] = [
  '#type' => 'container',
  '#attributes' => ['id' => 'registration-table-wrapper'],
];

$build['table_wrapper']['content'] = $this->buildRegistrationTable();

$build['#attached']['library'][] = 'core/drupal.ajax';
```

**Attached Library:** Ensures Drupal's AJAX library is loaded.

## AJAX Callback Methods

### updateEventNameFilter()

**Purpose:** Updates event name dropdown when event date filter changes.

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

**Flow:**
1. Get selected date from request
2. Query events for that date
3. Build new dropdown element
4. Return AJAX response with ReplaceCommand

**ReplaceCommand:** Replaces HTML element with new content.

### updateRegistrationTable()

**Purpose:** Updates registration table when filters change.

```php
public function updateRegistrationTable(array &$form, $form_state) {
  $response = new AjaxResponse();
  $table = $this->buildRegistrationTable();
  $response->addCommand(new ReplaceCommand('#registration-table-wrapper', $table));
  return $response;
}
```

**Simple Pattern:** Just rebuilds table and replaces it via AJAX.

## buildRegistrationTable() Method

### Purpose

Builds the registration table based on current filter values.

### Implementation

**1. Get Filter Values (Lines 191-193)**

```php
$request = $this->requestStack->getCurrentRequest();
$selected_date = $request->query->get('event_date');
$selected_event = $request->query->get('event_name');
```

**Query Parameters:** Filters are passed as URL query parameters.

**2. Build Database Query (Lines 195-210)**

```php
$query = $this->database->select('event_registration_data', 'r');
$query->leftJoin('event_registration_config', 'e', 'r.event_id = e.id');
$query->fields('r', ['id', 'full_name', 'email', 'college_name', 'department', 'event_date', 'created']);
$query->fields('e', ['event_name']);

if (!empty($selected_date)) {
  $query->condition('r.event_date', $selected_date);
}

if (!empty($selected_event)) {
  $query->condition('r.event_id', $selected_event);
}

$query->orderBy('r.created', 'DESC');
$results = $query->execute()->fetchAll();
```

**LEFT JOIN:** Joins registration_data with registration_config to get event_name.

**Conditional Filters:** Only adds conditions if filters are selected.

**Order:** Newest registrations first.

**3. Build Table Render Array (Lines 231-260)**

```php
$header = [
  $this->t('Name'),
  $this->t('Email'),
  $this->t('Event Date'),
  $this->t('Event Name'),
  $this->t('College Name'),
  $this->t('Department'),
  $this->t('Submission Date'),
];

$rows = [];
foreach ($results as $row) {
  $rows[] = [
    $row->full_name,
    $row->email,
    date('F j, Y', $row->event_date),
    $row->event_name,
    $row->college_name,
    $row->department,
    date('F j, Y - g:i A', $row->created),
  ];
}

$build['table'] = [
  '#type' => 'table',
  '#header' => $header,
  '#rows' => $rows,
  '#empty' => $this->t('No registrations found.'),
  '#attributes' => ['class' => ['registration-table']],
];
```

**Table Render Element:** Drupal's Form API table element.

**Date Formatting:**
- Event Date: "February 4, 2026"
- Submission Date: "February 4, 2026 - 2:30 PM"

## exportCsv() Method

### Purpose

Generates and downloads CSV file of registration data.

### Implementation

**1. Get Filter Values (Lines 269-271)**

Same pattern as buildRegistrationTable() - respects current filters.

**2. Build Query (Lines 273-288)**

```php
$query = $this->database->select('event_registration_data', 'r');
$query->leftJoin('event_registration_config', 'e', 'r.event_id = e.id');
$query->fields('r', ['full_name', 'email', 'college_name', 'department', 'category', 'event_date', 'created']);
$query->fields('e', ['event_name']);

if (!empty($selected_date)) {
  $query->condition('r.event_date', $selected_date);
}

if (!empty($selected_event)) {
  $query->condition('r.event_id', $selected_event);
}

$query->orderBy('r.created', 'DESC');
$results = $query->execute()->fetchAll();
```

**Same Query Logic:** Ensures CSV matches what's displayed in table.

**3. Build CSV Data (Lines 290-314)**

```php
$csv_data = [];
$csv_data[] = [
  'Full Name',
  'Email',
  'College Name',
  'Department',
  'Category',
  'Event Date',
  'Event Name',
  'Submission Date',
];

foreach ($results as $row) {
  $csv_data[] = [
    $row->full_name,
    $row->email,
    $row->college_name,
    $row->department,
    $row->category,
    date('Y-m-d', $row->event_date),
    $row->event_name,
    date('Y-m-d H:i:s', $row->created),
  ];
}
```

**CSV Format:**
- First row: Headers
- Subsequent rows: Data
- Dates in ISO format for Excel compatibility

**4. Generate CSV (Lines 316-323)**

```php
$output = fopen('php://temp', 'r+');
foreach ($csv_data as $row) {
  fputcsv($output, $row);
}
rewind($output);
$csv_content = stream_get_contents($output);
fclose($output);
```

**php://temp:** Temporary in-memory stream (efficient for small files).

**fputcsv():** PHP function that properly escapes CSV values.

**5. Create HTTP Response (Lines 325-330)**

```php
$response = new Response($csv_content);
$response->headers->set('Content-Type', 'text/csv');
$response->headers->set('Content-Disposition', 'attachment; filename="event_registrations_' . date('Y-m-d_His') . '.csv"');

return $response;
```

**Headers:**
- `Content-Type`: Tells browser it's a CSV file
- `Content-Disposition`: Forces download with timestamped filename

**Filename Format:** `event_registrations_2026-02-04_143000.csv`

## Key Design Patterns

### Separation of Concerns

- `listRegistrations()`: Builds page structure
- `buildRegistrationTable()`: Builds table content
- `exportCsv()`: Handles CSV generation

### Code Reuse

Both `buildRegistrationTable()` and `exportCsv()` use similar query logic.

### AJAX Pattern

1. User interacts with filter
2. AJAX callback fires
3. Method rebuilds affected element
4. ReplaceCommand updates DOM
5. No page reload

### Filter Persistence

Filters are stored in URL query parameters, allowing:
- Bookmarkable filtered views
- Browser back/forward navigation
- Consistent state across AJAX updates

## Security Considerations

### Access Control

Route requires 'administer event registration' permission (defined in routing.yml).

### SQL Injection Prevention

Database API automatically escapes all values.

### XSS Prevention

All output goes through render arrays or is properly escaped.

## Performance Considerations

### Database Queries

- Uses indexes on event_date and event_id
- LEFT JOIN is efficient for this use case
- DISTINCT on dates is optimized

### CSV Generation

- Uses in-memory stream for small datasets
- For large datasets, consider streaming directly to output

### AJAX Efficiency

- Only updates necessary DOM elements
- Minimal data transfer
- No full page reloads
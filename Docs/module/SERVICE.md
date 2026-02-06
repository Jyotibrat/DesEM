# Service Implementation

## EmailService

### Purpose

Encapsulates email sending logic for user confirmations and admin notifications.

### Class Declaration

```php
namespace Drupal\event_registration\Service;

class EmailService {
  protected $database;
  protected $mailManager;
  protected $configFactory;
}
```

### Why a Service Class

**Benefits:**
- Reusable across multiple forms/controllers
- Testable in isolation
- Single responsibility (handles only email logic)
- Can be injected as a dependency
- Centralizes email configuration

### Dependencies

**Injected Services:**
- `Connection $database`: Database connection (currently unused, available for future enhancements)
- `MailManagerInterface $mail_manager`: Drupal's mail manager for sending emails
- `ConfigFactoryInterface $config_factory`: Access to module configuration

### Service Definition

Defined in `event_registration.services.yml`:

```yaml
services:
  event_registration.email:
    class: Drupal\event_registration\Service\EmailService
    arguments: ['@database', '@plugin.manager.mail', '@config.factory']
```

**Service ID:** `event_registration.email`

**Arguments:**
- `@database`: Database service
- `@plugin.manager.mail`: Mail manager service
- `@config.factory`: Config factory service

### Constructor

```php
public function __construct(
  Connection $database,
  MailManagerInterface $mail_manager,
  ConfigFactoryInterface $config_factory
) {
  $this->database = $database;
  $this->mailManager = $mail_manager;
  $this->configFactory = $config_factory;
}
```

**No create() Method:** Services don't need static create() - dependency injection is handled by services.yml.

## sendConfirmationEmails() Method

### Signature

```php
public function sendConfirmationEmails(array $registration_data): void
```

### Parameters

**$registration_data array contains:**
- `full_name`: User's full name
- `email`: User's email address
- `college_name`: College name
- `department`: Department
- `category`: Event category
- `event_date`: Event date (formatted string)
- `event_name`: Event name

### Implementation

**1. Get Language Code (Line 58)**

```php
$langcode = \Drupal::currentUser()->getPreferredLangcode();
```

**Purpose:** Ensures emails are sent in user's preferred language (supports multilingual sites).

**2. Send User Confirmation Email (Lines 61-69)**

```php
$this->mailManager->mail(
  'event_registration',        // Module name
  'user_confirmation',         // Email key
  $registration_data['email'], // Recipient
  $langcode,                   // Language
  $registration_data,          // Parameters
  NULL,                        // From (NULL = site default)
  TRUE                         // Send immediately
);
```

**mail() Method Parameters:**
1. **Module:** Identifies which module's hook_mail() to use
2. **Key:** Identifies which email template to use
3. **To:** Recipient email address
4. **Langcode:** Language for email
5. **Params:** Data passed to hook_mail()
6. **From:** Sender email (NULL uses site default)
7. **Send:** TRUE sends immediately, FALSE queues

**3. Get Admin Configuration (Lines 72-74)**

```php
$config = $this->configFactory->get('event_registration.settings');
$admin_email = $config->get('admin_email');
$notifications_enabled = $config->get('enable_admin_notifications');
```

**Config Access:**
- `get('event_registration.settings')`: Loads module configuration
- `get('admin_email')`: Retrieves admin email value
- `get('enable_admin_notifications')`: Retrieves notification toggle

**4. Send Admin Notification (Lines 76-86)**

```php
if ($notifications_enabled && !empty($admin_email)) {
  $this->mailManager->mail(
    'event_registration',
    'admin_notification',
    $admin_email,
    $langcode,
    $registration_data,
    NULL,
    TRUE
  );
}
```

**Conditional Sending:**
- Only sends if notifications are enabled
- Only sends if admin email is configured
- Prevents errors from missing configuration

## Email Templates

Email content is defined in `event_registration_mail()` hook in `event_registration.module`.

### User Confirmation Template

**Key:** `user_confirmation`

**Template:**
```php
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
```

**Variables Used:**
- `@name`: User's full name
- `@event`: Event name
- `@category`: Event category
- `@date`: Event date (formatted)

### Admin Notification Template

**Key:** `admin_notification`

**Template:**
```php
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
```

**Variables Used:**
- All registration data fields

## Email Flow

### Complete Flow

1. User submits registration form
2. `EventRegistrationForm::submitForm()` saves data to database
3. Form calls `$this->emailService->sendConfirmationEmails($email_data)`
4. Service method is invoked
5. User confirmation email is sent via `mailManager->mail()`
6. Drupal calls `event_registration_mail()` hook with key 'user_confirmation'
7. Hook populates email subject and body
8. Email is sent to user
9. Service checks if admin notifications are enabled
10. If enabled, admin notification email is sent
11. Drupal calls `event_registration_mail()` hook with key 'admin_notification'
12. Hook populates email subject and body
13. Email is sent to admin

### Drupal Mail System

**Mail Manager:**
- Handles email sending
- Supports multiple mail backends
- Allows mail plugins (SMTP, etc.)
- Queues emails if needed

**Hook System:**
- `hook_mail()` defines email templates
- Separates email logic from sending logic
- Allows other modules to alter emails

## Error Handling

### Current Implementation

No explicit error handling - relies on Drupal's mail system.

### Mail System Behavior

**If sending fails:**
- Drupal logs error to watchdog
- Returns FALSE from mail() method
- Does not throw exceptions

### Potential Enhancements

```php
$result = $this->mailManager->mail(...);
if (!$result) {
  \Drupal::logger('event_registration')->error('Failed to send confirmation email to @email', [
    '@email' => $registration_data['email']
  ]);
}
```

## Configuration Integration

### Reading Configuration

```php
$config = $this->configFactory->get('event_registration.settings');
$value = $config->get('key_name');
```

### Configuration Keys

- `admin_email`: Email address for admin notifications
- `enable_admin_notifications`: Boolean toggle for notifications

### Default Values

Defined in `config/install/event_registration.settings.yml`:

```yaml
admin_email: ''
enable_admin_notifications: false
```

## Testing Considerations

### Unit Testing

Service can be unit tested by mocking dependencies:

```php
$database = $this->createMock(Connection::class);
$mailManager = $this->createMock(MailManagerInterface::class);
$configFactory = $this->createMock(ConfigFactoryInterface::class);

$service = new EmailService($database, $mailManager, $configFactory);
```

### Integration Testing

Test actual email sending with Drupal's testing framework.

## Security Considerations

### Email Injection Prevention

- All email addresses validated before reaching service
- Drupal's mail system sanitizes headers
- No user input directly in email headers

### Data Sanitization

- Email content uses t() function
- Variables are placeholders, not concatenated
- Prevents XSS in email content

## Performance Considerations

### Synchronous Sending

Emails are sent immediately (synchronous).

**Pros:**
- User gets immediate feedback
- Simpler implementation

**Cons:**
- Slows down form submission
- Can timeout on slow mail servers

### Potential Optimization

For high-volume sites, consider:
- Queue-based email sending
- Batch processing
- Asynchronous sending

## Extensibility

### Adding New Email Types

1. Add new key in `event_registration_mail()` hook
2. Call `mailManager->mail()` with new key
3. Define template in hook implementation

### Customizing Templates

Modify `event_registration_mail()` in `event_registration.module`.

### Alternative Mail Backends

Install SMTP module or other mail plugins - no code changes needed.

## Best Practices Demonstrated

1. **Service Pattern:** Encapsulates email logic
2. **Dependency Injection:** All dependencies injected
3. **Configuration Management:** Uses Config API
4. **Separation of Concerns:** Sending vs. template definition
5. **Conditional Logic:** Only sends when appropriate
6. **Language Support:** Respects user language preferences
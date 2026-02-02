<?php

namespace Drupal\event_registration\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Connection;
use Drupal\event_registration\Service\EmailService;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;

/**
 * Provides an event registration form.
 */
class EventRegistrationForm extends FormBase {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The email service.
   *
   * @var \Drupal\event_registration\Service\EmailService
   */
  protected $emailService;

  /**
   * Constructs an EventRegistrationForm object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   * @param \Drupal\event_registration\Service\EmailService $email_service
   *   The email service.
   */
  public function __construct(Connection $database, EmailService $email_service) {
    $this->database = $database;
    $this->emailService = $email_service;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('event_registration.email')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'event_registration_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // Check if there are any active events.
    $current_time = \Drupal::time()->getRequestTime();
    $active_events = $this->database->select('event_registration_config', 'e')
      ->fields('e')
      ->condition('registration_start_date', $current_time, '<=')
      ->condition('registration_end_date', $current_time, '>=')
      ->execute()
      ->fetchAll();

    if (empty($active_events)) {
      $form['message'] = [
        '#markup' => '<div class="messages messages--warning">' . $this->t('No events are currently open for registration.') . '</div>',
      ];
      return $form;
    }

    $form['full_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Full Name'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['email'] = [
      '#type' => 'email',
      '#title' => $this->t('Email Address'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['college_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('College Name'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    $form['department'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Department'),
      '#required' => TRUE,
      '#maxlength' => 255,
    ];

    // Get unique categories from active events.
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

    // Populate event dates if category is selected.
    $selected_category = $form_state->getValue('category');
    if (!empty($selected_category)) {
      $event_dates = $this->getEventDatesByCategory($selected_category);
      $form['event_date_wrapper']['event_date']['#options'] = ['' => $this->t('- Select Event Date -')] + $event_dates;
    }

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

    // Populate event names if both category and date are selected.
    $selected_date = $form_state->getValue('event_date');
    if (!empty($selected_category) && !empty($selected_date)) {
      $event_names = $this->getEventNamesByCategoryAndDate($selected_category, $selected_date);
      $form['event_name_wrapper']['event_name']['#options'] = ['' => $this->t('- Select Event Name -')] + $event_names;
    }

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Register'),
      '#button_type' => 'primary',
    ];

    // Attach custom library for styling and JavaScript.
    $form['#attached']['library'][] = 'event_registration/event_registration_styles';
    $form['#attributes']['class'][] = 'event-registration-form';

    return $form;
  }

  /**
   * AJAX callback to update event dates based on selected category.
   */
  public function updateEventDates(array &$form, FormStateInterface $form_state) {
    return $form['event_date_wrapper'];
  }

  /**
   * AJAX callback to update event names based on selected category and date.
   */
  public function updateEventNames(array &$form, FormStateInterface $form_state) {
    return $form['event_name_wrapper'];
  }

  /**
   * Get event dates by category.
   */
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
      $date_formatted = date('Y-m-d', $result->event_date);
      $dates[$result->event_date] = date('F j, Y', $result->event_date);
    }

    return $dates;
  }

  /**
   * Get event names by category and date.
   */
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

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Validate text fields for special characters.
    $text_fields = ['full_name', 'college_name', 'department'];
    foreach ($text_fields as $field) {
      $value = $form_state->getValue($field);
      if (!preg_match('/^[a-zA-Z0-9\s]+$/', $value)) {
        $form_state->setErrorByName($field, $this->t('@field should not contain special characters.', ['@field' => ucfirst(str_replace('_', ' ', $field))]));
      }
    }

    // Validate email format.
    $email = $form_state->getValue('email');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $form_state->setErrorByName('email', $this->t('Please enter a valid email address.'));
    }

    // Check for duplicate registration (email + event_date).
    $event_date = $form_state->getValue('event_date');
    if (!empty($email) && !empty($event_date)) {
      $existing = $this->database->select('event_registration_data', 'r')
        ->fields('r', ['id'])
        ->condition('email', $email)
        ->condition('event_date', $event_date)
        ->execute()
        ->fetchField();

      if ($existing) {
        $form_state->setErrorByName('email', $this->t('You have already registered for this event on the selected date.'));
      }
    }

    // Verify that the selected event is still within registration period.
    $event_id = $form_state->getValue('event_name');
    if (!empty($event_id)) {
      $current_time = \Drupal::time()->getRequestTime();
      $event = $this->database->select('event_registration_config', 'e')
        ->fields('e')
        ->condition('id', $event_id)
        ->execute()
        ->fetchObject();

      if ($event) {
        if ($current_time < $event->registration_start_date || $current_time > $event->registration_end_date) {
          $form_state->setErrorByName('event_name', $this->t('Registration for this event is currently closed.'));
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $event_id = $values['event_name'];

    // Get event details.
    $event = $this->database->select('event_registration_config', 'e')
      ->fields('e')
      ->condition('id', $event_id)
      ->execute()
      ->fetchObject();

    // Insert registration data.
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

    // Prepare email data.
    $email_data = [
      'full_name' => $values['full_name'],
      'email' => $values['email'],
      'college_name' => $values['college_name'],
      'department' => $values['department'],
      'category' => $values['category'],
      'event_date' => date('F j, Y', $values['event_date']),
      'event_name' => $event->event_name,
    ];

    // Send confirmation emails.
    $this->emailService->sendConfirmationEmails($email_data);

    $this->messenger()->addStatus($this->t('Thank you for registering! A confirmation email has been sent to @email.', ['@email' => $values['email']]));
  }

}

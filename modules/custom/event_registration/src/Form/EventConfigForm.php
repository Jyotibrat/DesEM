<?php

namespace Drupal\event_registration\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides an event configuration form.
 */
class EventConfigForm extends FormBase {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * Constructs an EventConfigForm object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   */
  public function __construct(Connection $database) {
    $this->database = $database;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'event_registration_config_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['registration_start_date'] = [
      '#type' => 'date',
      '#title' => $this->t('Event Registration Start Date'),
      '#required' => TRUE,
      '#description' => $this->t('The date when registration opens.'),
    ];

    $form['registration_end_date'] = [
      '#type' => 'date',
      '#title' => $this->t('Event Registration End Date'),
      '#required' => TRUE,
      '#description' => $this->t('The date when registration closes.'),
    ];

    $form['event_date'] = [
      '#type' => 'date',
      '#title' => $this->t('Event Date'),
      '#required' => TRUE,
      '#description' => $this->t('The date when the event will take place.'),
    ];

    $form['event_name'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Event Name'),
      '#required' => TRUE,
      '#maxlength' => 255,
      '#description' => $this->t('Enter the name of the event.'),
    ];

    $form['category'] = [
      '#type' => 'select',
      '#title' => $this->t('Category of the Event'),
      '#required' => TRUE,
      '#options' => [
        '' => $this->t('- Select Category -'),
        'Online Workshop' => $this->t('Online Workshop'),
        'Hackathon' => $this->t('Hackathon'),
        'Conference' => $this->t('Conference'),
        'One-day Workshop' => $this->t('One-day Workshop'),
      ],
      '#description' => $this->t('Select the category of the event.'),
    ];

    $form['actions'] = [
      '#type' => 'actions',
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save Event Configuration'),
      '#button_type' => 'primary',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Validate event name for special characters.
    $event_name = $form_state->getValue('event_name');
    if (!preg_match('/^[a-zA-Z0-9\s]+$/', $event_name)) {
      $form_state->setErrorByName('event_name', $this->t('Event name should not contain special characters.'));
    }

    // Validate date ranges.
    $start_date = strtotime($form_state->getValue('registration_start_date'));
    $end_date = strtotime($form_state->getValue('registration_end_date'));
    $event_date = strtotime($form_state->getValue('event_date'));

    if ($end_date <= $start_date) {
      $form_state->setErrorByName('registration_end_date', $this->t('Registration end date must be after the start date.'));
    }

    if ($event_date < $start_date) {
      $form_state->setErrorByName('event_date', $this->t('Event date should be on or after the registration start date.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();

    // Insert event configuration into database.
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

    $this->messenger()->addStatus($this->t('Event configuration has been saved successfully.'));
  }

}

<?php

namespace Drupal\event_registration\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Connection;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;

/**
 * Controller for listing event registrations.
 */
class RegistrationListController extends ControllerBase {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructs a RegistrationListController object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(Connection $database, RequestStack $request_stack) {
    $this->database = $database;
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('request_stack')
    );
  }

  /**
   * Display list of registrations.
   */
  public function listRegistrations() {
    $build = [];

    // Get all unique event dates.
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

    $build['filters'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'filters-wrapper', 'class' => ['registration-filters']],
    ];

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

    $build['filters']['apply'] = [
      '#type' => 'button',
      '#value' => $this->t('Apply Filters'),
      '#ajax' => [
        'callback' => '::updateRegistrationTable',
        'wrapper' => 'registration-table-wrapper',
        'event' => 'click',
      ],
    ];

    $build['export'] = [
      '#type' => 'link',
      '#title' => $this->t('Export to CSV'),
      '#url' => \Drupal\Core\Url::fromRoute('event_registration.export'),
      '#attributes' => [
        'class' => ['button', 'button--primary'],
        'style' => 'margin-bottom: 20px; display: inline-block;',
      ],
    ];

    $build['table_wrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'registration-table-wrapper'],
    ];

    $build['table_wrapper']['content'] = $this->buildRegistrationTable();

    // Add some basic styling.
    $build['#attached']['library'][] = 'core/drupal.ajax';

    return $build;
  }

  /**
   * AJAX callback to update event name filter.
   */
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

  /**
   * AJAX callback to update registration table.
   */
  public function updateRegistrationTable(array &$form, $form_state) {
    $response = new AjaxResponse();
    $table = $this->buildRegistrationTable();
    $response->addCommand(new ReplaceCommand('#registration-table-wrapper', $table));
    return $response;
  }

  /**
   * Build the registration table.
   */
  protected function buildRegistrationTable() {
    $request = $this->requestStack->getCurrentRequest();
    $selected_date = $request->query->get('event_date');
    $selected_event = $request->query->get('event_name');

    // Build query.
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

    // Count participants.
    $participant_count = count($results);

    $build = [
      '#type' => 'container',
      '#attributes' => ['id' => 'registration-table-wrapper'],
    ];

    $build['count'] = [
      '#markup' => '<div class="participant-count"><strong>' . $this->t('Total Participants: @count', ['@count' => $participant_count]) . '</strong></div>',
    ];

    if (empty($results)) {
      $build['message'] = [
        '#markup' => '<p>' . $this->t('No registrations found.') . '</p>',
      ];
      return $build;
    }

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

    return $build;
  }

  /**
   * Export registrations to CSV.
   */
  public function exportCsv() {
    $request = $this->requestStack->getCurrentRequest();
    $selected_date = $request->query->get('event_date');
    $selected_event = $request->query->get('event_name');

    // Build query.
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

    // Create CSV content.
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

    // Generate CSV.
    $output = fopen('php://temp', 'r+');
    foreach ($csv_data as $row) {
      fputcsv($output, $row);
    }
    rewind($output);
    $csv_content = stream_get_contents($output);
    fclose($output);

    // Create response.
    $response = new Response($csv_content);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-Disposition', 'attachment; filename="event_registrations_' . date('Y-m-d_His') . '.csv"');

    return $response;
  }

}

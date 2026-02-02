<?php

namespace Drupal\event_registration\Service;

use Drupal\Core\Database\Connection;
use Drupal\Core\Mail\MailManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Email service for event registration notifications.
 */
class EmailService {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The mail manager.
   *
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Constructs an EmailService object.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   * @param \Drupal\Core\Mail\MailManagerInterface $mail_manager
   *   The mail manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   */
  public function __construct(Connection $database, MailManagerInterface $mail_manager, ConfigFactoryInterface $config_factory) {
    $this->database = $database;
    $this->mailManager = $mail_manager;
    $this->configFactory = $config_factory;
  }

  /**
   * Send confirmation emails to user and admin.
   *
   * @param array $registration_data
   *   The registration data array.
   */
  public function sendConfirmationEmails(array $registration_data) {
    $langcode = \Drupal::currentUser()->getPreferredLangcode();
    
    // Send confirmation email to user.
    $this->mailManager->mail(
      'event_registration',
      'user_confirmation',
      $registration_data['email'],
      $langcode,
      $registration_data,
      NULL,
      TRUE
    );

    // Send notification to admin if enabled.
    $config = $this->configFactory->get('event_registration.settings');
    $admin_email = $config->get('admin_email');
    $notifications_enabled = $config->get('enable_admin_notifications');

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
  }

}

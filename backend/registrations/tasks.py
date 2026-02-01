"""
Celery tasks for the registrations app.
"""

from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from .models import Registration


@shared_task
def send_registration_emails(registration_id):
    """
    Send confirmation email to user and notification to admin.
    
    Args:
        registration_id: UUID of the registration
    """
    try:
        registration = Registration.objects.select_related('event').get(id=registration_id)
    except Registration.DoesNotExist:
        return f"Registration {registration_id} not found"
    
    # Prepare context for email templates
    context = {
        'full_name': registration.full_name,
        'email': registration.email,
        'college_name': registration.college_name,
        'department': registration.department,
        'event_name': registration.event.name,
        'event_category': registration.event.get_category_display(),
        'event_date': registration.event.event_date,
        'registration_date': registration.created_at,
    }
    
    # Send confirmation email to user
    user_subject = f'Event Registration Confirmation - {registration.event.name}'
    user_message = render_to_string('emails/user_confirmation.html', context)
    
    try:
        send_mail(
            subject=user_subject,
            message='',  # Plain text version
            html_message=user_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[registration.email],
            fail_silently=False,
        )
        registration.confirmation_email_sent = True
        registration.save(update_fields=['confirmation_email_sent'])
    except Exception as e:
        print(f"Error sending user confirmation email: {e}")
    
    # Send notification email to admin
    admin_subject = f'New Event Registration - {registration.event.name}'
    admin_message = render_to_string('emails/admin_notification.html', context)
    
    try:
        send_mail(
            subject=admin_subject,
            message='',  # Plain text version
            html_message=admin_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
        registration.admin_notification_sent = True
        registration.save(update_fields=['admin_notification_sent'])
    except Exception as e:
        print(f"Error sending admin notification email: {e}")
    
    return f"Emails sent for registration {registration_id}"


@shared_task
def send_bulk_notification(event_id, subject, message):
    """
    Send bulk notification to all registrants of an event.
    
    Args:
        event_id: UUID of the event
        subject: Email subject
        message: Email message
    """
    from events.models import Event
    
    try:
        event = Event.objects.get(id=event_id)
    except Event.DoesNotExist:
        return f"Event {event_id} not found"
    
    registrations = event.registrations.all()
    recipient_list = [reg.email for reg in registrations]
    
    if not recipient_list:
        return f"No registrations found for event {event_id}"
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        return f"Bulk email sent to {len(recipient_list)} recipients"
    except Exception as e:
        return f"Error sending bulk email: {e}"

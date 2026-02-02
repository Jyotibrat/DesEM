"""
Registration models for the event registration system.
"""

import uuid
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from events.models import Event


class Registration(models.Model):
    """Model for storing event registrations."""
    
    # Validator for text fields (no special characters)
    text_validator = RegexValidator(
        regex=r'^[a-zA-Z0-9\s\-\']+$',
        message='Only alphanumeric characters, spaces, hyphens, and apostrophes are allowed.'
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Personal information
    full_name = models.CharField(
        max_length=255,
        validators=[text_validator],
        help_text="Full name of the registrant"
    )
    email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Email address of the registrant"
    )
    college_name = models.CharField(
        max_length=255,
        validators=[text_validator],
        help_text="College or institution name"
    )
    department = models.CharField(
        max_length=255,
        validators=[text_validator],
        help_text="Department name"
    )
    
    # Event information
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='registrations',
        help_text="Event being registered for"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email status
    confirmation_email_sent = models.BooleanField(default=False)
    admin_notification_sent = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['created_at']),
        ]
        # Prevent duplicate registrations (email + event_date)
        constraints = [
            models.UniqueConstraint(
                fields=['email', 'event'],
                name='unique_email_event'
            )
        ]
        verbose_name = 'Registration'
        verbose_name_plural = 'Registrations'
    
    def __str__(self):
        return f"{self.full_name} - {self.event.name}"
    
    def get_event_category(self):
        """Get the event category."""
        return self.event.get_category_display()
    
    def get_event_date(self):
        """Get the event date."""
        return self.event.event_date
    
    def get_event_name(self):
        """Get the event name."""
        return self.event.name

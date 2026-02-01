"""
Event models for the event registration system.
"""

import uuid
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone


class Event(models.Model):
    """Model for storing event configurations."""
    
    CATEGORY_CHOICES = [
        ('online_workshop', 'Online Workshop'),
        ('hackathon', 'Hackathon'),
        ('conference', 'Conference'),
        ('one_day_workshop', 'One-day Workshop'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, help_text="Event name")
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        help_text="Event category"
    )
    event_date = models.DateField(help_text="Date when the event will take place")
    registration_start_date = models.DateTimeField(
        help_text="Date and time when registration opens"
    )
    registration_end_date = models.DateTimeField(
        help_text="Date and time when registration closes"
    )
    description = models.TextField(blank=True, help_text="Event description")
    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum number of participants (optional)"
    )
    is_active = models.BooleanField(default=True, help_text="Is event active?")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-event_date']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['event_date']),
            models.Index(fields=['is_active']),
        ]
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return f"{self.name} - {self.get_category_display()} ({self.event_date})"
    
    def is_registration_open(self):
        """Check if registration is currently open."""
        now = timezone.now()
        return (
            self.is_active and
            self.registration_start_date <= now <= self.registration_end_date
        )
    
    def get_registration_count(self):
        """Get the number of registrations for this event."""
        return self.registrations.count()
    
    def is_full(self):
        """Check if event has reached maximum capacity."""
        if self.max_participants is None:
            return False
        return self.get_registration_count() >= self.max_participants
    
    def clean(self):
        """Validate event dates."""
        from django.core.exceptions import ValidationError
        
        if self.registration_end_date <= self.registration_start_date:
            raise ValidationError(
                "Registration end date must be after start date."
            )
        
        if self.event_date < self.registration_end_date.date():
            raise ValidationError(
                "Event date should be after registration end date."
            )

"""
Serializers for the registrations app.
"""

from rest_framework import serializers
from .models import Registration
from events.serializers import EventListSerializer


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer for Registration model."""
    
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_date = serializers.DateField(source='event.event_date', read_only=True)
    event_category = serializers.CharField(source='event.get_category_display', read_only=True)
    event_details = EventListSerializer(source='event', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'full_name', 'email', 'college_name', 'department',
            'event', 'event_name', 'event_date', 'event_category',
            'event_details', 'created_at', 'updated_at',
            'confirmation_email_sent', 'admin_notification_sent'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'confirmation_email_sent', 'admin_notification_sent'
        ]
    
    def validate_event(self, value):
        """Validate that registration is open for the event."""
        if not value.is_registration_open():
            raise serializers.ValidationError(
                "Registration is not currently open for this event."
            )
        
        if value.is_full():
            raise serializers.ValidationError(
                "This event has reached maximum capacity."
            )
        
        return value
    
    def validate(self, data):
        """Validate duplicate registration."""
        email = data.get('email')
        event = data.get('event')
        
        if email and event:
            # Check for duplicate registration
            if Registration.objects.filter(email=email, event=event).exists():
                raise serializers.ValidationError(
                    "You have already registered for this event. Duplicate registrations are not allowed."
                )
        
        return data


class RegistrationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for registration listing."""
    
    event_name = serializers.CharField(source='event.name', read_only=True)
    event_date = serializers.DateField(source='event.event_date', read_only=True)
    event_category = serializers.CharField(source='event.get_category_display', read_only=True)
    
    class Meta:
        model = Registration
        fields = [
            'id', 'full_name', 'email', 'college_name', 'department',
            'event_name', 'event_date', 'event_category', 'created_at'
        ]


class RegistrationStatsSerializer(serializers.Serializer):
    """Serializer for registration statistics."""
    
    total_registrations = serializers.IntegerField()
    registrations_today = serializers.IntegerField()
    registrations_this_week = serializers.IntegerField()
    registrations_this_month = serializers.IntegerField()
    by_category = serializers.DictField()
    by_event = serializers.ListField()
    recent_registrations = RegistrationListSerializer(many=True)

"""
Serializers for the events app.
"""

from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    """Serializer for Event model."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    registration_count = serializers.IntegerField(source='get_registration_count', read_only=True)
    is_registration_open = serializers.BooleanField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'category', 'category_display', 'event_date',
            'registration_start_date', 'registration_end_date', 'description',
            'max_participants', 'is_active', 'registration_count',
            'is_registration_open', 'is_full', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Validate event dates."""
        if data.get('registration_end_date') and data.get('registration_start_date'):
            if data['registration_end_date'] <= data['registration_start_date']:
                raise serializers.ValidationError(
                    "Registration end date must be after start date."
                )
        
        if data.get('event_date') and data.get('registration_end_date'):
            if data['event_date'] < data['registration_end_date'].date():
                raise serializers.ValidationError(
                    "Event date should be after registration end date."
                )
        
        return data


class EventListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for event listing."""
    
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'name', 'category', 'category_display', 'event_date',
            'is_active'
        ]


class EventCategorySerializer(serializers.Serializer):
    """Serializer for event categories."""
    
    value = serializers.CharField()
    label = serializers.CharField()


class EventDateSerializer(serializers.Serializer):
    """Serializer for event dates."""
    
    date = serializers.DateField()
    events_count = serializers.IntegerField()

"""
Views for the events app.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Count
from .models import Event
from .serializers import (
    EventSerializer,
    EventListSerializer,
    EventCategorySerializer,
    EventDateSerializer
)


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Event model.
    
    Provides CRUD operations for events.
    List and retrieve are public, create/update/delete require admin.
    """
    
    queryset = Event.objects.filter(is_active=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'event_date', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['event_date', 'created_at', 'name']
    ordering = ['-event_date']
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return EventListSerializer
        return EventSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticatedOrReadOnly()]
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all event categories."""
        categories = [
            {'value': choice[0], 'label': choice[1]}
            for choice in Event.CATEGORY_CHOICES
        ]
        serializer = EventCategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get events filtered by category."""
        category = request.query_params.get('category')
        if not category:
            return Response(
                {'error': 'Category parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        events = self.queryset.filter(category=category)
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dates(self, request):
        """Get unique event dates with count."""
        category = request.query_params.get('category')
        queryset = self.queryset
        
        if category:
            queryset = queryset.filter(category=category)
        
        dates = queryset.values('event_date').annotate(
            events_count=Count('id')
        ).order_by('-event_date')
        
        serializer = EventDateSerializer(dates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def open_registrations(self, request):
        """Get events with open registrations."""
        from django.utils import timezone
        now = timezone.now()
        
        events = self.queryset.filter(
            registration_start_date__lte=now,
            registration_end_date__gte=now
        )
        
        serializer = self.get_serializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get registrations for a specific event."""
        event = self.get_object()
        registrations = event.registrations.all()
        
        from registrations.serializers import RegistrationListSerializer
        serializer = RegistrationListSerializer(registrations, many=True)
        return Response(serializer.data)

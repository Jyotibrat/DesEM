"""
Views for the registrations app.
"""

import csv
from datetime import datetime, timedelta
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Registration
from .serializers import (
    RegistrationSerializer,
    RegistrationListSerializer,
    RegistrationStatsSerializer
)
from .tasks import send_registration_emails


class RegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Registration model.
    
    Create is public, list/retrieve/update/delete require authentication.
    """
    
    queryset = Registration.objects.select_related('event').all()
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['event', 'email', 'created_at']
    search_fields = ['full_name', 'email', 'college_name', 'department']
    ordering_fields = ['created_at', 'full_name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'list':
            return RegistrationListSerializer
        return RegistrationSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'create':
            return [AllowAny()]
        elif self.action in ['list', 'export', 'stats']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        """Save registration and send emails."""
        registration = serializer.save()
        
        # Send emails asynchronously using Celery
        send_registration_emails.delay(registration.id)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def export(self, request):
        """Export registrations as CSV."""
        # Get filter parameters
        event_id = request.query_params.get('event')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        # Filter queryset
        queryset = self.queryset
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="registrations_{datetime.now().strftime("%Y%m%d")}.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Name', 'Email', 'College Name', 'Department',
            'Event Name', 'Event Category', 'Event Date',
            'Registration Date'
        ])
        
        for reg in queryset:
            writer.writerow([
                reg.full_name,
                reg.email,
                reg.college_name,
                reg.department,
                reg.event.name,
                reg.event.get_category_display(),
                reg.event.event_date,
                reg.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        
        return response
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """Get registration statistics."""
        now = timezone.now()
        today = now.date()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Total registrations
        total = self.queryset.count()
        
        # Registrations today
        today_count = self.queryset.filter(created_at__date=today).count()
        
        # Registrations this week
        week_count = self.queryset.filter(created_at__gte=week_ago).count()
        
        # Registrations this month
        month_count = self.queryset.filter(created_at__gte=month_ago).count()
        
        # By category
        by_category = {}
        for choice in self.queryset.values('event__category').annotate(
            count=Count('id')
        ):
            category = choice['event__category']
            by_category[category] = choice['count']
        
        # By event
        by_event = list(
            self.queryset.values('event__name', 'event__event_date')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        # Recent registrations
        recent = self.queryset.order_by('-created_at')[:10]
        recent_serializer = RegistrationListSerializer(recent, many=True)
        
        stats_data = {
            'total_registrations': total,
            'registrations_today': today_count,
            'registrations_this_week': week_count,
            'registrations_this_month': month_count,
            'by_category': by_category,
            'by_event': by_event,
            'recent_registrations': recent_serializer.data
        }
        
        serializer = RegistrationStatsSerializer(stats_data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        """Get registrations for the current user (by email)."""
        email = request.query_params.get('email')
        if not email:
            return Response(
                {'error': 'Email parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registrations = self.queryset.filter(email=email)
        serializer = self.get_serializer(registrations, many=True)
        return Response(serializer.data)

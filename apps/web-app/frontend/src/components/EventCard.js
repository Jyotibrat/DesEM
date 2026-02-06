import React from 'react';
import { Link } from 'react-router-dom';
import './EventCard.css';

const EventCard = ({ event, onDelete }) => {
    const getStatusBadge = (status) => {
        const badges = {
            upcoming: { class: 'badge-success', icon: 'clock', text: 'Upcoming' },
            ongoing: { class: 'badge-primary', icon: 'play-circle', text: 'Ongoing' },
            completed: { class: 'badge-secondary', icon: 'check-circle', text: 'Completed' },
            cancelled: { class: 'badge-danger', icon: 'times-circle', text: 'Cancelled' }
        };
        return badges[status] || badges.upcoming;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const badge = getStatusBadge(event.status);
    const registrationCount = event.registrations?.length || 0;
    const registrationUrl = `${window.location.origin}/register/${event.slug}`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(registrationUrl);
        alert('Registration URL copied to clipboard!');
    };

    return (
        <div className="event-card">
            <div className="event-card-header">
                <div className="event-date">
                    <div className="date-day">{new Date(event.eventDate).getDate()}</div>
                    <div className="date-month">
                        {new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                </div>
                <span className={`badge ${badge.class}`}>
                    <i className={`fas fa-${badge.icon}`}></i>
                    {badge.text}
                </span>
            </div>

            <div className="event-card-body">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-description">{event.description}</p>

                <div className="event-meta">
                    <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{event.eventTime}</span>
                    </div>
                    <div className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{event.location}</span>
                    </div>
                    <div className="meta-item">
                        <i className="fas fa-users"></i>
                        <span>
                            {registrationCount} {registrationCount === 1 ? 'attendee' : 'attendees'}
                            {event.maxAttendees && ` / ${event.maxAttendees}`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="event-card-footer">
                <div className="event-actions">
                    <Link to={`/events/${event._id}`} className="btn btn-sm btn-primary">
                        <i className="fas fa-eye"></i>
                        View Details
                    </Link>
                    <button onClick={copyToClipboard} className="btn btn-sm btn-outline" title="Copy registration URL">
                        <i className="fas fa-link"></i>
                    </button>
                    <Link to={`/events/${event._id}/edit`} className="btn btn-sm btn-ghost" title="Edit event">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button onClick={() => onDelete(event._id)} className="btn btn-sm btn-ghost text-danger" title="Delete event">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventCard;

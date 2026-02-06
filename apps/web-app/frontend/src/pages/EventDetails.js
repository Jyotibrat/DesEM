import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import './EventDetails.css';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEventDetails();
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const [eventRes, regRes] = await Promise.all([
                eventsAPI.getById(id),
                eventsAPI.getRegistrations(id)
            ]);

            setEvent(eventRes.data.data);
            setRegistrations(regRes.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            try {
                await eventsAPI.delete(id);
                navigate('/dashboard');
            } catch (err) {
                alert('Failed to delete event');
            }
        }
    };

    const copyRegistrationUrl = () => {
        const url = `${window.location.origin}/register/${event.slug}`;
        navigator.clipboard.writeText(url);
        alert('Registration URL copied to clipboard!');
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: { class: 'badge-success', icon: 'clock', text: 'Upcoming' },
            ongoing: { class: 'badge-primary', icon: 'play-circle', text: 'Ongoing' },
            completed: { class: 'badge-secondary', icon: 'check-circle', text: 'Completed' },
            cancelled: { class: 'badge-danger', icon: 'times-circle', text: 'Cancelled' }
        };
        return badges[status] || badges.upcoming;
    };

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner"></div>
                <p>Loading event details...</p>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="error-page">
                <i className="fas fa-exclamation-circle"></i>
                <h2>Event Not Found</h2>
                <p>{error || 'The event you are looking for does not exist.'}</p>
                <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
            </div>
        );
    }

    const badge = getStatusBadge(event.status);
    const registrationUrl = `${window.location.origin}/register/${event.slug}`;

    return (
        <div className="event-details-page">
            <div className="event-details-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <Link to="/dashboard" className="back-link">
                                <i className="fas fa-arrow-left"></i>
                                Back to Dashboard
                            </Link>
                            <h1>{event.title}</h1>
                            <div className="header-meta">
                                <span className={`badge ${badge.class}`}>
                                    <i className={`fas fa-${badge.icon}`}></i>
                                    {badge.text}
                                </span>
                                <span className="category-badge">
                                    <i className="fas fa-tag"></i>
                                    {event.category}
                                </span>
                            </div>
                        </div>
                        <div className="header-actions">
                            <Link to={`/events/${event._id}/edit`} className="btn btn-outline">
                                <i className="fas fa-edit"></i>
                                Edit Event
                            </Link>
                            <button onClick={handleDelete} className="btn btn-danger">
                                <i className="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="event-details-grid">
                    <div className="event-main">
                        <div className="info-card">
                            <h3>
                                <i className="fas fa-info-circle"></i>
                                Event Information
                            </h3>
                            <p className="event-description">{event.description}</p>
                        </div>

                        <div className="info-card">
                            <h3>
                                <i className="fas fa-calendar-alt"></i>
                                Date & Time
                            </h3>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Date</label>
                                    <p>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                                <div className="info-item">
                                    <label>Time</label>
                                    <p>{event.eventTime}</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>
                                <i className="fas fa-map-marker-alt"></i>
                                Location
                            </h3>
                            <p>{event.location}</p>
                        </div>

                        <div className="info-card">
                            <h3>
                                <i className="fas fa-link"></i>
                                Registration URL
                            </h3>
                            <div className="url-container">
                                <input
                                    type="text"
                                    value={registrationUrl}
                                    readOnly
                                    className="url-input"
                                />
                                <button onClick={copyRegistrationUrl} className="btn btn-primary">
                                    <i className="fas fa-copy"></i>
                                    Copy
                                </button>
                            </div>
                            <p className="url-help">Share this URL with people to register for your event</p>
                        </div>

                        <div className="info-card">
                            <h3>
                                <i className="fas fa-users"></i>
                                Attendees ({registrations.length}{event.maxAttendees ? ` / ${event.maxAttendees}` : ''})
                            </h3>

                            {registrations.length === 0 ? (
                                <div className="empty-attendees">
                                    <i className="fas fa-user-slash"></i>
                                    <p>No registrations yet</p>
                                </div>
                            ) : (
                                <div className="attendees-list">
                                    {registrations.map((reg, index) => (
                                        <div key={reg._id} className="attendee-item">
                                            <div className="attendee-avatar">
                                                {reg.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="attendee-info">
                                                <h4>{reg.name}</h4>
                                                <p>{reg.email}</p>
                                                {reg.phone && <p className="phone">{reg.phone}</p>}
                                            </div>
                                            <div className="attendee-meta">
                                                <span className="registration-date">
                                                    {new Date(reg.registrationDate).toLocaleDateString()}
                                                </span>
                                                <span className={`status-badge ${reg.status}`}>
                                                    {reg.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="event-sidebar">
                        <div className="stats-card">
                            <h3>Quick Stats</h3>
                            <div className="stat-item">
                                <i className="fas fa-users"></i>
                                <div>
                                    <label>Total Registrations</label>
                                    <p>{registrations.length}</p>
                                </div>
                            </div>
                            <div className="stat-item">
                                <i className="fas fa-check-circle"></i>
                                <div>
                                    <label>Confirmed</label>
                                    <p>{registrations.filter(r => r.status === 'confirmed').length}</p>
                                </div>
                            </div>
                            {event.maxAttendees && (
                                <div className="stat-item">
                                    <i className="fas fa-percentage"></i>
                                    <div>
                                        <label>Capacity</label>
                                        <p>{Math.round((registrations.length / event.maxAttendees) * 100)}%</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="actions-card">
                            <h3>Actions</h3>
                            <button onClick={copyRegistrationUrl} className="action-btn">
                                <i className="fas fa-share-alt"></i>
                                Share Event
                            </button>
                            <Link to={`/events/${event._id}/edit`} className="action-btn">
                                <i className="fas fa-edit"></i>
                                Edit Details
                            </Link>
                            <a
                                href={`data:text/csv;charset=utf-8,${encodeURIComponent(
                                    'Name,Email,Phone,Status,Registration Date\n' +
                                    registrations.map(r =>
                                        `${r.name},${r.email},${r.phone || ''},${r.status},${new Date(r.registrationDate).toLocaleDateString()}`
                                    ).join('\n')
                                )}`}
                                download={`${event.slug}-attendees.csv`}
                                className="action-btn"
                            >
                                <i className="fas fa-download"></i>
                                Export Attendees
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;

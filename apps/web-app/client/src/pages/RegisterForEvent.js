import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import './RegisterForEvent.css';

const RegisterForEvent = () => {
    const { slug } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        additionalInfo: ''
    });

    useEffect(() => {
        fetchEvent();
    }, [slug]);

    const fetchEvent = async () => {
        try {
            const { data } = await eventsAPI.getBySlug(slug);
            setEvent(data.data);
        } catch (err) {
            setError('Event not found');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await eventsAPI.register(event._id, formData);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="registration-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading event...</p>
                </div>
            </div>
        );
    }

    if (error && !event) {
        return (
            <div className="registration-page">
                <div className="error-container">
                    <i className="fas fa-exclamation-circle"></i>
                    <h2>Event Not Found</h2>
                    <p>The event you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="registration-page">
                <div className="success-container">
                    <div className="success-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h1>Registration Successful! 🎉</h1>
                    <p>Thank you for registering for <strong>{event.title}</strong></p>
                    <div className="success-details">
                        <p>We've sent a confirmation email to <strong>{formData.email}</strong></p>
                        <p>You'll receive a reminder 24 hours before the event.</p>
                    </div>
                    <div className="success-info">
                        <h3>Event Details</h3>
                        <div className="info-row">
                            <i className="fas fa-calendar"></i>
                            <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div className="info-row">
                            <i className="fas fa-clock"></i>
                            <span>{event.eventTime}</span>
                        </div>
                        <div className="info-row">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const isRegistrationClosed = event.status === 'completed' || event.status === 'cancelled';
    const isFull = event.maxAttendees && event.registrations?.length >= event.maxAttendees;

    if (isRegistrationClosed) {
        return (
            <div className="registration-page">
                <div className="closed-container">
                    <i className="fas fa-times-circle"></i>
                    <h2>Registration Closed</h2>
                    <p>
                        {event.status === 'completed'
                            ? 'This event has already finished.'
                            : 'This event has been cancelled.'}
                    </p>
                    <div className="event-info-box">
                        <h3>{event.title}</h3>
                        <p>{event.description}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (isFull) {
        return (
            <div className="registration-page">
                <div className="closed-container">
                    <i className="fas fa-users"></i>
                    <h2>Event is Full</h2>
                    <p>Unfortunately, this event has reached its maximum capacity.</p>
                    <div className="event-info-box">
                        <h3>{event.title}</h3>
                        <p>Maximum attendees: {event.maxAttendees}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="registration-page">
            <div className="registration-header">
                <div className="header-background">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                </div>
                <div className="container">
                    <div className="event-badge">
                        <i className="fas fa-calendar-check"></i>
                        Event Registration
                    </div>
                    <h1>{event.title}</h1>
                    <p className="event-desc">{event.description}</p>
                </div>
            </div>

            <div className="container">
                <div className="registration-container">
                    <div className="registration-form-section">
                        <div className="form-card">
                            <h2>Register for this Event</h2>
                            <p className="form-subtitle">Fill in your details to secure your spot</p>

                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small className="form-help">We'll send confirmation and reminders to this email</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        placeholder="+1 (555) 123-4567"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Additional Information</label>
                                    <textarea
                                        name="additionalInfo"
                                        className="form-textarea"
                                        placeholder="Any special requirements or questions?"
                                        value={formData.additionalInfo}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary btn-lg btn-block"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-sm"></span>
                                            Registering...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check-circle"></i>
                                            Complete Registration
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="event-info-section">
                        <div className="info-card-sticky">
                            <h3>Event Details</h3>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <i className="fas fa-calendar"></i>
                                </div>
                                <div>
                                    <label>Date</label>
                                    <p>{new Date(event.eventDate).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div>
                                    <label>Time</label>
                                    <p>{event.eventTime}</p>
                                </div>
                            </div>

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div>
                                    <label>Location</label>
                                    <p>{event.location}</p>
                                </div>
                            </div>

                            {event.maxAttendees && (
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div>
                                        <label>Capacity</label>
                                        <p>{event.registrations?.length || 0} / {event.maxAttendees} registered</p>
                                        <div className="capacity-bar">
                                            <div
                                                className="capacity-fill"
                                                style={{ width: `${((event.registrations?.length || 0) / event.maxAttendees) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail-item">
                                <div className="detail-icon">
                                    <i className="fas fa-tag"></i>
                                </div>
                                <div>
                                    <label>Category</label>
                                    <p style={{ textTransform: 'capitalize' }}>{event.category}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForEvent;

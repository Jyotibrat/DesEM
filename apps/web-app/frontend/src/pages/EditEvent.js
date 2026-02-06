import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import './CreateEvent.css';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventDate: '',
        eventTime: '',
        location: '',
        maxAttendees: '',
        category: 'other',
        isPublic: true,
        registrationStartDate: '',
        registrationEndDate: ''
    });

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const { data } = await eventsAPI.getById(id);
            const event = data.data;

            // Format date for input (YYYY-MM-DD)
            const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
            const registrationStartDate = event.registrationStartDate
                ? new Date(event.registrationStartDate).toISOString().split('T')[0]
                : '';
            const registrationEndDate = event.registrationEndDate
                ? new Date(event.registrationEndDate).toISOString().split('T')[0]
                : '';

            setFormData({
                title: event.title,
                description: event.description,
                eventDate,
                eventTime: event.eventTime,
                location: event.location,
                maxAttendees: event.maxAttendees || '',
                category: event.category,
                isPublic: event.isPublic,
                registrationStartDate,
                registrationEndDate
            });
        } catch (err) {
            setError('Failed to load event');
        } finally {
            setLoading(false);
        }
    };

    // Check for warning when registration end date exceeds event date
    useEffect(() => {
        if (formData.registrationEndDate && formData.eventDate) {
            const regEndDate = new Date(formData.registrationEndDate);
            const evtDate = new Date(formData.eventDate);

            if (regEndDate > evtDate) {
                setWarning('⚠️ Warning: Registration end date is after the event date. This is unusual - registration typically closes before or on the event date.');
            } else {
                setWarning('');
            }
        } else {
            setWarning('');
        }
    }, [formData.registrationEndDate, formData.eventDate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            // Validate registration end date
            if (formData.registrationEndDate && formData.eventDate) {
                const regEndDate = new Date(formData.registrationEndDate);
                const evtDate = new Date(formData.eventDate);

                if (regEndDate > evtDate) {
                    setError('Registration end date cannot be after the event date');
                    setSubmitting(false);
                    return;
                }
            }

            // Validate registration start date is before end date
            if (formData.registrationStartDate && formData.registrationEndDate) {
                const regStartDate = new Date(formData.registrationStartDate);
                const regEndDate = new Date(formData.registrationEndDate);

                if (regStartDate > regEndDate) {
                    setError('Registration start date must be before end date');
                    setSubmitting(false);
                    return;
                }
            }

            const submitData = {
                ...formData,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
            };

            await eventsAPI.update(id, submitData);
            navigate(`/events/${id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update event');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="create-event-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading event...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="create-event-page">
            <div className="page-header">
                <div className="container">
                    <h1>
                        <i className="fas fa-edit"></i>
                        Edit Event
                    </h1>
                    <p>Update your event details</p>
                </div>
            </div>

            <div className="container">
                <div className="create-event-container">
                    <div className="form-section">
                        <form onSubmit={handleSubmit} className="event-form">
                            {error && (
                                <div className="alert alert-error">
                                    <i className="fas fa-exclamation-circle"></i>
                                    {error}
                                </div>
                            )}

                            {warning && (
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    {warning}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Event Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    placeholder="e.g., Web Development Workshop"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description *</label>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Describe your event..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Event Date *</label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        className="form-input"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Event Time *</label>
                                    <input
                                        type="time"
                                        name="eventTime"
                                        className="form-input"
                                        value={formData.eventTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Location *</label>
                                <input
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    placeholder="e.g., Tech Hub, 123 Main Street"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-section-title">
                                <i className="fas fa-calendar-check"></i>
                                Registration Period
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Registration Start Date</label>
                                    <input
                                        type="date"
                                        name="registrationStartDate"
                                        className="form-input"
                                        value={formData.registrationStartDate}
                                        onChange={handleChange}
                                    />
                                    <small className="form-help">When registration opens (optional)</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Registration End Date</label>
                                    <input
                                        type="date"
                                        name="registrationEndDate"
                                        className="form-input"
                                        value={formData.registrationEndDate}
                                        onChange={handleChange}
                                    />
                                    <small className="form-help">When registration closes (optional)</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select
                                        name="category"
                                        className="form-select"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="conference">Conference</option>
                                        <option value="workshop">Workshop</option>
                                        <option value="seminar">Seminar</option>
                                        <option value="meetup">Meetup</option>
                                        <option value="webinar">Webinar</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Maximum Attendees</label>
                                    <input
                                        type="number"
                                        name="maxAttendees"
                                        className="form-input"
                                        placeholder="Leave blank for unlimited"
                                        value={formData.maxAttendees}
                                        onChange={handleChange}
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                    />
                                    <span>Public Event (visible to everyone)</span>
                                </label>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => navigate(`/events/${id}`)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-sm"></span>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save"></i>
                                            Update Event
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="preview-section">
                        <div className="preview-card">
                            <h3>Event Preview</h3>
                            <div className="preview-content">
                                <h2>{formData.title || 'Event Title'}</h2>
                                <p className="preview-description">
                                    {formData.description || 'Event description will appear here...'}
                                </p>

                                <div className="preview-details">
                                    <div className="preview-item">
                                        <i className="fas fa-calendar"></i>
                                        <span>{formData.eventDate || 'Select date'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <i className="fas fa-clock"></i>
                                        <span>{formData.eventTime || 'Select time'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{formData.location || 'Event location'}</span>
                                    </div>
                                    {formData.maxAttendees && (
                                        <div className="preview-item">
                                            <i className="fas fa-users"></i>
                                            <span>Max {formData.maxAttendees} attendees</span>
                                        </div>
                                    )}
                                    <div className="preview-item">
                                        <i className="fas fa-tag"></i>
                                        <span style={{ textTransform: 'capitalize' }}>{formData.category}</span>
                                    </div>
                                </div>

                                {(formData.registrationStartDate || formData.registrationEndDate) && (
                                    <div className="preview-registration-period">
                                        <h4>Registration Period</h4>
                                        {formData.registrationStartDate && (
                                            <p>Opens: {new Date(formData.registrationStartDate).toLocaleDateString()}</p>
                                        )}
                                        {formData.registrationEndDate && (
                                            <p>Closes: {new Date(formData.registrationEndDate).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditEvent;

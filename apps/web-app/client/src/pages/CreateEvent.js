import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import './CreateEvent.css';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        setLoading(true);

        try {
            // Validate registration end date
            if (formData.registrationEndDate && formData.eventDate) {
                const regEndDate = new Date(formData.registrationEndDate);
                const evtDate = new Date(formData.eventDate);

                if (regEndDate > evtDate) {
                    setError('Registration end date cannot be after the event date');
                    setLoading(false);
                    return;
                }
            }

            // Validate registration start date is before end date
            if (formData.registrationStartDate && formData.registrationEndDate) {
                const regStartDate = new Date(formData.registrationStartDate);
                const regEndDate = new Date(formData.registrationEndDate);

                if (regStartDate > regEndDate) {
                    setError('Registration start date must be before end date');
                    setLoading(false);
                    return;
                }
            }

            const submitData = {
                ...formData,
                maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
            };

            const { data } = await eventsAPI.create(submitData);
            navigate(`/events/${data.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-page">
            <div className="create-event-header">
                <div className="container">
                    <h1>Create New Event</h1>
                    <p>Fill in the details to create your event</p>
                </div>
            </div>

            <div className="container">
                <div className="create-event-container">
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

                        <div className="form-section">
                            <h3 className="section-title">
                                <i className="fas fa-info-circle"></i>
                                Basic Information
                            </h3>

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
                                    rows="5"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <select
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="conference">Conference</option>
                                    <option value="workshop">Workshop</option>
                                    <option value="seminar">Seminar</option>
                                    <option value="meetup">Meetup</option>
                                    <option value="webinar">Webinar</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">
                                <i className="fas fa-calendar-alt"></i>
                                Date & Time
                            </h3>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Event Date *</label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        className="form-input"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
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
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">
                                <i className="fas fa-calendar-check"></i>
                                Registration Period
                            </h3>

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
                                    <small className="form-help">When registration opens (optional - defaults to now)</small>
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
                                    <small className="form-help">When registration closes (optional - defaults to event date)</small>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">
                                <i className="fas fa-map-marker-alt"></i>
                                Location & Capacity
                            </h3>

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

                            <div className="form-group">
                                <label className="form-label">Maximum Attendees</label>
                                <input
                                    type="number"
                                    name="maxAttendees"
                                    className="form-input"
                                    placeholder="Leave empty for unlimited"
                                    value={formData.maxAttendees}
                                    onChange={handleChange}
                                    min="1"
                                />
                                <small className="form-help">Leave empty for unlimited capacity</small>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={formData.isPublic}
                                        onChange={handleChange}
                                    />
                                    <span>Make this event public</span>
                                </label>
                                <small className="form-help">Public events can be discovered by anyone</small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-ghost btn-lg"
                                onClick={() => navigate('/dashboard')}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-sm"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i>
                                        Create Event
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="form-preview">
                        <div className="preview-card">
                            <div className="preview-header">
                                <i className="fas fa-eye"></i>
                                <h3>Preview</h3>
                            </div>
                            <div className="preview-content">
                                <h4>{formData.title || 'Event Title'}</h4>
                                <p>{formData.description || 'Event description will appear here...'}</p>
                                <div className="preview-meta">
                                    <div className="preview-item">
                                        <i className="fas fa-calendar"></i>
                                        <span>{formData.eventDate || 'Date'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <i className="fas fa-clock"></i>
                                        <span>{formData.eventTime || 'Time'}</span>
                                    </div>
                                    <div className="preview-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{formData.location || 'Location'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;

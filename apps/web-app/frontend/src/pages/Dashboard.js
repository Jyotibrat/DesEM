import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await eventsAPI.getMyEvents();
            setEvents(data.data);

            // Calculate stats
            const total = data.data.length;
            const upcoming = data.data.filter(e => e.status === 'upcoming').length;
            const ongoing = data.data.filter(e => e.status === 'ongoing').length;
            const completed = data.data.filter(e => e.status === 'completed').length;

            setStats({ total, upcoming, ongoing, completed });
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await eventsAPI.delete(eventId);
                fetchEvents(); // Refresh list
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event');
            }
        }
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Welcome back, {user?.name}! 👋</h1>
                            <p>Manage your events and track registrations</p>
                        </div>
                        <Link to="/events/create" className="btn btn-primary btn-lg">
                            <i className="fas fa-plus-circle"></i>
                            Create Event
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Total Events</p>
                        </div>
                    </div>

                    <div className="stat-card stat-upcoming">
                        <div className="stat-icon">
                            <i className="fas fa-clock"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.upcoming}</h3>
                            <p>Upcoming</p>
                        </div>
                    </div>

                    <div className="stat-card stat-ongoing">
                        <div className="stat-icon">
                            <i className="fas fa-play-circle"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.ongoing}</h3>
                            <p>Ongoing</p>
                        </div>
                    </div>

                    <div className="stat-card stat-completed">
                        <div className="stat-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="events-section">
                    <div className="section-header">
                        <h2>Your Events</h2>
                        {events.length > 0 && (
                            <p className="text-muted">{events.length} event{events.length !== 1 ? 's' : ''}</p>
                        )}
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                            <p>Loading your events...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <i className="fas fa-calendar-plus"></i>
                            </div>
                            <h3>No events yet</h3>
                            <p>Create your first event to get started!</p>
                            <Link to="/events/create" className="btn btn-primary">
                                <i className="fas fa-plus-circle"></i>
                                Create Your First Event
                            </Link>
                        </div>
                    ) : (
                        <div className="events-grid">
                            {events.map(event => (
                                <EventCard
                                    key={event._id}
                                    event={event}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

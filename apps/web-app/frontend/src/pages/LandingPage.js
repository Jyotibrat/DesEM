import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                <div className="container hero-content">
                    <h1 className="hero-title">
                        Manage Events <span className="gradient-text">Effortlessly</span>
                    </h1>
                    <p className="hero-subtitle">
                        Create, manage, and track your events with our powerful event management platform.
                        Send automated emails and manage registrations seamlessly.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Free
                        </Link>
                        <Link to="/login" className="btn btn-outline btn-lg">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <h2 className="section-title text-center">Powerful Features</h2>
                    <p className="section-subtitle text-center">
                        Everything you need to manage successful events
                    </p>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-primary)' }}>
                                <i className="fas fa-calendar-plus"></i>
                            </div>
                            <h3>Easy Event Creation</h3>
                            <p>Create events in seconds with our intuitive interface. Set date, time, location, and capacity limits.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-secondary)' }}>
                                <i className="fas fa-link"></i>
                            </div>
                            <h3>Dynamic Registration URLs</h3>
                            <p>Each event gets a unique registration link. Share it anywhere and track registrations in real-time.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-success)' }}>
                                <i className="fas fa-envelope"></i>
                            </div>
                            <h3>Automated Emails</h3>
                            <p>Send instant confirmation emails and automatic 24-hour reminders to all attendees.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-accent)' }}>
                                <i className="fas fa-users"></i>
                            </div>
                            <h3>Attendee Management</h3>
                            <p>View and manage all registrations. Track who's coming and export attendee lists.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-primary)' }}>
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h3>Real-time Analytics</h3>
                            <p>Monitor registration numbers, track event status, and get insights on your events.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon" style={{ background: 'var(--gradient-secondary)' }}>
                                <i className="fas fa-shield-alt"></i>
                            </div>
                            <h3>Secure & Reliable</h3>
                            <p>Built with Supabase authentication and secure data storage. Your events are safe with us.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title text-center">How It Works</h2>
                    <p className="section-subtitle text-center">
                        Get started in three simple steps
                    </p>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create Your Event</h3>
                            <p>Fill in event details, set date and time, and configure registration settings.</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Share Registration Link</h3>
                            <p>Get a unique URL for your event and share it with your audience.</p>
                        </div>

                        <div className="step-arrow">→</div>

                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Manage Attendees</h3>
                            <p>Track registrations, send updates, and manage your event seamlessly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <div className="container text-center">
                    <h2>Ready to Get Started?</h2>
                    <p>Join thousands of event organizers using our platform</p>
                    <Link to="/register" className="btn btn-primary btn-lg">
                        Create Your First Event
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4>Event Management System</h4>
                            <p>Making event management simple and efficient.</p>
                        </div>
                        <div className="footer-section">
                            <h5>Quick Links</h5>
                            <ul>
                                <li><Link to="/login">Sign In</Link></li>
                                <li><Link to="/register">Sign Up</Link></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h5>Contact</h5>
                            <p>support@eventmanagement.com</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2026 Event Management System. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

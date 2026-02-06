const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: [true, 'Event date is required']
    },
    eventTime: {
        type: String,
        required: [true, 'Event time is required']
    },
    location: {
        type: String,
        required: [true, 'Event location is required']
    },
    maxAttendees: {
        type: Number,
        default: null // null means unlimited
    },
    registrationStartDate: {
        type: Date,
        default: null // null means registration opens immediately
    },
    registrationEndDate: {
        type: Date,
        default: null // null means registration open until event starts
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    registrationUrl: {
        type: String,
        unique: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Registration'
    }],
    reminderSent: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        enum: ['conference', 'workshop', 'seminar', 'meetup', 'webinar', 'other'],
        default: 'other'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    coverImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Generate slug and registration URL before saving
eventSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        // Add random string to ensure uniqueness
        this.slug = `${this.slug}-${Date.now().toString(36)}`;
    }

    if (!this.registrationUrl) {
        this.registrationUrl = `/register/${this.slug}`;
    }

    next();
});

// Update status based on event date and time
eventSchema.methods.updateStatus = function () {
    const now = new Date();

    // Combine eventDate and eventTime for accurate comparison
    const eventDate = new Date(this.eventDate);

    // Parse time from eventTime (format: "10:00 AM" or "14:30")
    if (this.eventTime) {
        const timeMatch = this.eventTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const meridiem = timeMatch[3];

            // Convert to 24-hour format if needed
            if (meridiem) {
                if (meridiem.toUpperCase() === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }
            }

            eventDate.setHours(hours, minutes, 0, 0);
        }
    }

    // Compare with current time
    if (now > eventDate) {
        this.status = 'completed';
    } else if (now.toDateString() === eventDate.toDateString()) {
        this.status = 'ongoing';
    } else {
        this.status = 'upcoming';
    }
};

// Check if registration is still open
eventSchema.methods.isRegistrationOpen = function () {
    const now = new Date();

    // Check event status
    if (this.status === 'completed' || this.status === 'cancelled') {
        return false;
    }

    // Check if registration hasn't started yet
    if (this.registrationStartDate && now < new Date(this.registrationStartDate)) {
        return false;
    }

    // Check if registration has ended
    if (this.registrationEndDate && now > new Date(this.registrationEndDate)) {
        return false;
    }

    return true;
};

module.exports = mongoose.model('Event', eventSchema);

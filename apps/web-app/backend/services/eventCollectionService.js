const mongoose = require('mongoose');

/**
 * Service to manage separate collections for each event
 * Each event gets its own collection for registrations
 */

class EventCollectionService {
    /**
     * Get collection name for an event
     * @param {String} eventId - Event ID
     * @returns {String} Collection name
     */
    static getCollectionName(eventId) {
        return `event_${eventId}_registrations`;
    }

    /**
     * Create a dynamic model for event registrations
     * @param {String} eventId - Event ID
     * @returns {Model} Mongoose model for the event's registrations
     */
    static getEventRegistrationModel(eventId) {
        const collectionName = this.getCollectionName(eventId);

        // Check if model already exists
        if (mongoose.models[collectionName]) {
            return mongoose.models[collectionName];
        }

        // Define schema for event registrations
        const registrationSchema = new mongoose.Schema({
            name: {
                type: String,
                required: [true, 'Name is required'],
                trim: true
            },
            email: {
                type: String,
                required: [true, 'Email is required'],
                lowercase: true,
                trim: true,
                match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
            },
            phone: {
                type: String,
                trim: true
            },
            status: {
                type: String,
                enum: ['confirmed', 'cancelled', 'attended'],
                default: 'confirmed'
            },
            confirmationEmailSent: {
                type: Boolean,
                default: false
            },
            reminderEmailSent: {
                type: Boolean,
                default: false
            },
            registrationDate: {
                type: Date,
                default: Date.now
            },
            additionalInfo: {
                type: String
            }
        }, {
            timestamps: true
        });

        // Create and return the model
        return mongoose.model(collectionName, registrationSchema, collectionName);
    }

    /**
     * Create a registration in event-specific collection
     * @param {String} eventId - Event ID
     * @param {Object} registrationData - Registration data
     * @returns {Promise<Object>} Created registration
     */
    static async createRegistration(eventId, registrationData) {
        const Model = this.getEventRegistrationModel(eventId);
        const registration = await Model.create(registrationData);
        return registration;
    }

    /**
     * Get all registrations for an event
     * @param {String} eventId - Event ID
     * @returns {Promise<Array>} Array of registrations
     */
    static async getRegistrations(eventId) {
        const Model = this.getEventRegistrationModel(eventId);
        const registrations = await Model.find().sort('-registrationDate');
        return registrations;
    }

    /**
     * Get registration count for an event
     * @param {String} eventId - Event ID
     * @returns {Promise<Number>} Count of registrations
     */
    static async getRegistrationCount(eventId) {
        const Model = this.getEventRegistrationModel(eventId);
        const count = await Model.countDocuments();
        return count;
    }

    /**
     * Check if email is already registered for an event
     * @param {String} eventId - Event ID
     * @param {String} email - Email to check
     * @returns {Promise<Boolean>} True if already registered
     */
    static async isEmailRegistered(eventId, email) {
        const Model = this.getEventRegistrationModel(eventId);
        const existing = await Model.findOne({ email: email.toLowerCase() });
        return !!existing;
    }

    /**
     * Update registration status
     * @param {String} eventId - Event ID
     * @param {String} registrationId - Registration ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Updated registration
     */
    static async updateRegistration(eventId, registrationId, updates) {
        const Model = this.getEventRegistrationModel(eventId);
        const registration = await Model.findByIdAndUpdate(
            registrationId,
            updates,
            { new: true, runValidators: true }
        );
        return registration;
    }

    /**
     * Delete event collection when event is closed/deleted
     * @param {String} eventId - Event ID
     * @returns {Promise<Boolean>} True if collection was deleted
     */
    static async deleteEventCollection(eventId) {
        try {
            const collectionName = this.getCollectionName(eventId);

            // Drop the collection
            await mongoose.connection.db.dropCollection(collectionName);

            // Remove the model from mongoose
            if (mongoose.models[collectionName]) {
                delete mongoose.models[collectionName];
                delete mongoose.modelSchemas[collectionName];
            }

            console.log(`✅ Deleted collection: ${collectionName}`);
            return true;
        } catch (error) {
            if (error.message === 'ns not found') {
                // Collection doesn't exist, that's fine
                console.log(`ℹ️  Collection doesn't exist: ${this.getCollectionName(eventId)}`);
                return true;
            }
            console.error(`❌ Error deleting collection:`, error);
            return false;
        }
    }

    /**
     * Get all event collections
     * @returns {Promise<Array>} Array of collection names
     */
    static async getAllEventCollections() {
        const collections = await mongoose.connection.db.listCollections().toArray();
        return collections
            .map(c => c.name)
            .filter(name => name.startsWith('event_') && name.endsWith('_registrations'));
    }

    /**
     * Export registrations to CSV format
     * @param {String} eventId - Event ID
     * @returns {Promise<String>} CSV string
     */
    static async exportToCSV(eventId) {
        const registrations = await this.getRegistrations(eventId);

        if (registrations.length === 0) {
            return 'Name,Email,Phone,Status,Registration Date\n';
        }

        const header = 'Name,Email,Phone,Status,Registration Date\n';
        const rows = registrations.map(reg => {
            return `${reg.name},${reg.email},${reg.phone || ''},${reg.status},${new Date(reg.registrationDate).toLocaleDateString()}`;
        }).join('\n');

        return header + rows;
    }
}

module.exports = EventCollectionService;

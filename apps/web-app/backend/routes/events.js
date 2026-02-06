const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect, authorize } = require('../middleware/auth');
const { sendRegistrationConfirmation } = require('../services/emailService');
const EventCollectionService = require('../services/eventCollectionService');

// @route   GET /api/events
// @desc    Get all events (public and user's own events)
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const { status, category, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;

        const query = { isPublic: true };

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const events = await Event.find(query)
            .populate('host', 'name email')
            .sort(sort)
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Event.countDocuments(query);

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/events/my-events
// @desc    Get current user's events
// @access  Private
router.get('/my-events', protect, async (req, res, next) => {
    try {
        const events = await Event.find({ host: req.user._id })
            .populate('registrations')
            .sort('-createdAt');

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('host', 'name email')
            .populate({
                path: 'registrations',
                select: 'name email phone status registrationDate'
            });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Update status based on current date
        event.updateStatus();
        await event.save();

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/events/slug/:slug
// @desc    Get event by slug (for registration page)
// @access  Public
router.get('/slug/:slug', async (req, res, next) => {
    try {
        const event = await Event.findOne({ slug: req.params.slug })
            .populate('host', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Update status
        event.updateStatus();
        await event.save();

        // Get registration count from dedicated collection
        const registrationCount = await EventCollectionService.getRegistrationCount(event._id.toString());

        // Check if registration is open
        const isOpen = event.isRegistrationOpen();

        res.json({
            success: true,
            data: {
                ...event.toObject(),
                registrationCount,
                isRegistrationOpen: isOpen,
                spotsLeft: event.maxAttendees ? event.maxAttendees - registrationCount : null
            }
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', protect, [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('eventDate').isISO8601().withMessage('Valid event date is required'),
    body('eventTime').notEmpty().withMessage('Event time is required'),
    body('location').notEmpty().withMessage('Location is required')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const eventData = {
            ...req.body,
            host: req.user._id
        };

        const event = await Event.create(eventData);
        await event.populate('host', 'name email');

        // Create dedicated collection for this event's registrations
        console.log(`✅ Created event: ${event.title}`);
        console.log(`📁 Collection created: ${EventCollectionService.getCollectionName(event._id.toString())}`);

        res.status(201).json({
            success: true,
            message: 'Event created successfully with dedicated registration collection',
            data: event,
            collectionName: EventCollectionService.getCollectionName(event._id.toString())
        });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (only event host)
router.put('/:id', protect, async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the host
        if (event.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('host', 'name email');

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: event
        });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event and its dedicated collection
// @access  Private (only event host)
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the host
        if (event.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        // Delete the event's dedicated collection
        const collectionDeleted = await EventCollectionService.deleteEventCollection(event._id.toString());

        // Delete all registrations from main collection (if any)
        await Registration.deleteMany({ event: event._id });

        await event.deleteOne();

        res.json({
            success: true,
            message: 'Event and all registration data deleted successfully',
            collectionDeleted
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/events/:id/register
// @desc    Register for an event (stores in dedicated collection)
// @access  Public
router.post('/:id/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim()
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const event = await Event.findById(req.params.id).populate('host', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if registration is open
        if (!event.isRegistrationOpen()) {
            return res.status(400).json({
                success: false,
                message: 'Registration is closed for this event'
            });
        }

        // Check if already registered in dedicated collection
        const isAlreadyRegistered = await EventCollectionService.isEmailRegistered(
            event._id.toString(),
            req.body.email
        );

        if (isAlreadyRegistered) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check capacity
        const currentCount = await EventCollectionService.getRegistrationCount(event._id.toString());
        if (event.maxAttendees && currentCount >= event.maxAttendees) {
            return res.status(400).json({
                success: false,
                message: 'Event has reached maximum capacity'
            });
        }

        // Create registration in dedicated collection
        const registration = await EventCollectionService.createRegistration(
            event._id.toString(),
            {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                additionalInfo: req.body.additionalInfo
            }
        );

        console.log(`✅ New registration for event: ${event.title}`);
        console.log(`📁 Stored in collection: ${EventCollectionService.getCollectionName(event._id.toString())}`);

        // Send confirmation email
        const emailSent = await sendRegistrationConfirmation(registration, event);
        if (emailSent) {
            await EventCollectionService.updateRegistration(
                event._id.toString(),
                registration._id,
                { confirmationEmailSent: true }
            );
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Check your email for confirmation.',
            data: registration,
            collectionName: EventCollectionService.getCollectionName(event._id.toString())
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/events/:id/registrations
// @desc    Get all registrations for an event from its dedicated collection
// @access  Private (only event host)
router.get('/:id/registrations', protect, async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the host
        if (event.host.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view registrations'
            });
        }

        // Get registrations from dedicated collection
        const registrations = await EventCollectionService.getRegistrations(event._id.toString());

        res.json({
            success: true,
            data: registrations,
            total: registrations.length,
            collectionName: EventCollectionService.getCollectionName(event._id.toString())
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

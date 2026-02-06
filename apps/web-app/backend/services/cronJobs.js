const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendEventReminder } = require('../services/emailService');
const EventCollectionService = require('../services/eventCollectionService');

// Run every hour to check for events happening in 24 hours
const scheduleEventReminders = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔍 Checking for events needing reminders...');

            const now = new Date();
            const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const twentyFiveHoursLater = new Date(now.getTime() + 25 * 60 * 60 * 1000);

            // Find events happening in the next 24-25 hours that haven't sent reminders
            const events = await Event.find({
                eventDate: {
                    $gte: twentyFourHoursLater,
                    $lte: twentyFiveHoursLater
                },
                status: 'upcoming',
                reminderSent: false
            }).populate('registrations');

            console.log(`📧 Found ${events.length} events needing reminders`);

            for (const event of events) {
                // Get all confirmed registrations
                const registrations = await Registration.find({
                    event: event._id,
                    status: 'confirmed',
                    reminderEmailSent: false
                });

                console.log(`  → Sending reminders for "${event.title}" to ${registrations.length} attendees`);

                for (const registration of registrations) {
                    const emailSent = await sendEventReminder(registration, event);

                    if (emailSent) {
                        registration.reminderEmailSent = true;
                        await registration.save();
                    }
                }

                // Mark event as reminder sent
                event.reminderSent = true;
                await event.save();

                console.log(`  ✅ Reminders sent for "${event.title}"`);
            }

            if (events.length === 0) {
                console.log('  No events need reminders at this time');
            }
        } catch (error) {
            console.error('❌ Error in event reminder cron job:', error);
        }
    });

    console.log('✅ Event reminder cron job scheduled (runs every hour)');
};

// Update event statuses every hour
const scheduleEventStatusUpdates = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🔄 Updating event statuses...');

            const events = await Event.find({
                status: { $in: ['upcoming', 'ongoing'] }
            });

            let updated = 0;
            for (const event of events) {
                const oldStatus = event.status;
                event.updateStatus();

                if (oldStatus !== event.status) {
                    await event.save();
                    updated++;
                }
            }

            console.log(`✅ Updated ${updated} event statuses`);
        } catch (error) {
            console.error('❌ Error updating event statuses:', error);
        }
    });

    console.log('✅ Event status update cron job scheduled (runs every hour)');
};

// Auto-delete events 24 hours after they start
const scheduleEventAutoDeletion = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('🗑️  Checking for events to auto-delete...');

            const now = new Date();
            const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // Find completed events that started more than 24 hours ago
            const events = await Event.find({
                status: 'completed'
            });

            let deleted = 0;
            for (const event of events) {
                // Combine eventDate and eventTime to get exact start time
                const eventDate = new Date(event.eventDate);

                // Parse time from eventTime
                if (event.eventTime) {
                    const timeMatch = event.eventTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
                    if (timeMatch) {
                        let hours = parseInt(timeMatch[1]);
                        const minutes = parseInt(timeMatch[2]);
                        const meridiem = timeMatch[3];

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

                // Check if event started more than 24 hours ago
                if (eventDate < twentyFourHoursAgo) {
                    console.log(`  → Deleting event: "${event.title}" (started ${eventDate.toLocaleString()})`);

                    // Delete the event's dedicated collection
                    await EventCollectionService.deleteEventCollection(event._id.toString());

                    // Delete the event
                    await event.deleteOne();
                    deleted++;
                }
            }

            if (deleted > 0) {
                console.log(`✅ Auto-deleted ${deleted} events and their data`);
            } else {
                console.log('  No events to delete at this time');
            }
        } catch (error) {
            console.error('❌ Error in event auto-deletion cron job:', error);
        }
    });

    console.log('✅ Event auto-deletion cron job scheduled (runs every hour)');
};

module.exports = {
    scheduleEventReminders,
    scheduleEventStatusUpdates,
    scheduleEventAutoDeletion
};

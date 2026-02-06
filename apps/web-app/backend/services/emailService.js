const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// Send registration confirmation email
exports.sendRegistrationConfirmation = async (registration, event) => {
    try {
        const transporter = createTransporter();

        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Event Management'}" <${process.env.SMTP_USER}>`,
            to: registration.email,
            subject: `Registration Confirmed: ${event.title}`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Registration Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${registration.name},</p>
              <p>Thank you for registering for <strong>${event.title}</strong>!</p>
              
              <div class="event-details">
                <h2>Event Details</h2>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${eventDate}
                </div>
                <div class="detail-row">
                  <span class="label">⏰ Time:</span> ${event.eventTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Location:</span> ${event.location}
                </div>
              </div>
              
              <p><strong>What's Next?</strong></p>
              <ul>
                <li>You'll receive a reminder email 24 hours before the event</li>
                <li>Please arrive 10 minutes early</li>
                <li>Bring a valid ID for check-in</li>
              </ul>
              
              <p>We're excited to see you there!</p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>If you have any questions, please contact the event organizer.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Registration confirmation email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending registration confirmation email:', error);
        return false;
    }
};

// Send event reminder email (24 hours before)
exports.sendEventReminder = async (registration, event) => {
    try {
        const transporter = createTransporter();

        const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const mailOptions = {
            from: `"${process.env.SMTP_FROM_NAME || 'Event Management'}" <${process.env.SMTP_USER}>`,
            to: registration.email,
            subject: `Reminder: ${event.title} is Tomorrow!`,
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; color: #f5576c; }
            .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #f5576c; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Event Reminder</h1>
            </div>
            <div class="content">
              <p>Hi ${registration.name},</p>
              
              <div class="highlight">
                <strong>This is a friendly reminder that your event is happening tomorrow!</strong>
              </div>
              
              <div class="event-details">
                <h2>${event.title}</h2>
                <div class="detail-row">
                  <span class="label">📅 Date:</span> ${eventDate}
                </div>
                <div class="detail-row">
                  <span class="label">⏰ Time:</span> ${event.eventTime}
                </div>
                <div class="detail-row">
                  <span class="label">📍 Location:</span> ${event.location}
                </div>
              </div>
              
              <p><strong>Important Reminders:</strong></p>
              <ul>
                <li>✅ Arrive 10 minutes early</li>
                <li>✅ Bring a valid ID</li>
                <li>✅ Check the weather and dress accordingly</li>
              </ul>
              
              <p>See you tomorrow!</p>
              
              <div class="footer">
                <p>This is an automated reminder email.</p>
                <p>If you need to cancel, please contact the event organizer.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Event reminder email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Error sending event reminder email:', error);
        return false;
    }
};

// Test email configuration
exports.testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
};

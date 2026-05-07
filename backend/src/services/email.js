// src/services/email.js
// Email Service using Nodemailer

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendIncidentAlert(incident, recipients) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: recipients.join(','),
            subject: `[${incident.severity}] ${incident.title}`,
            html: `
                <h2>New Incident Alert</h2>
                <p><strong>Incident:</strong> ${incident.incident_number}</p>
                <p><strong>Title:</strong> ${incident.title}</p>
                <p><strong>Severity:</strong> ${incident.severity}</p>
                <p><strong>Status:</strong> ${incident.status}</p>
                <p><strong>Created:</strong> ${incident.created_at}</p>
                <br>
                <a href="${process.env.FRONTEND_URL}/incidents/${incident.id}">View Incident</a>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Incident alert email sent');
        } catch (error) {
            console.error('❌ Email send failed:', error);
        }
    }

    async sendWeeklySummary(user, stats) {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Weekly Incident Summary',
            html: `
                <h2>Weekly Summary</h2>
                <p>Hi ${user.first_name},</p>
                <p>Here's your weekly incident summary:</p>
                <ul>
                    <li>Total Incidents: ${stats.total}</li>
                    <li>Resolved: ${stats.resolved}</li>
                    <li>Average Resolution Time: ${stats.avg_resolution_hours}h</li>
                </ul>
                <a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a>
            `
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log('✅ Weekly summary sent');
        } catch (error) {
            console.error('❌ Email send failed:', error);
        }
    }
}

module.exports = new EmailService();

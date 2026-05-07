// src/integrations/twilio.js
// Twilio SMS and Voice Integration

const twilio = require('twilio');

class TwilioIntegration {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        
        if (this.accountSid && this.authToken) {
            this.client = twilio(this.accountSid, this.authToken);
        }
    }

    async sendSMS(to, message) {
        if (!this.client) {
            console.warn('Twilio not configured');
            return;
        }

        try {
            const result = await this.client.messages.create({
                body: message,
                from: this.fromNumber,
                to: to
            });

            console.log('✅ SMS sent:', result.sid);
            return result;
        } catch (error) {
            console.error('❌ SMS failed:', error.message);
        }
    }

    async makeCall(to, message) {
        if (!this.client) {
            console.warn('Twilio not configured');
            return;
        }

        try {
            const result = await this.client.calls.create({
                twiml: `<Response><Say>${message}</Say></Response>`,
                from: this.fromNumber,
                to: to
            });

            console.log('✅ Call initiated:', result.sid);
            return result;
        } catch (error) {
            console.error('❌ Call failed:', error.message);
        }
    }

    async sendIncidentAlert(incident, phoneNumbers) {
        const message = `[${incident.severity}] Incident ${incident.incident_number}: ${incident.title}`;
        
        for (const phone of phoneNumbers) {
            await this.sendSMS(phone, message);
        }
    }

    async escalateWithCall(incident, phoneNumber) {
        const message = `Critical incident ${incident.incident_number}. ${incident.title}. Please check the platform immediately.`;
        await this.makeCall(phoneNumber, message);
    }
}

module.exports = new TwilioIntegration();

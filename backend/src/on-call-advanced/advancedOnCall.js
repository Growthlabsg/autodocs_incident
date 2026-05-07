// src/on-call-advanced/advancedOnCall.js
// Advanced On-Call Features - Shift Swaps, Pay Calculator, Shadow Scheduling

const db = require('../config/database');
const slackBot = require('../slack-bot/slackBot');

class AdvancedOnCallSystem {
    // Request shift swap
    async requestShiftSwap(shiftId, fromUserId, toUserId, reason = null) {
        const result = await db.query(
            `INSERT INTO shift_swaps
             (shift_id, from_user_id, to_user_id, reason, status, requested_at)
             VALUES ($1, $2, $3, $4, 'pending', NOW())
             RETURNING *`,
            [shiftId, fromUserId, toUserId, reason]
        );

        // Notify via Slack
        await this.notifyShiftSwapRequest(result.rows[0]);

        console.log(`📅 Shift swap requested: Shift ${shiftId}`);
        return result.rows[0];
    }

    // Accept shift swap
    async acceptShiftSwap(swapId, acceptingUserId) {
        // Get swap details
        const swap = await db.query('SELECT * FROM shift_swaps WHERE id = $1', [swapId]);
        
        if (swap.rows.length === 0) {
            throw new Error('Swap request not found');
        }

        const swapData = swap.rows[0];

        if (swapData.to_user_id !== acceptingUserId) {
            throw new Error('Only the target user can accept this swap');
        }

        // Update swap status
        await db.query(
            'UPDATE shift_swaps SET status = $1, responded_at = NOW() WHERE id = $2',
            ['accepted', swapId]
        );

        // Swap the shift assignment
        await db.query(
            'UPDATE oncall_shifts SET user_id = $1, updated_at = NOW() WHERE id = $2',
            [swapData.to_user_id, swapData.shift_id]
        );

        // Notify both users
        await this.notifyShiftSwapAccepted(swapData);

        console.log(`✅ Shift swap accepted`);
        return true;
    }

    // Reject shift swap
    async rejectShiftSwap(swapId, rejectingUserId, reason = null) {
        const swap = await db.query('SELECT * FROM shift_swaps WHERE id = $1', [swapId]);
        
        if (swap.rows.length === 0) {
            throw new Error('Swap request not found');
        }

        const swapData = swap.rows[0];

        if (swapData.to_user_id !== rejectingUserId) {
            throw new Error('Only the target user can reject this swap');
        }

        await db.query(
            'UPDATE shift_swaps SET status = $1, responded_at = NOW(), rejection_reason = $2 WHERE id = $3',
            ['rejected', reason, swapId]
        );

        await this.notifyShiftSwapRejected(swapData, reason);

        console.log(`❌ Shift swap rejected`);
        return true;
    }

    // Calculate on-call pay
    async calculateOnCallPay(userId, startDate, endDate) {
        // Get all shifts for user in date range
        const shifts = await db.query(
            `SELECT os.*, t.name as team_name
             FROM oncall_shifts os
             JOIN teams t ON os.team_id = t.id
             WHERE os.user_id = $1
             AND os.start_time >= $2
             AND os.end_time <= $3
             ORDER BY os.start_time`,
            [userId, startDate, endDate]
        );

        let totalPay = 0;
        const breakdown = [];

        for (const shift of shifts.rows) {
            // Get pay config for team
            const payConfig = await db.query(
                'SELECT * FROM oncall_pay_config WHERE team_id = $1',
                [shift.team_id]
            );

            if (payConfig.rows.length === 0) continue;

            const config = payConfig.rows[0];
            const shiftPay = this.calculateShiftPay(shift, config);

            totalPay += shiftPay.total;
            breakdown.push({
                shift_id: shift.id,
                team: shift.team_name,
                start: shift.start_time,
                end: shift.end_time,
                hours: shiftPay.hours,
                base_pay: shiftPay.base,
                multiplier: shiftPay.multiplier,
                total: shiftPay.total
            });
        }

        return {
            user_id: userId,
            period: { start: startDate, end: endDate },
            total_pay: totalPay,
            total_hours: breakdown.reduce((sum, b) => sum + b.hours, 0),
            breakdown
        };
    }

    // Calculate pay for a single shift
    calculateShiftPay(shift, payConfig) {
        const start = new Date(shift.start_time);
        const end = new Date(shift.end_time);
        const hours = (end - start) / (1000 * 60 * 60);

        let multiplier = 1.0;

        // Weekend multiplier
        const day = start.getDay();
        if (day === 0 || day === 6) {
            multiplier = parseFloat(payConfig.weekend_multiplier);
        }

        // Holiday multiplier (would check against holiday calendar)
        // For now, simple implementation

        const basePay = hours * parseFloat(payConfig.hourly_rate);
        const total = basePay * multiplier;

        return {
            hours,
            base: basePay,
            multiplier,
            total
        };
    }

    // Shadow scheduling - pair junior with senior
    async createShadowShift(primaryShiftId, shadowUserId) {
        // Get primary shift
        const primary = await db.query('SELECT * FROM oncall_shifts WHERE id = $1', [primaryShiftId]);
        
        if (primary.rows.length === 0) {
            throw new Error('Primary shift not found');
        }

        const primaryShift = primary.rows[0];

        // Create shadow shift
        const result = await db.query(
            `INSERT INTO oncall_shifts
             (user_id, team_id, start_time, end_time, shift_type, is_shadow, shadow_of_shift_id, created_at)
             VALUES ($1, $2, $3, $4, 'shadow', true, $5, NOW())
             RETURNING *`,
            [shadowUserId, primaryShift.team_id, primaryShift.start_time, primaryShift.end_time, primaryShiftId]
        );

        console.log(`👥 Shadow shift created for user ${shadowUserId}`);
        return result.rows[0];
    }

    // Get on-call burden (hours per engineer)
    async getOnCallBurden(teamId, days = 30) {
        const result = await db.query(
            `SELECT 
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                COUNT(os.id) as shift_count,
                SUM(EXTRACT(EPOCH FROM (os.end_time - os.start_time)) / 3600) as total_hours
             FROM users u
             JOIN oncall_shifts os ON u.id = os.user_id
             WHERE os.team_id = $1
             AND os.start_time >= NOW() - INTERVAL '${days} days'
             AND os.is_shadow = false
             GROUP BY u.id, u.first_name, u.last_name, u.email
             ORDER BY total_hours DESC`,
            [teamId]
        );

        // Calculate burnout risk (>40 hours/week on-call is high risk)
        const weeksInPeriod = days / 7;
        return result.rows.map(row => ({
            ...row,
            avg_hours_per_week: parseFloat(row.total_hours) / weeksInPeriod,
            burnout_risk: this.calculateBurnoutRisk(parseFloat(row.total_hours) / weeksInPeriod)
        }));
    }

    // Calculate burnout risk level
    calculateBurnoutRisk(hoursPerWeek) {
        if (hoursPerWeek > 40) return 'high';
        if (hoursPerWeek > 25) return 'medium';
        return 'low';
    }

    // Holiday calendar integration
    async importHolidays(countryCode, year) {
        // Would integrate with holiday API
        // For now, placeholder
        const holidays = [
            { date: `${year}-01-01`, name: 'New Year\'s Day' },
            { date: `${year}-12-25`, name: 'Christmas Day' }
        ];

        for (const holiday of holidays) {
            await db.query(
                'INSERT INTO holidays (country_code, date, name) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [countryCode, holiday.date, holiday.name]
            );
        }

        console.log(`📅 Imported ${holidays.length} holidays for ${countryCode}`);
    }

    // Notify shift swap request
    async notifyShiftSwapRequest(swap) {
        const users = await db.query(
            'SELECT u.* FROM users u WHERE u.id IN ($1, $2)',
            [swap.from_user_id, swap.to_user_id]
        );

        const fromUser = users.rows.find(u => u.id === swap.from_user_id);
        const toUser = users.rows.find(u => u.id === swap.to_user_id);

        if (toUser.slack_user_id && slackBot.client) {
            await slackBot.client.chat.postMessage({
                channel: toUser.slack_user_id,
                text: `📅 ${fromUser.first_name} ${fromUser.last_name} has requested to swap an on-call shift with you.`,
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*On-Call Shift Swap Request*\n${fromUser.first_name} wants to swap a shift with you.`
                        }
                    },
                    {
                        type: 'actions',
                        elements: [
                            {
                                type: 'button',
                                text: { type: 'plain_text', text: 'Accept' },
                                style: 'primary',
                                action_id: `swap_accept_${swap.id}`
                            },
                            {
                                type: 'button',
                                text: { type: 'plain_text', text: 'Reject' },
                                style: 'danger',
                                action_id: `swap_reject_${swap.id}`
                            }
                        ]
                    }
                ]
            });
        }
    }

    // Notify shift swap accepted
    async notifyShiftSwapAccepted(swap) {
        // Would notify both users via Slack
        console.log(`✅ Notified users about accepted swap`);
    }

    // Notify shift swap rejected
    async notifyShiftSwapRejected(swap, reason) {
        // Would notify requesting user via Slack
        console.log(`❌ Notified user about rejected swap`);
    }

    // Get upcoming shifts for user
    async getUpcomingShifts(userId, days = 30) {
        const result = await db.query(
            `SELECT os.*, t.name as team_name
             FROM oncall_shifts os
             JOIN teams t ON os.team_id = t.id
             WHERE os.user_id = $1
             AND os.start_time >= NOW()
             AND os.start_time <= NOW() + INTERVAL '${days} days'
             ORDER BY os.start_time`,
            [userId]
        );

        return result.rows;
    }

    // Override shift (emergency assignment)
    async overrideShift(shiftId, newUserId, reason) {
        await db.query(
            `UPDATE oncall_shifts 
             SET user_id = $1, override_reason = $2, updated_at = NOW() 
             WHERE id = $3`,
            [newUserId, reason, shiftId]
        );

        console.log(`⚡ Shift ${shiftId} overridden to user ${newUserId}`);
    }
}

module.exports = new AdvancedOnCallSystem();

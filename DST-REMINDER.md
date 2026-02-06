# Daylight Saving Time Reminder - Larry & Steve Bot

## Important: Adjust Cron Job Schedule Twice Per Year

Your external cron job is configured to run at **1:25 PM EST/EDT** daily.

Since you're using an external cron service (cron-job.org), you need to check if it automatically adjusts for DST or if you need to manually update it.

### DST Schedule Changes for 2026:

**Spring Forward (March 8, 2026 at 2:00 AM)**
- Clocks move forward 1 hour (EST → EDT)
- If your cron service doesn't auto-adjust, no action needed if you selected "America/New_York" timezone
- If using UTC time: Change from 18:25 UTC to 17:25 UTC

**Fall Back (November 1, 2026 at 2:00 AM)**
- Clocks move back 1 hour (EDT → EST)
- If your cron service doesn't auto-adjust, no action needed if you selected "America/New_York" timezone
- If using UTC time: Change from 17:25 UTC to 18:25 UTC

### How to Check:

1. Go to your cron-job.org dashboard
2. Check if timezone is set to **America/New_York** (auto-adjusts for DST)
3. OR if set to **UTC**, you'll need to manually update the time twice per year

### Current Configuration:
- Service: cron-job.org
- Time: 1:25 PM
- Timezone: America/New_York (recommended) OR 18:25 UTC (EST) / 17:25 UTC (EDT)
- Endpoint: https://larry-steve-penguins-temp.vercel.app/api/send-daily-text
- Auth: Bearer larry-steve-daily-celebration-2026

### Test After DST Changes:
After each DST transition, verify Becca receives her message at the correct time (1:25 PM local time).

---

**Next Action Dates:**
- March 8, 2026: Check after spring DST
- November 1, 2026: Check after fall DST

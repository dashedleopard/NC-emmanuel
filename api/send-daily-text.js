const twilio = require('twilio');
const { dailyMessages, penguinWisdom, penguinFacts, getRandomItem } = require('./lib/penguin-data');
const { formatDailyMessage, getMessageStats } = require('./lib/message-formatter');

module.exports = async (req, res) => {
  // Verify this is called by Vercel Cron or allow manual trigger with auth
  const authHeader = req.headers.authorization;
  const cronSecret = (process.env.CRON_SECRET || 'default-secret').trim();

  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER?.trim();
    const recipientNumbers = process.env.RECIPIENT_PHONE_NUMBERS?.trim();

    if (!accountSid || !authToken || !twilioNumber || !recipientNumbers) {
      throw new Error('Missing required environment variables');
    }

    const client = twilio(accountSid, authToken);

    // Deduplication: check if we already sent a text today (prevents duplicate triggers)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const sentToday = await client.messages.list({
      from: twilioNumber,
      dateSentAfter: todayStart,
      limit: 1
    });

    if (sentToday.length > 0) {
      console.log('Daily text already sent today, skipping duplicate');
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'Daily text already sent today',
        existingMessageSid: sentToday[0].sid,
        sentAt: sentToday[0].dateSent
      });
    }

    // Parse multiple recipient numbers (comma-separated)
    const recipients = recipientNumbers.split(',').map(num => num.trim());
    console.log(`Sending to ${recipients.length} recipient(s):`, recipients);

    // Get today's day of week (0 = Sunday, 6 = Saturday) and day of month (1-31)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();

    // Construct message with greeting, wisdom quote, and random fact
    const greeting = dailyMessages[dayOfWeek];
    const wisdom = penguinWisdom[dayOfMonth];
    const fact = getRandomItem(penguinFacts);
    const message = formatDailyMessage(greeting, wisdom, fact, dayOfWeek, dayOfMonth);

    // Get message stats for monitoring
    const stats = getMessageStats(message);
    console.log('Message stats:', stats);

    // Send SMS to all recipients
    const results = await Promise.all(
      recipients.map(async (recipientNumber) => {
        try {
          const result = await client.messages.create({
            body: message,
            from: twilioNumber,
            to: recipientNumber
          });
          return {
            success: true,
            to: recipientNumber,
            messageSid: result.sid
          };
        } catch (error) {
          console.error(`Failed to send to ${recipientNumber}:`, error);
          return {
            success: false,
            to: recipientNumber,
            error: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: successCount > 0,
      recipientCount: recipients.length,
      successCount: successCount,
      results: results,
      message: message,
      stats: stats,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return res.status(500).json({
      error: 'Failed to send SMS',
      details: error.message
    });
  }
};

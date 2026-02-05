const twilio = require('twilio');

// Penguin messages for each day of the week
const dailyMessages = {
  0: "🐧 Happy Sunday from Larry & Steve! Time for a lazy penguin day! 🎉",
  1: "🐧 Happy Monday from Larry & Steve! Starting the week with a waddle! 🎉",
  2: "🐧 Happy Tuesday from Larry & Steve! Keep swimming strong! 🎉",
  3: "🐧 Happy Wednesday from Larry & Steve! Halfway through the week! 🎉",
  4: "🐧 Happy Thursday from Larry & Steve! Almost to the weekend! 🎉",
  5: "🐧 Happy Friday from Larry & Steve! Time to celebrate! 🎉🎊",
  6: "🐧 Happy Saturday from Larry & Steve! Weekend waddles! 🎉"
};

// Penguin wisdom quotes for each day of the month (1-31)
const penguinWisdom = {
  1: "A penguin never slips on ice, but always learns from a stumble.",
  2: "The coldest waters teach the warmest lessons.",
  3: "Huddle together when times are tough.",
  4: "Sometimes the best path is a slide, not a walk.",
  5: "Every fish in the sea starts as a single splash.",
  6: "Stand tall, even when you're just 3 feet high.",
  7: "The best view comes after the deepest dive.",
  8: "Waddle at your own pace, the ice isn't going anywhere.",
  9: "A smooth pebble finds its way to the perfect nest.",
  10: "Share your catch, and the colony thrives.",
  11: "Even emperor penguins started as eggs.",
  12: "The fluffiest feathers keep the warmest hearts.",
  13: "When the wind blows, turn your back and wait it out.",
  14: "Every sunset on ice promises a new frozen dawn.",
  15: "Belly slides are faster than worrying about dignity.",
  16: "The loudest call finds the right mate.",
  17: "Ice doesn't melt from a single warm thought.",
  18: "Porpoise with purpose through the waves.",
  19: "Yesterday's fish is today's energy.",
  20: "The colony is only as strong as its smallest chick.",
  21: "Patience catches more fish than panic.",
  22: "Molt gracefully, growth looks messy.",
  23: "Even in a blizzard, your family knows your call.",
  24: "Tuxedos are always in style, no matter the occasion.",
  25: "The ice cracks, but penguins adapt.",
  26: "Dive deep, but always know your way up.",
  27: "A full belly and good company make any day 1:26.",
  28: "Keep your flippers close and your fish closer.",
  29: "The aurora guides, but instinct leads.",
  30: "March proudly, even if the march is long.",
  31: "Tomorrow brings fresh ice and new adventures."
};

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
    const recipientNumber = process.env.RECIPIENT_PHONE_NUMBER?.trim();

    if (!accountSid || !authToken || !twilioNumber || !recipientNumber) {
      throw new Error('Missing required environment variables');
    }

    const client = twilio(accountSid, authToken);

    // Get today's day of week (0 = Sunday, 6 = Saturday) and day of month (1-31)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayOfMonth = now.getDate();

    // Construct message with greeting and wisdom quote
    const greeting = dailyMessages[dayOfWeek];
    const wisdom = penguinWisdom[dayOfMonth];
    const message = `${greeting}\n\n💭 Penguin Wisdom: "${wisdom}"`;

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: twilioNumber,
      to: recipientNumber
    });

    return res.status(200).json({
      success: true,
      messageSid: result.sid,
      message: message,
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

const twilio = require('twilio');
const { penguinFacts, penguinJokes, penguinWisdom, getRandomItem } = require('./lib/penguin-data');

module.exports = async (req, res) => {
  // This endpoint handles incoming SMS messages from Twilio
  try {
    // Extract message details from Twilio's POST request
    const { From, Body, MessageSid } = req.body;

    console.log('Received SMS:', { From, Body, MessageSid });

    // Parse command (case-insensitive, trimmed)
    const command = (Body || '').trim().toUpperCase();

    // Generate response based on command
    let responseText;

    switch (command) {
      case 'FACT':
        responseText = `🐧 ${getRandomItem(penguinFacts)}`;
        break;

      case 'JOKE':
        responseText = getRandomItem(penguinJokes);
        break;

      case 'WISDOM':
        const wisdomQuotes = Object.values(penguinWisdom);
        responseText = `💭 "${getRandomItem(wisdomQuotes)}"`;
        break;

      case 'STATUS':
        responseText = '🐧 Larry & Steve are swimming strong! Bot is working perfectly! 🌊';
        break;

      case 'HELP':
        responseText = `🐧 Larry & Steve Commands:
• FACT - Random penguin fact
• JOKE - Penguin joke
• WISDOM - Random wisdom quote
• STATUS - Check bot status
• HELP - Show this menu`;
        break;

      default:
        responseText = `🐧 Unknown command! Text HELP to see available commands.`;
        break;
    }

    // Return TwiML response (always return 200 to avoid Twilio retries)
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(responseText);

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('Error processing SMS:', error);

    // Always return valid TwiML even on error
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('🐧 Oops! Larry & Steve encountered an error. Try again later!');

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
  }
};

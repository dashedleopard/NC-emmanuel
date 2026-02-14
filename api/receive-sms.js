const twilio = require('twilio');
const { penguinFacts, penguinJokes, penguinWisdom, getRandomItem, getTodaysTrivia, getStreak } = require('./lib/penguin-data');

module.exports = async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;
    console.log('Received SMS:', { From, Body, MessageSid });

    const command = (Body || '').trim().toUpperCase();
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

      case 'TRIVIA': {
        const trivia = getTodaysTrivia();
        responseText = `🧠 Penguin Trivia!\n\n${trivia.q}\n\n${trivia.a}\n${trivia.b}\n${trivia.c}\n\nReply A, B, or C!`;
        break;
      }

      case 'A':
      case 'B':
      case 'C': {
        const trivia = getTodaysTrivia();
        if (command === trivia.correct) {
          responseText = `✅ CORRECT! ${trivia.fact}\n\n🐧 Larry & Steve are proud of you!`;
        } else {
          responseText = `❌ Not quite! The answer was ${trivia.correct}.\n\n${trivia.fact}\n\n🐧 Try again tomorrow!`;
        }
        break;
      }

      case 'STREAK': {
        const streak = getStreak();
        responseText = `📅 Larry & Steve have been texting you for ${streak} days!\n\n🐧 Keep the streak alive!`;
        break;
      }

      case 'STATUS':
        responseText = `🐧 Larry & Steve are swimming strong! Day ${getStreak()} and counting! 🌊`;
        break;

      case 'HELP':
        responseText = `🐧 Larry & Steve Commands:
• FACT - Random penguin fact
• JOKE - Penguin joke
• WISDOM - Random wisdom quote
• TRIVIA - Daily trivia question
• STREAK - Check your streak
• STATUS - Check bot status
• HELP - Show this menu`;
        break;

      default:
        responseText = `🐧 Unknown command! Text HELP to see available commands.`;
        break;
    }

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(responseText);
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());

  } catch (error) {
    console.error('Error processing SMS:', error);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message('🐧 Oops! Larry & Steve encountered an error. Try again later!');
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
  }
};

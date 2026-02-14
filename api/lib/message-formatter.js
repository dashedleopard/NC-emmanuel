// Message formatting utilities for Larry & Steve penguin bot

const { getEmojiForDay } = require('./emoji-selector');
const { getStreak, milestones, getSpecialDay } = require('./penguin-data');

/**
 * Format the complete daily message with emojis, streaks, and special days
 */
const formatDailyMessage = (greeting, wisdom, fact, dayOfWeek, dayOfMonth) => {
  const greetingEmoji = getEmojiForDay('greeting', dayOfWeek, dayOfMonth);
  const wisdomEmoji = getEmojiForDay('wisdom', dayOfWeek, dayOfMonth);
  const factEmoji = getEmojiForDay('fact', dayOfWeek, dayOfMonth);

  const now = new Date();
  const month = now.getMonth() + 1;
  const streak = getStreak();

  // Check for special day override
  const special = getSpecialDay(month, dayOfMonth);
  const actualGreeting = special
    ? `${special.emoji} ${special.greeting}`
    : `${greetingEmoji} ${greeting}`;

  // Check for milestone
  const milestone = milestones[streak];
  const streakLine = milestone
    ? `🏅 Day ${streak}: ${milestone}`
    : `📅 Day ${streak} of Larry & Steve!`;

  return `${actualGreeting}

${streakLine}

${wisdomEmoji} Penguin Wisdom: "${wisdom}"

${factEmoji} Fun Fact: ${fact}

🔗 View the celebration: https://dashedleopard.github.io/larry-steve-penguins/`;
};

/**
 * Get message statistics (character count and SMS segment count)
 */
const getMessageStats = (message) => {
  const length = message.length;
  const segments = length <= 160 ? 1 : Math.ceil(length / 153);
  return { length, segments };
};

module.exports = {
  formatDailyMessage,
  getMessageStats
};

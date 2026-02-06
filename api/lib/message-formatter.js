// Message formatting utilities for Larry & Steve penguin bot

const { getEmojiForDay } = require('./emoji-selector');

/**
 * Format the complete daily message with emojis and structure
 * @param {string} greeting - Day-of-week greeting
 * @param {string} wisdom - Wisdom quote
 * @param {string} fact - Penguin fact
 * @param {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @param {number} dayOfMonth - 1-31
 * @returns {string} Formatted message
 */
const formatDailyMessage = (greeting, wisdom, fact, dayOfWeek, dayOfMonth) => {
  const greetingEmoji = getEmojiForDay('greeting', dayOfWeek, dayOfMonth);
  const wisdomEmoji = getEmojiForDay('wisdom', dayOfWeek, dayOfMonth);
  const factEmoji = getEmojiForDay('fact', dayOfWeek, dayOfMonth);

  return `${greetingEmoji} ${greeting}

${wisdomEmoji} Penguin Wisdom: "${wisdom}"

${factEmoji} Fun Fact: ${fact}

🔗 View the celebration: https://larry-steve-penguins-temp.vercel.app/`;
};

/**
 * Get message statistics (character count and SMS segment count)
 * @param {string} message - Message text
 * @returns {object} Stats object with length and segments
 */
const getMessageStats = (message) => {
  const length = message.length;
  // SMS segments: 160 chars for single, 153 chars per segment for multi-part
  const segments = length <= 160 ? 1 : Math.ceil(length / 153);

  return {
    length,
    segments
  };
};

module.exports = {
  formatDailyMessage,
  getMessageStats
};

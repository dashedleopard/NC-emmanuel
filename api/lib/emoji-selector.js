// Emoji rotation logic for Larry & Steve penguin bot

// Three emoji pools for different message types
const penguinEmojis = {
  greeting: ['🐧', '❄️', '⛄', '🌊', '🏔️'],
  wisdom: ['💭', '💙', '✨', '🎯', '⭐'],
  fact: ['🐟', '🎉', '🎊', '💙', '🌟']
};

/**
 * Get emoji for a specific message type based on the day
 * @param {string} type - 'greeting', 'wisdom', or 'fact'
 * @param {number} dayOfWeek - 0-6 (Sunday-Saturday)
 * @param {number} dayOfMonth - 1-31
 * @returns {string} Selected emoji
 */
const getEmojiForDay = (type, dayOfWeek, dayOfMonth) => {
  const emojiPool = penguinEmojis[type];

  if (!emojiPool || emojiPool.length === 0) {
    return '🐧'; // Fallback emoji
  }

  // Greeting uses dayOfWeek, wisdom/fact use dayOfMonth for variation
  const index = type === 'greeting'
    ? dayOfWeek % emojiPool.length
    : (dayOfMonth - 1) % emojiPool.length;

  return emojiPool[index];
};

module.exports = {
  getEmojiForDay,
  penguinEmojis
};

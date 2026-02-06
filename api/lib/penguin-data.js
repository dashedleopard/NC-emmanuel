// Centralized data store for Larry & Steve penguin bot

// Helper function for random selection
const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Day-of-week greetings (without hardcoded emojis)
const dailyMessages = {
  0: "Happy Sunday from Larry & Steve! Time for a lazy penguin day!",
  1: "Happy Monday from Larry & Steve! Starting the week with a waddle!",
  2: "Happy Tuesday from Larry & Steve! Keep swimming strong!",
  3: "Happy Wednesday from Larry & Steve! Halfway through the week!",
  4: "Happy Thursday from Larry & Steve! Almost to the weekend!",
  5: "Happy Friday from Larry & Steve! Time to celebrate!",
  6: "Happy Saturday from Larry & Steve! Weekend waddles!"
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
  27: "A full belly and good company make any day great.",
  28: "Keep your flippers close and your fish closer.",
  29: "The aurora guides, but instinct leads.",
  30: "March proudly, even if the march is long.",
  31: "Tomorrow brings fresh ice and new adventures."
};

// 30 penguin facts (40-70 chars each for SMS efficiency)
const penguinFacts = [
  "Emperor penguins can dive over 1,800 feet deep!",
  "Penguins can swim up to 22 mph underwater!",
  "A group of penguins is called a 'waddle' on land!",
  "Penguins spend up to 75% of their life in water!",
  "Emperor penguins can hold their breath for 22 minutes!",
  "The smallest penguin is only 16 inches tall!",
  "Penguins have excellent hearing underwater!",
  "A penguin's black and white coloring is camouflage!",
  "Penguins can drink salt water safely!",
  "Emperor penguin dads incubate eggs for 2 months!",
  "Penguins molt all their feathers at once!",
  "Some penguins can leap 6 feet out of the water!",
  "Penguins have been around for 60 million years!",
  "A penguin's tail helps them balance when waddling!",
  "Gentoo penguins are the fastest swimming penguins!",
  "Penguins can recognize each other's unique calls!",
  "Yellow-eyed penguins are among the rarest species!",
  "Penguins have a gland that filters salt from water!",
  "Macaroni penguins have funky yellow head feathers!",
  "Penguins can't taste sweet or savory flavors!",
  "Adelie penguins build nests from stones and pebbles!",
  "Some penguins travel 600 miles to their colonies!",
  "Penguin feathers are waterproof and windproof!",
  "King penguins don't build nests at all!",
  "Penguins have more feathers than most birds!",
  "Little blue penguins are also called fairy penguins!",
  "Rockhopper penguins hop over rocky terrain!",
  "Chinstrap penguins are named for their facial marking!",
  "Penguins can see better underwater than in air!",
  "African penguins can live up to 20 years!"
];

// 15 penguin jokes for interactive replies
const penguinJokes = [
  "Why don't penguins like talking to strangers? They find it hard to break the ice! 🐧",
  "What do penguins wear to the beach? A beak-ini! 👙",
  "How does a penguin build its house? Igloos it together! 🏠",
  "What's a penguin's favorite relative? Aunt Arctica! ❄️",
  "Why don't penguins fly? They're not into the cheep seats! ✈️",
  "What do you call a penguin in the desert? Lost! 🌵",
  "How do penguins drink? Out of beak-ers! 🥤",
  "What's black, white, and red all over? A sunburned penguin! ☀️",
  "Why are penguins good race drivers? They're always in pole position! 🏎️",
  "What do penguins sing on birthdays? Freeze a jolly good fellow! 🎂",
  "Where do penguins go to the movies? The dive-in! 🎬",
  "What's a penguin's favorite salad? Iceberg lettuce! 🥗",
  "Why did the penguin cross the road? To go with the floe! 🚶",
  "What do you call fifty penguins in the Arctic? Really lost! 🧭",
  "How do penguins pass exams? They just wing it! 📝"
];

module.exports = {
  dailyMessages,
  penguinWisdom,
  penguinFacts,
  penguinJokes,
  getRandomItem
};

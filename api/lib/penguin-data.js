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

// Penguin wisdom quotes — 62 quotes, indexed by day of month (1-31)
// plus extras drawn randomly when dayOfMonth exceeds 31 or for variety
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

// 60 penguin facts for daily variety
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
  "African penguins can live up to 20 years!",
  // 30 new facts
  "Emperor penguins huddle in groups of up to 5,000!",
  "Penguins have about 100 feathers per square inch!",
  "The oldest known penguin fossil is 62 million years old!",
  "Galapagos penguins live near the equator!",
  "Penguins' knees are hidden inside their bodies!",
  "A penguin's heartbeat slows to 20 bpm while diving!",
  "King penguin chicks take over a year to fledge!",
  "Penguins can sleep standing up on the ice!",
  "Emperor penguins survive temperatures of -76°F!",
  "Penguin colonies are called rookeries!",
  "Adelie penguins can march 30 miles over ice to feed!",
  "Penguins swallow pebbles to help with buoyancy!",
  "The largest ever penguin was 6.8 feet tall!",
  "Magellanic penguins migrate 3,000 miles each year!",
  "Penguins' black backs help absorb heat from the sun!",
  "Some penguins toboggan on their bellies to move faster!",
  "Penguin couples often bow to each other as a greeting!",
  "Fairy penguins weigh only about 2 pounds!",
  "Penguins can jump up to 9 feet to land on ice shelves!",
  "A penguin's tongue has rear-facing spines to grip fish!",
  "Snares penguins are found on only one island in the world!",
  "Penguins are one of the few birds with solid bones!",
  "Chinstrap penguins get only 4 seconds of sleep at a time!",
  "Emperor penguins can fast for up to 4 months straight!",
  "Penguins have a third eyelid to protect their eyes underwater!",
  "King penguins have the longest breeding cycle of any bird!",
  "Penguin chicks huddle in groups called crèches!",
  "Penguins preen for hours to stay waterproof!",
  "Rockhopper penguins can climb steep rocky cliffs!",
  "Penguins communicate through body language and flipper waving!"
];

// 30 penguin jokes for interactive replies
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
  "How do penguins pass exams? They just wing it! 📝",
  // 15 new jokes
  "What do penguins eat for lunch? Ice-burgers! 🍔",
  "Why did the penguin get promoted? He was outstanding in his field of ice! 🏆",
  "What's a penguin's favorite pasta? Penguine! 🍝",
  "How do penguins make a decision? Flipper coin toss! 🪙",
  "What do you call a happy penguin? A pen-grin! 😁",
  "Why do penguins carry fish in their beaks? Because they don't have pockets! 🐟",
  "What's a penguin's favorite candy? Ice Pops! 🍭",
  "Why was the penguin a great musician? He had perfect pitch! 🎵",
  "What do penguins do in their spare time? Chill out! 🧊",
  "What's a penguin's favorite social media? Insta-glam on ice! 📱",
  "Why do penguins always win arguments? They have strong points! 🎯",
  "What's a penguin's favorite dance? The ice-olated shuffle! 💃",
  "Why did the penguin bring a ladder? To reach the high notes! 🎤",
  "What did the ocean say to the penguin? Nothing, it just waved! 🌊",
  "How do penguins stay in shape? They do ice-ometric exercises! 💪"
];

// Curated penguin image URLs for MMS (public domain / freely licensed)
const penguinImages = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Emperor_Penguin_Manchot_empereur.jpg/800px-Emperor_Penguin_Manchot_empereur.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg/800px-Aptenodytes_forsteri_-Snow_Hill_Island%2C_Antarctica_-adults_and_juvenile-8.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Manchot_papou_-_Gentoo_Penguin.jpg/800px-Manchot_papou_-_Gentoo_Penguin.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Chinstrap_Penguin_%28Pygoscelis_antarcticus%29_-_Pair_at_Aitcho_Island.jpg/800px-Chinstrap_Penguin_%28Pygoscelis_antarcticus%29_-_Pair_at_Aitcho_Island.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Penguins_walking_-Moltke_Harbour%2C_South_Georgia%2C_British_overseas_territory%2C_UK-8.jpg/800px-Penguins_walking_-Moltke_Harbour%2C_South_Georgia%2C_British_overseas_territory%2C_UK-8.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Penguins_Edinburgh_Zoo_2004_SMC.jpg/800px-Penguins_Edinburgh_Zoo_2004_SMC.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Rockhopper_Penguin_in_Edinburgh_Zoo_2004_SMC.jpg/800px-Rockhopper_Penguin_in_Edinburgh_Zoo_2004_SMC.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Falkland_Islands_Penguins_36.jpg/800px-Falkland_Islands_Penguins_36.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarcticus%29_04.jpg/800px-South_Shetland-2016-Deception_Island%E2%80%93Chinstrap_penguin_%28Pygoscelis_antarcticus%29_04.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Penguins_Falklands.jpg/800px-Penguins_Falklands.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camara_lridge_-_Manchots_royaux_%282%29.jpg/800px-Camara_lridge_-_Manchots_royaux_%282%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Manchot_Adelie_-_Adelie_Penguin.jpg/800px-Manchot_Adelie_-_Adelie_Penguin.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/King_Penguins.jpg/800px-King_Penguins.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Penguin_in_Antarctica_jumping_out_of_the_water.jpg/800px-Penguin_in_Antarctica_jumping_out_of_the_water.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Manchot_royal_-_King_Penguin.jpg/800px-Manchot_royal_-_King_Penguin.jpg"
];

// The date Larry & Steve started sending texts (for streak counting)
const BOT_START_DATE = '2026-01-27';

// Calculate streak (days since start)
const getStreak = () => {
  const start = new Date(BOT_START_DATE + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
};

// Milestone messages for streak celebrations
const milestones = {
  7:   "ONE WEEK of Larry & Steve! 🎉",
  14:  "TWO WEEKS! Larry & Steve are unstoppable! 🎊",
  25:  "DAY 25! A quarter century of penguin love! 🏆",
  30:  "ONE MONTH! Larry & Steve's monthly-versary! 🥳",
  50:  "DAY 50! Half a hundred! Larry & Steve are legends! 🌟",
  75:  "DAY 75! Three quarters of a century of waddles! ✨",
  100: "DAY 100!!! TRIPLE DIGITS! 🐧👑🐧",
  150: "DAY 150! Larry & Steve have been at it for 5 months! 🎆",
  200: "DAY 200! You've officially received 200 penguin texts! 💎",
  365: "ONE YEAR OF LARRY & STEVE! 🎂🐧🎂",
};

// Special day messages keyed by "MM-DD"
const specialDays = {
  '01-01': { emoji: '🎆', greeting: "Happy New Year from Larry & Steve! New year, new waddles!" },
  '02-02': { emoji: '🐿️', greeting: "It's Groundhog Day! Larry & Steve see their shadow... more winter!" },
  '02-14': { emoji: '💕', greeting: "Happy Valentine's Day! Larry & Steve love you the MOST!" },
  '03-17': { emoji: '🍀', greeting: "Happy St. Patrick's Day! Larry & Steve are feeling lucky!" },
  '04-01': { emoji: '🤡', greeting: "April Fools! Larry & Steve tried to fly today... didn't work!" },
  '04-22': { emoji: '🌍', greeting: "Happy Earth Day! Larry & Steve say protect the ice caps!" },
  '04-25': { emoji: '🐧', greeting: "WORLD PENGUIN DAY! Larry & Steve's favorite holiday!" },
  '05-04': { emoji: '⭐', greeting: "May the 4th be with you! Larry & Steve are Jedi penguins!" },
  '07-04': { emoji: '🎆', greeting: "Happy 4th of July! Larry & Steve celebrate with fish fireworks!" },
  '09-22': { emoji: '🍂', greeting: "Happy first day of fall! Larry & Steve love the cold coming!" },
  '10-31': { emoji: '🎃', greeting: "Happy Halloween! Larry & Steve are dressed as... penguins! 👻" },
  '11-28': { emoji: '🦃', greeting: "Happy Thanksgiving! Larry & Steve are thankful for YOU!" },
  '12-21': { emoji: '❄️', greeting: "Winter Solstice! The longest night — Larry & Steve's dream!" },
  '12-24': { emoji: '🎄', greeting: "Christmas Eve! Larry & Steve left you fish under the tree!" },
  '12-25': { emoji: '🎅', greeting: "Merry Christmas from Larry & Steve! Ho ho ho-nk!" },
  '12-31': { emoji: '🥂', greeting: "New Year's Eve! Larry & Steve are counting down!" },
};

// Get special day info for today (or null)
const getSpecialDay = (month, day) => {
  const key = String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  return specialDays[key] || null;
};

// 20 penguin trivia questions with multiple choice
const triviaQuestions = [
  { q: "How many species of penguins exist?", a: "A) 10", b: "B) 18", c: "C) 25", correct: "B", fact: "There are 18 recognized species of penguins!" },
  { q: "Which is the tallest penguin species?", a: "A) King", b: "B) Emperor", c: "C) Gentoo", correct: "B", fact: "Emperor penguins can reach up to 4 feet tall!" },
  { q: "Where do Galapagos penguins live?", a: "A) Antarctica", b: "B) Near the equator", c: "C) Arctic", correct: "B", fact: "They're the only penguins that live north of the equator!" },
  { q: "How fast can Gentoo penguins swim?", a: "A) 10 mph", b: "B) 22 mph", c: "C) 35 mph", correct: "B", fact: "Gentoo penguins are the fastest swimming penguin species!" },
  { q: "What is a group of penguins in water called?", a: "A) A raft", b: "B) A school", c: "C) A pod", correct: "A", fact: "In water they're a raft, on land they're a waddle!" },
  { q: "How long can Emperor penguins hold their breath?", a: "A) 5 min", b: "B) 12 min", c: "C) 22 min", correct: "C", fact: "Emperor penguins can hold their breath for an incredible 22 minutes!" },
  { q: "What do penguins use to attract mates?", a: "A) Dancing", b: "B) Pebbles", c: "C) Singing", correct: "B", fact: "Adelie penguins gift pebbles to their partners!" },
  { q: "Which penguin has yellow head feathers?", a: "A) Macaroni", b: "B) Chinstrap", c: "C) Little Blue", correct: "A", fact: "Macaroni penguins have distinctive yellow crests!" },
  { q: "How deep can Emperor penguins dive?", a: "A) 500 ft", b: "B) 1,000 ft", c: "C) 1,800 ft", correct: "C", fact: "Emperor penguins can dive over 1,800 feet deep!" },
  { q: "What is the smallest penguin species?", a: "A) Rockhopper", b: "B) Fairy/Little Blue", c: "C) African", correct: "B", fact: "Little Blue (Fairy) penguins are only about 13 inches tall!" },
  { q: "How do penguins stay warm in huddles?", a: "A) Body heat sharing", b: "B) They don't get cold", c: "C) Underground burrows", correct: "A", fact: "Emperor penguins rotate positions so everyone stays warm!" },
  { q: "Can penguins taste their food?", a: "A) Yes, fully", b: "B) Only salty & sour", c: "C) No taste at all", correct: "B", fact: "Penguins lost the ability to taste sweet, savory, and bitter!" },
  { q: "How old are the oldest penguin fossils?", a: "A) 10M years", b: "B) 35M years", c: "C) 62M years", correct: "C", fact: "Penguin fossils date back about 62 million years!" },
  { q: "Which continent has NO penguins?", a: "A) Asia", b: "B) South America", c: "C) Africa", correct: "A", fact: "Penguins live on every Southern Hemisphere continent but not Asia!" },
  { q: "What keeps penguin feathers waterproof?", a: "A) Oil gland", b: "B) Wax coating", c: "C) Dense layers", correct: "A", fact: "Penguins spread oil from a gland near their tail!" },
  { q: "How long do Emperor dads incubate eggs?", a: "A) 2 weeks", b: "B) 2 months", c: "C) 6 months", correct: "B", fact: "Emperor dads balance the egg on their feet for about 65 days!" },
  { q: "What color is a penguin chick's first coat?", a: "A) Black & white", b: "B) Gray/brown", c: "C) All white", correct: "B", fact: "Most penguin chicks are covered in gray or brown fluffy down!" },
  { q: "Which penguin is named for its face marking?", a: "A) Emperor", b: "B) Chinstrap", c: "C) King", correct: "B", fact: "Chinstrap penguins have a thin black band under their chin!" },
  { q: "How many feathers per sq inch do penguins have?", a: "A) 20", b: "B) 50", c: "C) 100", correct: "C", fact: "About 100 feathers per square inch — more than almost any bird!" },
  { q: "What is penguin courtship called?", a: "A) Ecstatic display", b: "B) Mating dance", c: "C) Fish offering", correct: "A", fact: "The ecstatic display involves stretching, calling, and flipper waving!" },
];

// Get today's trivia question (deterministic by date)
const getTodaysTrivia = () => {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  return triviaQuestions[dayOfYear % triviaQuestions.length];
};

module.exports = {
  dailyMessages,
  penguinWisdom,
  penguinFacts,
  penguinJokes,
  penguinImages,
  getRandomItem,
  BOT_START_DATE,
  getStreak,
  milestones,
  specialDays,
  getSpecialDay,
  triviaQuestions,
  getTodaysTrivia
};

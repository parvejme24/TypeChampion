export const TYPING_PARAGRAPHS = [
  "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
  "Technology has transformed the way we communicate and work. From smartphones to cloud computing, innovation continues to shape our daily lives and future possibilities.",
  "Learning to type efficiently is a valuable skill in today digital world. Practice regularly and you will see steady improvement in both speed and accuracy over time.",
  "The art of writing requires patience and dedication. Every great author started with a single word, then a sentence, and eventually crafted stories that moved millions.",
  "Nature offers endless inspiration for those who take the time to observe. The changing seasons remind us that growth and renewal are always possible.",
];

export function getRandomParagraph() {
  return TYPING_PARAGRAPHS[Math.floor(Math.random() * TYPING_PARAGRAPHS.length)];
}

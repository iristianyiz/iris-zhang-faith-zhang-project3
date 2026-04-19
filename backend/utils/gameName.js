import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const wordsPath = path.join(__dirname, "..", "data", "words.txt");

let cachedWords = null;

function loadWords() {
  if (cachedWords) return cachedWords;
  const raw = fs.readFileSync(wordsPath, "utf8");
  cachedWords = raw
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length >= 4 && w.length <= 12);
  if (cachedWords.length < 1000) {
    throw new Error(`Word list too short (${cachedWords.length}); need 1000+`);
  }
  return cachedWords;
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function pickWord(words) {
  return words[Math.floor(Math.random() * words.length)];
}

/**
 * Builds a random 3-word title; caller retries on unique-name collision.
 */
export function generateRandomGameName() {
  const words = loadWords();
  const a = pickWord(words);
  const b = pickWord(words);
  const c = pickWord(words);
  return `${titleCase(a)} ${titleCase(b)} ${titleCase(c)}`;
}

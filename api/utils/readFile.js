import fs from 'fs';
import path from 'path';

function readPrompt(fileName) {
  const filePath = path.join('/Users/sriharsha/Desktop/Clg/WD/blog_website/api/prompts', fileName);
  return fs.readFileSync(filePath, 'utf8');
}

export const systemInstructions = readPrompt('system_instructions.txt');
export const categoryInstructions = readPrompt('category_instructions.txt');
export const rephraseInstructions = readPrompt('rephrase_instructions.txt');
export const summariseInstructions = readPrompt('summarise_instructions.txt');
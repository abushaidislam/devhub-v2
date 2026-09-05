import { EngineResult, generateGitignore } from './utils';
export { generateGitignore };

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint",
  "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia",
  "deserunt", "mollit", "anim", "id", "est", "laborum", "at", "vero", "eos",
  "accusamus", "iusto", "odio", "dignissimos", "ducimus", "blanditiis", "praesentium",
  "voluptatum", "deleniti", "atque", "corrupti", "quos", "dolores", "quas",
  "molestias", "excepturi", "sint", "obcaecati", "cupiditate", "provident",
  "similique", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollitia",
  "animi", "id", "est", "laborum", "et", "dolorum", "fuga"
];

export function generateLoremIpsum(
  input: string,
  options?: { count?: number; units?: "paragraphs" | "sentences" | "words"; startWithLorem?: boolean }
): EngineResult {
  const units = options?.units ?? "paragraphs";
  const startWithLorem = options?.startWithLorem !== false;

  let count = options?.count;
  if (count === undefined || count === null) {
    const match = input.match(/\d+/);
    count = match ? parseInt(match[0], 10) : 3;
  }
  count = Math.max(1, Math.min(count, units === "words" ? 2000 : units === "sentences" ? 500 : 100));

  let wordIndex = 0;
  function getNextWord() {
    const word = LOREM_WORDS[wordIndex % LOREM_WORDS.length];
    wordIndex++;
    return word;
  }

  function makeSentence(isFirst: boolean) {
    if (isFirst && startWithLorem) {
      return "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
    }
    const len = 8 + (wordIndex % 8);
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      words.push(getNextWord());
    }
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }

  function makeParagraph(isFirst: boolean) {
    const sentenceCount = 4 + (wordIndex % 4);
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(makeSentence(isFirst && i === 0));
    }
    return sentences.join(" ");
  }

  let result = "";
  if (units === "words") {
    const words: string[] = [];
    if (startWithLorem) {
      const intro = ["lorem", "ipsum", "dolor", "sit", "amet"];
      for (let i = 0; i < Math.min(count, intro.length); i++) {
        words.push(intro[i]);
      }
    }
    while (words.length < count) {
      words.push(getNextWord());
    }
    result = words.join(" ");
  } else if (units === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(makeSentence(i === 0));
    }
    result = sentences.join(" ");
  } else {
    const paragraphs: string[] = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(makeParagraph(i === 0));
    }
    result = paragraphs.join("\n\n");
  }

  return {
    output: result,
    meta: `Generated ${count} ${units} locally`,
  };
}



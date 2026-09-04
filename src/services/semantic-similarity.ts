import natural from "natural";

export type SimilarityResult = {
  score: number;
  matchedTerms: string[];
};

export function calculateSemanticSimilarity(
  title: string,
  description: string | null,
  userCategories: string[]
): SimilarityResult {
  const articleText = `${title} ${description ?? ""}`.trim();

  if (!articleText || userCategories.length === 0) {
    return {
      score: 0,
      matchedTerms: [],
    };
  }

  const tokenizer = new natural.WordTokenizer();

  const articleTokens = tokenizer
    .tokenize(articleText.toLowerCase())
    .filter((word) => word.length > 2);

  const interestText = userCategories.join(" ").toLowerCase();

  const interestTokens = tokenizer
    .tokenize(interestText)
    .filter((word) => word.length > 2);

  if (articleTokens.length === 0 || interestTokens.length === 0) {
    return {
      score: 0,
      matchedTerms: [],
    };
  }

  const articleFrequency = new Map<string, number>();
  const interestFrequency = new Map<string, number>();

  for (const word of articleTokens) {
    articleFrequency.set(
      word,
      (articleFrequency.get(word) ?? 0) + 1
    );
  }

  for (const word of interestTokens) {
    interestFrequency.set(
      word,
      (interestFrequency.get(word) ?? 0) + 1
    );
  }

  const vocabulary = new Set([
    ...articleFrequency.keys(),
    ...interestFrequency.keys(),
  ]);

  let dotProduct = 0;
  let articleMagnitude = 0;
  let interestMagnitude = 0;

  const matchedTerms: string[] = [];

  for (const word of vocabulary) {
    const articleValue = articleFrequency.get(word) ?? 0;
    const interestValue = interestFrequency.get(word) ?? 0;

    dotProduct += articleValue * interestValue;
    articleMagnitude += articleValue * articleValue;
    interestMagnitude += interestValue * interestValue;

    if (articleValue > 0 && interestValue > 0) {
      matchedTerms.push(word);
    }
  }

  if (articleMagnitude === 0 || interestMagnitude === 0) {
    return {
      score: 0,
      matchedTerms: [],
    };
  }

  const similarity =
    dotProduct /
    (Math.sqrt(articleMagnitude) *
      Math.sqrt(interestMagnitude));

  return {
    score: Number(similarity.toFixed(4)),
    matchedTerms,
  };
}
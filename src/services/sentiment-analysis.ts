import Sentiment from "sentiment";

const sentiment = new Sentiment();

export type SentimentResult = {
  label: "positive" | "neutral" | "negative";
  score: number;
};

export function analyzeSentiment(text: string): SentimentResult {
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      label: "neutral",
      score: 0,
    };
  }

  const result = sentiment.analyze(cleanText);

  let label: SentimentResult["label"] = "neutral";

  if (result.comparative > 0.05) {
    label = "positive";
  } else if (result.comparative < -0.05) {
    label = "negative";
  }

  return {
    label,
    score: Number(result.comparative.toFixed(4)),
  };
}
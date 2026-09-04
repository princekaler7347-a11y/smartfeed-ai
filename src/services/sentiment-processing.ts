import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { analyzeSentiment } from "@/services/sentiment-analysis";

export async function processSentimentBatch(limit = 100) {
  const supabase = createSupabaseAdminClient();

  const {
    data: articles,
    error: fetchError,
  } = await supabase
    .from("articles")
    .select("id, title, description")
    .eq("ai_processed", false)
    .limit(limit);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!articles || articles.length === 0) {
    return {
      processed: 0,
      totalFound: 0,
    };
  }

  let processed = 0;

  for (const article of articles) {
    const text =
      `${article.title} ${article.description ?? ""}`.trim();

    const sentiment =
      analyzeSentiment(text);

    const {
      error: updateError,
    } = await supabase
      .from("articles")
      .update({
        sentiment_label:
          sentiment.label,

        sentiment_score:
          sentiment.score,

        ai_processed:
          true,

        ai_processed_at:
          new Date().toISOString(),
      })
      .eq("id", article.id);

    if (updateError) {
      console.error(
        `Failed to process article ${article.id}:`,
        updateError.message
      );

      continue;
    }

    processed++;
  }

  return {
    processed,
    totalFound:
      articles.length,
  };
}

export async function processAllSentiment() {
  let totalProcessed = 0;

  const maxBatches = 20;

  for (
    let batch = 0;
    batch < maxBatches;
    batch++
  ) {
    const result =
      await processSentimentBatch(100);

    totalProcessed +=
      result.processed;

    if (
      result.totalFound === 0 ||
      result.processed === 0
    ) {
      break;
    }
  }

  return {
    processed:
      totalProcessed,
  };
}
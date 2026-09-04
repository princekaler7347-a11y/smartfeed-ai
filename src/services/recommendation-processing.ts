import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { calculateRelevance } from "@/services/relevance-scoring";
import { calculateSemanticSimilarity } from "@/services/semantic-similarity";

export async function processRecommendationsForUser(userId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: preferences, error: preferencesError } =
    await supabase
      .from("user_preferences")
      .select("categories")
      .eq("user_id", userId)
      .single();

  if (preferencesError) {
    throw new Error(preferencesError.message);
  }

  const userCategories = preferences?.categories ?? [];

  const { data: articles, error: articlesError } =
    await supabase
      .from("articles")
      .select("id, title, description")
      .limit(1000);

  if (articlesError) {
    throw new Error(articlesError.message);
  }

  if (!articles || articles.length === 0) {
    return {
      processed: 0,
      totalFound: 0,
      userCategories,
    };
  }

  const now = new Date().toISOString();

  const recommendationRows = articles.map((article) => {
    const relevance = calculateRelevance(
      article.title,
      article.description,
      userCategories
    );

    const similarity = calculateSemanticSimilarity(
      article.title,
      article.description,
      userCategories
    );

    return {
      user_id: userId,
      article_id: article.id,
      relevance_score: relevance.score,
      relevance_reason: relevance.reason,
      similarity_score: similarity.score,
      matched_terms: similarity.matchedTerms,
      updated_at: now,
    };
  });

  const { error: upsertError } =
    await supabase
      .from("user_article_scores")
      .upsert(recommendationRows, {
        onConflict: "user_id,article_id",
      });

  if (upsertError) {
    throw new Error(upsertError.message);
  }

  return {
    processed: recommendationRows.length,
    totalFound: articles.length,
    userCategories,
  };
}
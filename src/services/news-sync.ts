
import {
  fetchNewsByKeyword,
  fetchTopHeadlines,
} from "@/services/news-api";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// --------------------------------------------------
// NEWS CATEGORIES
// --------------------------------------------------

const headlineCategories = [
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
];

const keywordCategories = [
  "politics",
  "finance",
  "gaming",
  "travel",
  "education",
  "environment",
];

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type NewsArticle = {
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
};

type ArticleToSave = {
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  source_name: string;
  category: string;
  published_at: string | null;
  source_type: string;
};

// --------------------------------------------------
// NORMALIZE HEADLINES
// --------------------------------------------------

function normalizeHeadline(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// --------------------------------------------------
// MAIN NEWS SYNC
// --------------------------------------------------

export async function syncNews() {
  const supabase = createSupabaseAdminClient();

  let totalFetched = 0;
  let totalInserted = 0;
  let totalDuplicatesSkipped = 0;

  // --------------------------------------------------
  // LOAD EXISTING HEADLINES
  // --------------------------------------------------

  // Read existing article headlines in batches.
  // This prevents inserting the same headline again
  // when it arrives with a different URL.

  const existingHeadlines = new Set<string>();

  const FETCH_BATCH_SIZE = 500;

  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("articles")
      .select("title")
      .order("id", {
        ascending: true,
      })
      .range(
        offset,
        offset + FETCH_BATCH_SIZE - 1
      );

    if (error) {
      throw new Error(
        `Failed to load existing headlines: ${error.message}`
      );
    }

    const batch = data ?? [];

    for (const article of batch) {
      const headline = normalizeHeadline(
        article.title ?? ""
      );

      if (headline) {
        existingHeadlines.add(headline);
      }
    }

    if (batch.length < FETCH_BATCH_SIZE) {
      break;
    }

    offset += FETCH_BATCH_SIZE;
  }

  // --------------------------------------------------
  // PROCESS AND SAVE A CATEGORY
  // --------------------------------------------------

  async function saveCategory(
    category: string,
    articles: NewsArticle[]
  ) {
    totalFetched += articles.length;

    if (articles.length === 0) {
      return;
    }

    const articlesToSave: ArticleToSave[] = [];

    // Prevent duplicates within the current API
    // response and across different categories.

    for (const article of articles) {
      const headline = normalizeHeadline(
        article.title ?? ""
      );

      if (!headline || !article.url) {
        continue;
      }

      if (existingHeadlines.has(headline)) {
        totalDuplicatesSkipped++;
        continue;
      }

      existingHeadlines.add(headline);

      articlesToSave.push({
        title: article.title,
        description: article.description,
        url: article.url,
        image_url: article.imageUrl,
        source_name: article.sourceName,
        category,
        published_at: article.publishedAt,
        source_type: "api",
      });
    }

    if (articlesToSave.length === 0) {
      return;
    }

    // Keep URL conflict protection as a second
    // layer of duplicate prevention.

    const { data, error } = await supabase
      .from("articles")
      .upsert(articlesToSave, {
        onConflict: "url",
        ignoreDuplicates: true,
      })
      .select("id");

    if (error) {
      throw new Error(
        `Failed to save ${category} articles: ${error.message}`
      );
    }

    totalInserted += data?.length ?? 0;
  }

  // --------------------------------------------------
  // FETCH HEADLINE CATEGORIES
  // --------------------------------------------------

  for (const category of headlineCategories) {
    const articles =
      await fetchTopHeadlines(category);

    await saveCategory(category, articles);
  }

  // --------------------------------------------------
  // FETCH KEYWORD CATEGORIES
  // --------------------------------------------------

  for (const category of keywordCategories) {
    const articles =
      await fetchNewsByKeyword(category);

    await saveCategory(category, articles);
  }

  // --------------------------------------------------
  // RETURN SYNC RESULTS
  // --------------------------------------------------

  return {
    fetched: totalFetched,
    inserted: totalInserted,
    duplicatesSkipped: totalDuplicatesSkipped,
    headlineCategories,
    keywordCategories,
  };
}
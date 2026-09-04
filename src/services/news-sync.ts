import {
    fetchNewsByKeyword,
    fetchTopHeadlines,
  } from "@/services/news-api";
  import { createSupabaseAdminClient } from "@/lib/supabase-admin";
  
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
  
  export async function syncNews() {
    const supabase = createSupabaseAdminClient();
  
    let totalFetched = 0;
    let totalInserted = 0;
  
    // -----------------------------------------
    // HEADLINE CATEGORIES
    // -----------------------------------------
  
    for (const category of headlineCategories) {
      const articles =
        await fetchTopHeadlines(category);
  
      totalFetched += articles.length;
  
      if (articles.length === 0) {
        continue;
      }
  
      const articlesToSave =
        articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image_url: article.imageUrl,
          source_name: article.sourceName,
          category,
          published_at: article.publishedAt,
          source_type: "api",
        }));
  
      const { data, error } =
        await supabase
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
  
    // -----------------------------------------
    // KEYWORD CATEGORIES
    // -----------------------------------------
  
    for (const category of keywordCategories) {
      const articles =
        await fetchNewsByKeyword(category);
  
      totalFetched += articles.length;
  
      if (articles.length === 0) {
        continue;
      }
  
      const articlesToSave =
        articles.map((article) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          image_url: article.imageUrl,
          source_name: article.sourceName,
          category,
          published_at: article.publishedAt,
          source_type: "api",
        }));
  
      const { data, error } =
        await supabase
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
  
    return {
      fetched: totalFetched,
      inserted: totalInserted,
      headlineCategories,
      keywordCategories,
    };
  }
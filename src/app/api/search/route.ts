
import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Verify the logged-in user.

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const query =
      request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        articles: [],
        count: 0,
      });
    }

    if (query.length > 100) {
      return NextResponse.json(
        { error: "Search query is too long." },
        { status: 400 }
      );
    }

    const escapedQuery = query
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_");

    const searchPattern = `%${escapedQuery}%`;

    // Search all visible articles, regardless of
    // the user's selected interest categories.
    // Include both the original publication date
    // and the actual SmartFeed import date.

    const { data: articles, error: searchError } =
      await supabase
        .from("articles")
        .select(
          "id, title, description, url, image_url, source_name, category, published_at, created_at, sentiment_label, sentiment_score"
        )
        .eq("is_hidden", false)
        .or(
          `title.ilike.${searchPattern},description.ilike.${searchPattern}`
        )
        .order("published_at", {
          ascending: false,
        })
        .limit(100);

    if (searchError) {
      console.error("Article search failed:", searchError);

      return NextResponse.json(
        { error: "Unable to search articles." },
        { status: 500 }
      );
    }

    const foundArticles = articles ?? [];

    if (foundArticles.length === 0) {
      return NextResponse.json({
        articles: [],
        count: 0,
      });
    }

    // Retrieve interactions for THIS USER only.

    const articleIds = foundArticles.map(
      (article) => article.id
    );

    const {
      data: interactions,
      error: interactionError,
    } = await supabase
      .from("user_article_interactions")
      .select("article_id, liked, disliked, saved")
      .eq("user_id", user.id)
      .in("article_id", articleIds);

    if (interactionError) {
      console.error(
        "Search interaction lookup failed:",
        interactionError
      );

      return NextResponse.json(
        { error: "Unable to load article interactions." },
        { status: 500 }
      );
    }

    // Match each interaction to its article ID.

    const interactionMap = new Map(
      (interactions ?? []).map((interaction) => [
        interaction.article_id,
        interaction,
      ])
    );

    const articlesWithInteractions =
      foundArticles.map((article) => {
        const interaction = interactionMap.get(
          article.id
        );

        return {
          ...article,
          liked: interaction?.liked ?? false,
          disliked: interaction?.disliked ?? false,
          saved: interaction?.saved ?? false,
        };
      });

    return NextResponse.json({
      articles: articlesWithInteractions,
      count: articlesWithInteractions.length,
    });
  } catch (error) {
    console.error("Global search error:", error);

    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

"use client";

import ArticleCard from "@/components/articles/ArticleCard";

type TodayArticle = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  source_name: string;
  category: string | null;
  published_at: string | null;
  sentiment_label: string | null;
  sentiment_score: number | null;
};

type ArticleInteraction = {
  article_id: number;
  liked: boolean;
  disliked: boolean;
  saved: boolean;
};

type TodayNewsFeedProps = {
  articles: TodayArticle[];
  interactions: ArticleInteraction[];
};

export default function TodayNewsFeed({
  articles,
  interactions,
}: TodayNewsFeedProps) {
  // Match each article with the current user's
  // saved Like, Dislike, and Save preferences.

  const interactionMap = new Map(
    interactions.map((interaction) => [
      interaction.article_id,
      interaction,
    ])
  );

  // --------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------

  if (articles.length === 0) {
    return (
      <div className="glass-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-4xl">📰</div>

        <h2 className="text-xl font-semibold text-white">
          No articles available
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
          No articles are currently available.
          Please check again after the next news update.
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // ARTICLE GRID
  // --------------------------------------------------

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {articles.map((article) => {
        const interaction = interactionMap.get(article.id);

        return (
          <ArticleCard
            key={article.id}
            articleId={article.id}

            // Category-based image fallback
            category={article.category}

            // Article details
            title={article.title}
            description={article.description}
            url={article.url}
            imageUrl={article.image_url}
            sourceName={article.source_name}
            publishedAt={article.published_at}

            // Sentiment analysis
            sentimentLabel={article.sentiment_label}
            sentimentScore={article.sentiment_score}

            // Today's News is not personalized,
            // so recommendation scores are null.
            relevanceScore={null}
            relevanceReason={null}
            similarityScore={null}
            combinedScore={null}
            matchedTerms={[]}

            // Preserve real database interactions.
            initialLiked={interaction?.liked ?? false}
            initialDisliked={interaction?.disliked ?? false}
            initialSaved={interaction?.saved ?? false}
          />
        );
      })}
    </div>
  );
}
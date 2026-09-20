
import Link from "next/link";
import { redirect } from "next/navigation";
import ArticleCard from "@/components/articles/ArticleCard";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SavedArticlesPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load saved interactions and their articles.
  const {
    data: savedInteractions,
    error,
  } = await supabase
    .from("user_article_interactions")
    .select(`
      article_id,
      liked,
      disliked,
      saved,
      articles (
        id,
        title,
        description,
        url,
        image_url,
        source_name,
        category,
        published_at,
        sentiment_label,
        sentiment_score,
        is_hidden
      )
    `)
    .eq("user_id", user.id)
    .eq("saved", true);

  if (error) {
    console.error(
      "Failed to load saved articles:",
      error.message
    );
  }

  // Convert joined results into articles with interaction flags.
  // Hidden articles are excluded.
  const savedArticles =
    savedInteractions
      ?.map((interaction) => {
        const article = Array.isArray(
          interaction.articles
        )
          ? interaction.articles[0]
          : interaction.articles;

        if (!article || article.is_hidden !== false) {
          return null;
        }

        return {
          ...article,
          liked: interaction.liked ?? false,
          disliked: interaction.disliked ?? false,
          saved: interaction.saved ?? false,
        };
      })
      .filter(
        (
          article
        ): article is NonNullable<typeof article> =>
          article !== null
      ) ?? [];

  // Newest saved articles first.
  savedArticles.sort((a, b) => {
    const aTime = a.published_at
      ? new Date(a.published_at).getTime()
      : 0;

    const bTime = b.published_at
      ? new Date(b.published_at).getTime()
      : 0;

    return bTime - aTime;
  });

  return (
    <main className="relative min-h-screen overflow-hidden pb-24">
      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none absolute left-[-120px] top-24 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute right-[-120px] top-[420px] h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="page-container relative py-10 sm:py-12">
        {/* HEADER */}

        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="ai-badge">
              <span>♡</span>
              PERSONAL LIBRARY
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your{" "}
              <span className="gradient-text">
                Saved Articles
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Keep important stories and your private
              notes together in one place.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="secondary-button"
          >
            <span>←</span>
            Back to Dashboard
          </Link>
        </section>

        {/* SUMMARY CARD */}

        <section className="glass-card mt-8 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-xl text-violet-300">
                ♡
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-600">
                  Saved Library
                </p>

                <p className="mt-1 text-2xl font-bold text-white">
                  {savedArticles.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {savedArticles.length === 1
                    ? "article saved"
                    : "articles saved"}
                </p>
              </div>
            </div>

            <p className="max-w-md text-sm leading-6 text-slate-500">
              Your saved articles include the same
              private Notes and Share features as your
              Personalized Dashboard.
            </p>
          </div>
        </section>

        {/* SAVED ARTICLE GRID */}

        <section className="mt-9">
          {savedArticles.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {savedArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  articleId={article.id}
                  category={article.category}
                  title={article.title}
                  description={article.description}
                  url={article.url}
                  imageUrl={article.image_url}
                  sourceName={article.source_name}
                  publishedAt={article.published_at}
                  sentimentLabel={article.sentiment_label}
                  sentimentScore={article.sentiment_score}
                  relevanceScore={null}
                  relevanceReason={null}
                  similarityScore={null}
                  combinedScore={null}
                  matchedTerms={[]}
                  initialLiked={article.liked}
                  initialDisliked={article.disliked}
                  initialSaved={article.saved}
                />
              ))}
            </div>
          ) : (
            /* EMPTY STATE */

            <div className="glass-card flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl text-violet-300">
                ♡
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-white">
                No saved articles yet
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                Save interesting stories from your
                Personalized Dashboard. They will
                appear here with your private notes.
              </p>

              <Link
                href="/dashboard"
                className="primary-button mt-6"
              >
                Browse Articles
                <span>→</span>
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
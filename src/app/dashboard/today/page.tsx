
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import TodayNewsFeed from "@/components/articles/TodayNewsFeed";

export const dynamic = "force-dynamic";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const PAGE_SIZE = 20;

// Supabase queries commonly have a maximum row limit.
// Fetch in batches so we do not silently stop at
// the first batch as the article collection grows.
const FETCH_BATCH_SIZE = 500;

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

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
// PAGE COMPONENT
// --------------------------------------------------

export default async function LatestNewsPage({
  searchParams,
}: PageProps) {
  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------------
  // CHECK ONBOARDING
  // --------------------------------------------------

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if (!preferences?.onboarding_completed) {
    redirect("/preferences");
  }

  // --------------------------------------------------
  // READ REQUESTED PAGE
  // --------------------------------------------------

  const params = await searchParams;

  const requestedPage = Number(params.page ?? "1");

  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  // --------------------------------------------------
  // FETCH ARTICLES IN BATCHES
  // --------------------------------------------------

  const allArticles: TodayArticle[] = [];

  let fetchError: string | null = null;

  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, title, description, url, image_url, source_name, category, published_at, sentiment_label, sentiment_score"
      )
      .eq("is_hidden", false)
      .order("published_at", {
        ascending: false,
        nullsFirst: false,
      })
      .order("id", {
        ascending: false,
      })
      .range(
        offset,
        offset + FETCH_BATCH_SIZE - 1
      );

    if (error) {
      console.error(
        "Failed to load latest news:",
        error.message
      );

      fetchError = error.message;

      break;
    }

    const batch = (data ?? []) as TodayArticle[];

    allArticles.push(...batch);

    // A short batch means there are no more rows.
    if (batch.length < FETCH_BATCH_SIZE) {
      break;
    }

    offset += FETCH_BATCH_SIZE;
  }

  // --------------------------------------------------
  // REMOVE DUPLICATE HEADLINES BEFORE PAGINATION
  // --------------------------------------------------

  // Articles are already sorted newest first.
  // Keep the newest article for each normalized title.
  //
  // No database rows are deleted. The duplicate
  // articles simply do not appear in this feed.

  const seenHeadlines = new Set<string>();

  const uniqueArticles: TodayArticle[] = [];

  if (!fetchError) {
    for (const article of allArticles) {
      const normalizedTitle = normalizeHeadline(
        article.title ?? ""
      );

      // Keep untitled articles separate by ID.
      const headlineKey =
        normalizedTitle || `article-id-${article.id}`;

      if (seenHeadlines.has(headlineKey)) {
        continue;
      }

      seenHeadlines.add(headlineKey);

      uniqueArticles.push(article);
    }
  }

  // --------------------------------------------------
  // PAGINATE UNIQUE ARTICLES
  // --------------------------------------------------

  const total = uniqueArticles.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE)
  );

  // Avoid displaying an empty page when someone
  // manually enters an out-of-range page number.
  const currentPage = Math.min(page, totalPages);

  const from = (currentPage - 1) * PAGE_SIZE;

  const to = from + PAGE_SIZE;

  const availableArticles = uniqueArticles.slice(
    from,
    to
  );

  const hasNextPage = currentPage < totalPages;

  const firstArticleNumber =
    total === 0 ? 0 : from + 1;

  const lastArticleNumber = Math.min(
    from + availableArticles.length,
    total
  );

  // --------------------------------------------------
  // FETCH USER INTERACTIONS FOR CURRENT PAGE ONLY
  // --------------------------------------------------

  const articleIds = availableArticles.map(
    (article) => article.id
  );

  let interactions: ArticleInteraction[] = [];

  if (articleIds.length > 0) {
    const {
      data: interactionData,
      error: interactionError,
    } = await supabase
      .from("user_article_interactions")
      .select("article_id, liked, disliked, saved")
      .eq("user_id", user.id)
      .in("article_id", articleIds);

    if (interactionError) {
      console.error(
        "Failed to load article interactions:",
        interactionError.message
      );
    } else {
      interactions =
        (interactionData ?? []) as ArticleInteraction[];
    }
  }

  // --------------------------------------------------
  // DUPLICATE STATISTICS
  // --------------------------------------------------

  const duplicateCount =
    allArticles.length - uniqueArticles.length;

  // --------------------------------------------------
  // PAGE UI
  // --------------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND EFFECTS */}

      <div className="pointer-events-none absolute left-[-120px] top-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute right-[-100px] top-[420px] h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="page-container relative py-10 sm:py-12">
        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="ai-badge">
              <span>✦</span>
              SMARTFEED AI
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Latest Available News
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Explore the newest available articles
              across all categories, sorted by their
              original publication dates.
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Article availability depends on our
              connected news sources. Publication
              dates are preserved accurately.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="secondary-button"
          >
            ← Personalized Dashboard
          </Link>
        </div>

        {/* NEWS STATISTICS */}

        <section className="glass-card mb-8 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
                Unique Available Articles
              </p>

              <p className="mt-2 text-3xl font-bold text-white">
                {total}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Unique headlines across all categories
              </p>

              {!fetchError && duplicateCount > 0 && (
                <p className="mt-2 text-xs text-violet-300">
                  {duplicateCount} repeated headline
                  {duplicateCount === 1 ? "" : "s"}{" "}
                  hidden from this feed.
                </p>
              )}
            </div>

            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-300">
              Newest first
            </div>
          </div>
        </section>

        {/* ERROR MESSAGE */}

        {fetchError ? (
          <div className="glass-card p-6 text-sm text-red-300">
            Latest news could not be loaded.
            Please refresh the page and try again.
          </div>
        ) : (
          <>
            {/* ARTICLE COUNT */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">
                Latest Stories
              </h2>

              <p className="text-sm text-slate-400">
                Showing {firstArticleNumber}–
                {lastArticleNumber} of {total}
              </p>
            </div>

            {/* ARTICLE CARDS WITH REAL INTERACTIONS */}

            <TodayNewsFeed
              articles={availableArticles}
              interactions={interactions}
            />

            {/* PAGINATION */}

            {total > 0 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                {currentPage > 1 && (
                  <Link
                    href={`/dashboard/today?page=${
                      currentPage - 1
                    }`}
                    className="secondary-button"
                  >
                    ← Previous 20
                  </Link>
                )}

                <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>

                {hasNextPage && (
                  <Link
                    href={`/dashboard/today?page=${
                      currentPage + 1
                    }`}
                    className="primary-button"
                  >
                    Next 20 →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
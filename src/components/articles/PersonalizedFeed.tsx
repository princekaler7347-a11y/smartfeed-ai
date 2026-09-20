
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ArticleCard from "@/components/articles/ArticleCard";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type PersonalizedArticle = {
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
  relevance_score: number | null;
  relevance_reason: string | null;
  similarity_score: number | null;
  combined_score: number | null;
  matched_terms: string[];
  liked: boolean;
  disliked: boolean;
  saved: boolean;
};

type SearchArticle = {
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
  liked: boolean;
  disliked: boolean;
  saved: boolean;
};

type PersonalizedFeedProps = {
  articles: PersonalizedArticle[];
  categories: string[];
};

type SortOption =
  | "smart-shuffle"
  | "latest"
  | "recommended";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const ARTICLES_PER_PAGE = 20;
const MAX_ARTICLES = 100;

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function normalizeHeadline(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function getPublicationTime(
  publishedAt: string | null
): number {
  if (!publishedAt) return 0;

  const timestamp = new Date(publishedAt).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getPublicationWindow(
  publishedAt: string | null
): number {
  const timestamp = getPublicationTime(publishedAt);

  if (timestamp === 0) {
    return -1;
  }

  // Articles published on the same UTC date
  // belong to the same shuffle group.
  return Math.floor(timestamp / ONE_DAY_MS);
}

function convertSearchArticle(
  article: SearchArticle
): PersonalizedArticle {
  return {
    ...article,
    relevance_score: null,
    relevance_reason: null,
    similarity_score: null,
    combined_score: null,
    matched_terms: [],
    liked: article.liked ?? false,
    disliked: article.disliked ?? false,
    saved: article.saved ?? false,
  };
}

function shuffleIds(ids: number[]): number[] {
  const shuffled = [...ids];

  // Fisher–Yates shuffle.
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
}

// --------------------------------------------------
// COMPONENT
// --------------------------------------------------

export default function PersonalizedFeed({
  articles,
  categories,
}: PersonalizedFeedProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  function refreshFeed() {
    startRefresh(() => {
      router.refresh();
    });
  }

  // Search.
  const [search, setSearch] = useState("");

  // Category filter.
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  // Smart Shuffle is the default.
  const [sortBy, setSortBy] =
    useState<SortOption>("smart-shuffle");

  // Random positions generated after page hydration.
  const [shuffleOrder, setShuffleOrder] = useState<
    Map<number, number>
  >(new Map());

  // Pagination.
  const [visibleCount, setVisibleCount] =
    useState(ARTICLES_PER_PAGE);

  // Global search.
  const [globalResults, setGlobalResults] = useState<
    PersonalizedArticle[]
  >([]);

  const [isSearching, setIsSearching] = useState(false);

  const [searchError, setSearchError] = useState("");

  const [completedQuery, setCompletedQuery] = useState("");

  const trimmedSearch = search.trim();

  const isGlobalSearch = trimmedSearch.length >= 2;

  // --------------------------------------------------
  // GENERATE A NEW SHUFFLE ON PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    const ids = articles.map((article) => article.id);

    const shuffledIds = shuffleIds(ids);

    const positions = new Map<number, number>();

    shuffledIds.forEach((id, index) => {
      positions.set(id, index);
    });

    setShuffleOrder(positions);
  }, [articles]);

  // --------------------------------------------------
  // GLOBAL SEARCH API
  // --------------------------------------------------

  useEffect(() => {
    if (trimmedSearch.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmedSearch)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Search failed with status ${response.status}`
          );
        }

        const result: {
          articles?: SearchArticle[];
          error?: string;
        } = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        if (!Array.isArray(result.articles)) {
          throw new Error("Invalid search response.");
        }

        setGlobalResults(
          result.articles.map(convertSearchArticle)
        );

        setCompletedQuery(trimmedSearch);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("Global search failed:", error);

        setGlobalResults([]);
        setCompletedQuery(trimmedSearch);

        setSearchError(
          "Unable to search articles. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedSearch]);

  // --------------------------------------------------
  // CHOOSE NORMAL FEED OR GLOBAL SEARCH
  // --------------------------------------------------

  const sourceArticles = isGlobalSearch
    ? globalResults
    : articles;

  const searchIsPending =
    isGlobalSearch &&
    (isSearching || completedQuery !== trimmedSearch);

  // --------------------------------------------------
  // REMOVE DUPLICATE HEADLINES
  // --------------------------------------------------

  const uniqueArticles = useMemo(() => {
    const articlesByHeadline =
      new Map<string, PersonalizedArticle>();

    for (const article of sourceArticles) {
      const normalizedTitle = normalizeHeadline(
        article.title ?? ""
      );

      if (!normalizedTitle) {
        articlesByHeadline.set(
          `article-id-${article.id}`,
          article
        );

        continue;
      }

      const existingArticle =
        articlesByHeadline.get(normalizedTitle);

      if (!existingArticle) {
        articlesByHeadline.set(
          normalizedTitle,
          article
        );

        continue;
      }

      const currentDate = getPublicationTime(
        article.published_at
      );

      const existingDate = getPublicationTime(
        existingArticle.published_at
      );

      const currentScore =
        article.combined_score ?? 0;

      const existingScore =
        existingArticle.combined_score ?? 0;

      const shouldReplace =
        currentDate > existingDate ||
        (currentDate === existingDate &&
          currentScore > existingScore) ||
        (currentDate === existingDate &&
          currentScore === existingScore &&
          article.id < existingArticle.id);

      if (shouldReplace) {
        articlesByHeadline.set(
          normalizedTitle,
          article
        );
      }
    }

    return Array.from(articlesByHeadline.values());
  }, [sourceArticles]);

  // --------------------------------------------------
  // CATEGORY OPTIONS
  // --------------------------------------------------

  const availableCategories = useMemo(() => {
    const categoryNames = new Map<string, string>();

    for (const category of categories) {
      const normalized = category.trim().toLowerCase();

      if (normalized) {
        categoryNames.set(normalized, category);
      }
    }

    if (isGlobalSearch) {
      for (const article of globalResults) {
        const category = article.category?.trim();

        if (category) {
          categoryNames.set(
            category.toLowerCase(),
            category
          );
        }
      }
    }

    return Array.from(categoryNames.entries()).sort(
      ([first], [second]) =>
        first.localeCompare(second)
    );
  }, [categories, globalResults, isGlobalSearch]);

  // --------------------------------------------------
  // SEARCH AND CATEGORY FILTER
  // --------------------------------------------------

  const matchingArticles = useMemo(() => {
    return uniqueArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" ||
        article.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      // Global search is already filtered by the API.
      if (isGlobalSearch) {
        return matchesCategory;
      }

      const normalizedSearch =
        trimmedSearch.toLowerCase();

      const title =
        article.title?.toLowerCase() ?? "";

      const description =
        article.description?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch === "" ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      return matchesSearch && matchesCategory;
    });
  }, [
    uniqueArticles,
    selectedCategory,
    isGlobalSearch,
    trimmedSearch,
  ]);

  // --------------------------------------------------
  // SORT ARTICLES
  // --------------------------------------------------

  const sortedArticles = useMemo(() => {
    return [...matchingArticles].sort((a, b) => {
      // SMART SHUFFLE:
      // 1. Newer publication dates come first.
      // 2. Shuffle articles within the same UTC date.
      if (
        sortBy === "smart-shuffle" &&
        !isGlobalSearch
      ) {
        const aWindow = getPublicationWindow(
          a.published_at
        );

        const bWindow = getPublicationWindow(
          b.published_at
        );

        // Always prioritize newer publication windows.
        if (aWindow !== bWindow) {
          return bWindow - aWindow;
        }

        // Randomize within the same publication window.
        const aPosition =
          shuffleOrder.get(a.id) ??
          Number.MAX_SAFE_INTEGER;

        const bPosition =
          shuffleOrder.get(b.id) ??
          Number.MAX_SAFE_INTEGER;

        if (aPosition !== bPosition) {
          return aPosition - bPosition;
        }
      }

      // RECOMMENDED:
      // Higher recommendation scores come first.
      if (
        sortBy === "recommended" &&
        !isGlobalSearch
      ) {
        const scoreDifference =
          (b.combined_score ?? 0) -
          (a.combined_score ?? 0);

        if (scoreDifference !== 0) {
          return scoreDifference;
        }
      }

      // LATEST:
      // Strict newest-first sorting.
      // Also used for global search.
      const dateDifference =
        getPublicationTime(b.published_at) -
        getPublicationTime(a.published_at);

      if (dateDifference !== 0) {
        return dateDifference;
      }

      return b.id - a.id;
    });
  }, [
    matchingArticles,
    sortBy,
    isGlobalSearch,
    shuffleOrder,
  ]);

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const availableArticles = useMemo(() => {
    return sortedArticles.slice(0, MAX_ARTICLES);
  }, [sortedArticles]);

  const visibleArticles = useMemo(() => {
    return availableArticles.slice(
      0,
      visibleCount
    );
  }, [availableArticles, visibleCount]);

  // --------------------------------------------------
  // COUNTS
  // --------------------------------------------------

  const totalMatchingCount =
    matchingArticles.length;

  const availableCount =
    availableArticles.length;

  const displayedCount =
    visibleArticles.length;

  const hasMoreArticles =
    displayedCount < availableCount;

  const duplicateCount =
    sourceArticles.length - uniqueArticles.length;

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setVisibleCount(ARTICLES_PER_PAGE);

    setGlobalResults([]);
    setCompletedQuery("");
    setSearchError("");
    setIsSearching(false);
  };

  // --------------------------------------------------
  // LOAD MORE
  // --------------------------------------------------

  const loadMoreArticles = () => {
    setVisibleCount((previous) =>
      Math.min(
        previous + ARTICLES_PER_PAGE,
        MAX_ARTICLES
      )
    );
  };

  // --------------------------------------------------
  // USER INTERFACE
  // --------------------------------------------------

  return (
    <div>
      {/* SEARCH AND FILTER PANEL */}

      <div className="glass-card mb-7 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
          {/* SEARCH */}

          <div className="flex-1">
            <label
              htmlFor="article-search"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Search Articles
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                🔍
              </span>

              <input
                id="article-search"
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisibleCount(ARTICLES_PER_PAGE);
                  setSelectedCategory("all");
                }}
                placeholder="Search all news by title or description..."
                className="smart-input !pl-11"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {isGlobalSearch
                ? "Searching all visible news categories."
                : "Your normal feed follows your selected interests. Type at least 2 characters to search all news."}
            </p>
          </div>

          {/* CATEGORY FILTER */}

          <div className="w-full lg:max-w-[280px]">
            <label
              htmlFor="category-filter"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              Filter by Category
            </label>

            <div className="relative">
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setVisibleCount(ARTICLES_PER_PAGE);
                }}
                className="smart-input cursor-pointer appearance-none pr-10"
              >
                <option
                  value="all"
                  className="bg-slate-950 text-white"
                >
                  All Categories
                </option>

                {availableCategories.map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-slate-950 text-white"
                    >
                      {label}
                    </option>
                  )
                )}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* SORTING OPTIONS */}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <label
            htmlFor="news-sort"
            className="text-sm font-medium text-slate-400"
          >
            Sort articles:
          </label>

          <select
            id="news-sort"
            value={sortBy}
            onChange={(event) => {
              setSortBy(
                event.target.value as SortOption
              );

              setVisibleCount(ARTICLES_PER_PAGE);
            }}
            className="smart-input max-w-[240px]"
          >
            <option
              value="smart-shuffle"
              className="bg-slate-950 text-white"
            >
              Latest-first Smart Shuffle
            </option>

            <option
              value="latest"
              className="bg-slate-950 text-white"
            >
              Latest News
            </option>

            <option
              value="recommended"
              className="bg-slate-950 text-white"
            >
              Recommended for You
            </option>
          </select>

          <button
            type="button"
            onClick={refreshFeed}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet-500/20 disabled:cursor-wait disabled:opacity-60"
            title="Reload articles already stored in SmartFeed AI"
          >
            <span aria-hidden="true">↻</span>
            {isRefreshing ? "Refreshing Feed..." : "Refresh Feed"}
          </button>

          {isGlobalSearch && (
            <span className="text-xs text-slate-500">
              Global results use publication dates.
              Personalized scores are not included.
            </span>
          )}
        </div>

        {/* RESULT INFORMATION */}

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-violet-400" />

            {searchIsPending ? (
              <span>Searching all articles...</span>
            ) : (
              <>
                <span>Showing</span>

                <span className="font-semibold text-slate-300">
                  {displayedCount}
                </span>

                <span>of</span>

                <span className="font-semibold text-slate-300">
                  {totalMatchingCount}
                </span>

                <span>
                  {isGlobalSearch
                    ? "global search results"
                    : "matching personalized articles"}
                </span>
              </>
            )}
          </div>

          {(search !== "" ||
            selectedCategory !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-xs font-medium text-violet-300 transition hover:text-violet-200 sm:text-right"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* DUPLICATE INFORMATION */}

        {duplicateCount > 0 &&
          !searchIsPending && (
            <p className="mt-3 text-xs text-slate-500">
              {duplicateCount} repeated headline
              {duplicateCount === 1 ? "" : "s"}{" "}
              hidden from this feed.
            </p>
          )}

        {/* GLOBAL SEARCH RESULT LIMIT */}

        {isGlobalSearch &&
          !searchIsPending &&
          !searchError &&
          globalResults.length === MAX_ARTICLES && (
            <p className="mt-3 text-xs text-slate-500">
              Showing up to 100 results returned by
              global search.
            </p>
          )}
      </div>

      {/* SEARCH LOADING */}

      {searchIsPending ? (
        <div className="glass-card flex min-h-[220px] items-center justify-center p-8 text-center">
          <p className="text-sm text-slate-300">
            Searching all news articles...
          </p>
        </div>
      ) : searchError ? (
        /* SEARCH ERROR */

        <div className="glass-card flex min-h-[220px] flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-white">
            Search unavailable
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {searchError}
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="secondary-button mt-5"
          >
            Return to Personalized Feed
          </button>
        </div>
      ) : visibleArticles.length > 0 ? (
        /* ARTICLE GRID */

        <div className="grid gap-6 xl:grid-cols-2">
          {visibleArticles.map((article) => (
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
              sentimentLabel={
                article.sentiment_label
              }
              sentimentScore={
                article.sentiment_score
              }
              relevanceScore={
                article.relevance_score
              }
              relevanceReason={
                article.relevance_reason
              }
              similarityScore={
                article.similarity_score
              }
              combinedScore={
                article.combined_score
              }
              matchedTerms={
                article.matched_terms
              }
              initialLiked={article.liked}
              initialDisliked={
                article.disliked
              }
              initialSaved={article.saved}
            />
          ))}
        </div>
      ) : (
        /* EMPTY STATE */

        <div className="glass-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl text-violet-300">
            🔍
          </div>

          <h3 className="mt-5 text-lg font-semibold text-white">
            No matching articles
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            {isGlobalSearch
              ? "No visible articles matched your search and category filter."
              : "We could not find an article matching your current search and category filters."}
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="secondary-button mt-5"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* LOAD MORE */}

      {!searchIsPending &&
        !searchError &&
        hasMoreArticles && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={loadMoreArticles}
              className="primary-button"
            >
              Load 20 More Articles
            </button>

            <p className="text-sm text-slate-500">
              Showing {displayedCount} of{" "}
              {availableCount} available articles
            </p>
          </div>
        )}

      {/* ARTICLE LIMIT MESSAGE */}

      {!searchIsPending &&
        !searchError &&
        !hasMoreArticles &&
        displayedCount === MAX_ARTICLES &&
        totalMatchingCount > MAX_ARTICLES && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              You have reached the maximum of
              100 displayed articles.
            </p>
          </div>
        )}
    </div>
  );
}
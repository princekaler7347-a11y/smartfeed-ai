"use client";

import { useMemo, useState } from "react";

import ArticleCard from "@/components/articles/ArticleCard";

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

type PersonalizedFeedProps = {
  articles: PersonalizedArticle[];
  categories: string[];
};

export default function PersonalizedFeed({
  articles,
  categories,
}: PersonalizedFeedProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");

  const filteredArticles = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const matchingArticles = articles.filter((article) => {
      const title =
        article.title?.toLowerCase() ?? "";

      const description =
        article.description?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch === "" ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        article.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    // Keep the dashboard clean:
    // show only the top 20 matches for the active filter.
    return matchingArticles.slice(0, 20);
  }, [articles, search, selectedCategory]);

  const totalMatchingCount = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return articles.filter((article) => {
      const title =
        article.title?.toLowerCase() ?? "";

      const description =
        article.description?.toLowerCase() ?? "";

      const matchesSearch =
        normalizedSearch === "" ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "all" ||
        article.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    }).length;
  }, [articles, search, selectedCategory]);

  return (
    <div>
      {/* SEARCH + FILTER PANEL */}

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
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M20 20L16.5 16.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <input
                id="article-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search by title or description..."
                className="smart-input !pl-11"
              />
            </div>
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
                onChange={(event) =>
                  setSelectedCategory(event.target.value)
                }
                className="
                  smart-input
                  cursor-pointer
                  appearance-none
                  pr-10
                "
              >
                <option
                  value="all"
                  className="bg-slate-950 text-white"
                >
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category.toLowerCase()}
                    className="bg-slate-950 text-white"
                  >
                    {category}
                  </option>
                ))}
              </select>

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* RESULT INFO */}

        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 rounded-full bg-violet-400" />

            Showing{" "}

            <span className="font-semibold text-slate-300">
              {filteredArticles.length}
            </span>

            {" "}of{" "}

            <span className="font-semibold text-slate-300">
              {totalMatchingCount}
            </span>

            {" "}matching articles
          </div>

          {(search !== "" ||
            selectedCategory !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="text-left text-xs font-medium text-violet-300 transition hover:text-violet-200 sm:text-right"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ARTICLE GRID */}

      {filteredArticles.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              articleId={article.id}
              title={article.title}
              description={article.description}
              url={article.url}
              imageUrl={article.image_url}
              sourceName={article.source_name}
              publishedAt={article.published_at}
              sentimentLabel={article.sentiment_label}
              sentimentScore={article.sentiment_score}
              relevanceScore={article.relevance_score}
              relevanceReason={article.relevance_reason}
              similarityScore={article.similarity_score}
              combinedScore={article.combined_score}
              matchedTerms={article.matched_terms}
              initialLiked={article.liked}
              initialDisliked={article.disliked}
              initialSaved={article.saved}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card flex min-h-[280px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
                stroke="currentColor"
                strokeWidth="1.8"
              />

              <path
                d="M20 20L16.5 16.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h3 className="mt-5 text-lg font-semibold text-white">
            No matching articles
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            We could not find an article matching your
            current search and category filters.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
            }}
            className="secondary-button mt-5"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
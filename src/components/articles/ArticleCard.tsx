
"use client";

import { useState } from "react";
import ArticleNotes from "@/components/articles/ArticleNotes";
import ArticleShare from "@/components/articles/ArticleShare";
import ArticleReport from "@/components/articles/ArticleReport";

type ArticleCardProps = {
  articleId: number;
  category?: string | null;
  title: string;
  description: string | null;
  url: string;
  imageUrl: string | null;
  sourceName: string;
  publishedAt: string | null;
  createdAt?: string | null;
  sentimentLabel: string | null;
  sentimentScore: number | null;
  relevanceScore: number | null;
  relevanceReason: string | null;
  similarityScore?: number | null;
  combinedScore?: number | null;
  matchedTerms?: string[];
  initialLiked?: boolean;
  initialDisliked?: boolean;
  initialSaved?: boolean;
};

type InteractionAction = "like" | "dislike" | "save";

type FallbackDesign = {
  label: string;
  icon: string;
  gradient: string;
  iconColor: string;
  iconBackground: string;
};

function getFallbackDesign(
  category?: string | null
): FallbackDesign {
  const normalized =
    category?.trim().toLowerCase() ?? "";

  const designs: Record<string, FallbackDesign> = {
    technology: {
      label: "TECHNOLOGY",
      icon: "⌘",
      gradient:
        "from-blue-950 via-indigo-950 to-slate-900",
      iconColor: "text-blue-300",
      iconBackground:
        "border-blue-400/25 bg-blue-500/15",
    },

    business: {
      label: "BUSINESS",
      icon: "▥",
      gradient:
        "from-emerald-950 via-teal-950 to-slate-900",
      iconColor: "text-emerald-300",
      iconBackground:
        "border-emerald-400/25 bg-emerald-500/15",
    },

    finance: {
      label: "FINANCE",
      icon: "₹",
      gradient:
        "from-emerald-950 via-green-950 to-slate-900",
      iconColor: "text-green-300",
      iconBackground:
        "border-green-400/25 bg-green-500/15",
    },

    science: {
      label: "SCIENCE",
      icon: "⚛",
      gradient:
        "from-cyan-950 via-blue-950 to-slate-900",
      iconColor: "text-cyan-300",
      iconBackground:
        "border-cyan-400/25 bg-cyan-500/15",
    },

    sports: {
      label: "SPORTS",
      icon: "★",
      gradient:
        "from-orange-950 via-red-950 to-slate-900",
      iconColor: "text-orange-300",
      iconBackground:
        "border-orange-400/25 bg-orange-500/15",
    },

    entertainment: {
      label: "ENTERTAINMENT",
      icon: "♫",
      gradient:
        "from-fuchsia-950 via-purple-950 to-slate-900",
      iconColor: "text-fuchsia-300",
      iconBackground:
        "border-fuchsia-400/25 bg-fuchsia-500/15",
    },

    health: {
      label: "HEALTH",
      icon: "+",
      gradient:
        "from-rose-950 via-red-950 to-slate-900",
      iconColor: "text-rose-300",
      iconBackground:
        "border-rose-400/25 bg-rose-500/15",
    },

    politics: {
      label: "POLITICS",
      icon: "▤",
      gradient:
        "from-indigo-950 via-violet-950 to-slate-900",
      iconColor: "text-indigo-300",
      iconBackground:
        "border-indigo-400/25 bg-indigo-500/15",
    },

    gaming: {
      label: "GAMING",
      icon: "✦",
      gradient:
        "from-purple-950 via-violet-950 to-slate-900",
      iconColor: "text-purple-300",
      iconBackground:
        "border-purple-400/25 bg-purple-500/15",
    },

    travel: {
      label: "TRAVEL",
      icon: "✈",
      gradient:
        "from-sky-950 via-blue-950 to-slate-900",
      iconColor: "text-sky-300",
      iconBackground:
        "border-sky-400/25 bg-sky-500/15",
    },

    education: {
      label: "EDUCATION",
      icon: "▣",
      gradient:
        "from-amber-950 via-orange-950 to-slate-900",
      iconColor: "text-amber-300",
      iconBackground:
        "border-amber-400/25 bg-amber-500/15",
    },

    environment: {
      label: "ENVIRONMENT",
      icon: "❀",
      gradient:
        "from-green-950 via-emerald-950 to-slate-900",
      iconColor: "text-green-300",
      iconBackground:
        "border-green-400/25 bg-green-500/15",
    },
  };

  return (
    designs[normalized] ?? {
      label: normalized
        ? normalized.toUpperCase()
        : "SMARTFEED AI",
      icon: "◈",
      gradient:
        "from-violet-950 via-indigo-950 to-slate-900",
      iconColor: "text-violet-300",
      iconBackground:
        "border-violet-400/25 bg-violet-500/15",
    }
  );
}

// --------------------------------------------------
// SAFE DATE FORMATTING
// --------------------------------------------------

function formatArticleDate(
  value: string | null | undefined
): string | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// --------------------------------------------------
// ARTICLE CARD
// --------------------------------------------------

export default function ArticleCard({
  articleId,
  category,
  title,
  description,
  url,
  imageUrl,
  sourceName,
  publishedAt,
  createdAt = null,
  sentimentLabel,
  sentimentScore,
  relevanceScore,
  relevanceReason,
  similarityScore,
  combinedScore,
  matchedTerms = [],
  initialLiked = false,
  initialDisliked = false,
  initialSaved = false,
}: ArticleCardProps) {
  // INTERACTION STATES

  const [liked, setLiked] =
    useState(initialLiked);

  const [disliked, setDisliked] =
    useState(initialDisliked);

  const [saved, setSaved] =
    useState(initialSaved);

  const [loadingAction, setLoadingAction] =
    useState<InteractionAction | null>(null);

  // IMAGE FALLBACK

  const [imageFailed, setImageFailed] =
    useState(false);

  const fallback = getFallbackDesign(category);

  // FORMATTED DATES

  const formattedPublishedDate =
    formatArticleDate(publishedAt);

  const formattedCreatedDate =
    formatArticleDate(createdAt);

  // RECOMMENDATION SCORES

  const relevancePercent =
    relevanceScore !== null &&
    relevanceScore !== undefined
      ? Math.round(relevanceScore * 100)
      : null;

  const similarityPercent =
    similarityScore !== null &&
    similarityScore !== undefined
      ? Math.round(similarityScore * 100)
      : null;

  const combinedPercent =
    combinedScore !== null &&
    combinedScore !== undefined
      ? Math.round(combinedScore * 100)
      : null;

  // SENTIMENT STYLES

  function getSentimentStyles() {
    const normalized =
      sentimentLabel?.toLowerCase();

    if (normalized === "positive") {
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    }

    if (normalized === "negative") {
      return "border-red-400/20 bg-red-500/10 text-red-300";
    }

    return "border-slate-400/20 bg-slate-500/10 text-slate-300";
  }

  // LIKE / DISLIKE / SAVE

  async function handleInteraction(
    action: InteractionAction
  ) {
    if (loadingAction !== null) return;

    try {
      setLoadingAction(action);

      const response = await fetch(
        "/api/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId,
            action,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(
          result.message ||
            "Failed to update interaction."
        );

        return;
      }

      setLiked(result.interaction.liked);
      setDisliked(result.interaction.disliked);
      setSaved(result.interaction.saved);
    } catch (error) {
      console.error(
        "Interaction failed:",
        error
      );
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_24px_75px_rgba(0,0,0,0.32)]">
      {/* ARTICLE IMAGE */}

      {imageUrl && !imageFailed ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            onError={() =>
              setImageFailed(true)
            }
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />

          {combinedPercent !== null && (
            <div className="absolute right-4 top-4 rounded-full border border-violet-300/20 bg-[#080c17]/80 px-3 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-xl">
              {combinedPercent}% Match
            </div>
          )}
        </div>
      ) : (
        /* CATEGORY FALLBACK */

        <div
          className={`relative flex h-56 w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br ${fallback.gradient}`}
        >
          <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full border border-white/10" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[60px]" />

          <div
            className={`relative flex h-20 w-20 items-center justify-center rounded-3xl border text-4xl font-bold shadow-xl backdrop-blur-xl ${fallback.iconBackground} ${fallback.iconColor}`}
          >
            {fallback.icon}
          </div>

          <p className="relative mt-4 text-[11px] font-bold uppercase tracking-[0.3em] text-white/70">
            {fallback.label}
          </p>

          <p className="relative mt-1 text-[10px] tracking-wide text-white/35">
            SMARTFEED AI
          </p>

          {combinedPercent !== null && (
            <div className="absolute right-4 top-4 rounded-full border border-violet-300/20 bg-[#080c17]/80 px-3 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-xl">
              {combinedPercent}% Match
            </div>
          )}
        </div>
      )}

      {/* ARTICLE CONTENT */}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* SOURCE AND DATES */}

        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-violet-300">
            {sourceName}
          </p>

          {formattedCreatedDate && (
            <p className="text-emerald-300">
              Added to SmartFeed: {formattedCreatedDate}
            </p>
          )}

          {formattedPublishedDate && (
            <p className="text-slate-500">
              Originally published: {formattedPublishedDate}
            </p>
          )}
        </div>

        {/* SENTIMENT AND RECOMMENDATION TAGS */}

        <div className="mt-4 flex flex-wrap gap-2">
          {sentimentLabel && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getSentimentStyles()}`}
            >
              {sentimentLabel}

              {sentimentScore !== null &&
                sentimentScore !== undefined && (
                  <span className="opacity-70">
                    {sentimentScore}
                  </span>
                )}
            </span>
          )}

          {relevancePercent !== null && (
            <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">
              Relevance {relevancePercent}%
            </span>
          )}

          {similarityPercent !== null && (
            <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-300">
              Similarity {similarityPercent}%
            </span>
          )}
        </div>

        {/* TITLE */}

        <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-slate-100 transition-colors group-hover:text-white">
          {title}
        </h2>

        {/* DESCRIPTION */}

        {description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        {/* RECOMMENDATION DETAILS */}

        <div className="mt-5 space-y-3">
          {relevanceReason && (
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[10px] text-violet-300">
                  ✦
                </span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    Why recommended
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {relevanceReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MATCHED TERMS */}

          {matchedTerms.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                Matched terms
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {matchedTerms
                  .slice(0, 6)
                  .map((term) => (
                    <span
                      key={term}
                      className="rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1 text-[10px] text-slate-400"
                    >
                      {term}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* RECOMMENDATION SCORES */}

        {(relevancePercent !== null ||
          similarityPercent !== null ||
          combinedPercent !== null) && (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {/* RELEVANCE */}

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Relevance
              </p>

              <p className="mt-1 text-sm font-semibold text-violet-300">
                {relevancePercent ?? "—"}
                {relevancePercent !== null &&
                  "%"}
              </p>
            </div>

            {/* SIMILARITY */}

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Similarity
              </p>

              <p className="mt-1 text-sm font-semibold text-blue-300">
                {similarityPercent ?? "—"}
                {similarityPercent !== null &&
                  "%"}
              </p>
            </div>

            {/* FINAL SCORE */}

            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <p className="text-[9px] uppercase tracking-wide text-slate-600">
                Final
              </p>

              <p className="mt-1 text-sm font-semibold text-emerald-300">
                {combinedPercent ?? "—"}
                {combinedPercent !== null &&
                  "%"}
              </p>
            </div>
          </div>
        )}

        {/* FLEX SPACER */}

        <div className="flex-1" />

        {/* INTERACTION BUTTONS */}

        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
          {/* LIKE */}

          <button
            type="button"
            onClick={() =>
              handleInteraction("like")
            }
            disabled={loadingAction !== null}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              liked
                ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
            }`}
          >
            👍 {liked ? "Liked" : "Like"}
          </button>

          {/* DISLIKE */}

          <button
            type="button"
            onClick={() =>
              handleInteraction("dislike")
            }
            disabled={loadingAction !== null}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              disliked
                ? "border-red-400/30 bg-red-500/15 text-red-200"
                : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
            }`}
          >
            👎 {disliked
              ? "Disliked"
              : "Dislike"}
          </button>

          {/* SAVE */}

          <button
            type="button"
            onClick={() =>
              handleInteraction("save")
            }
            disabled={loadingAction !== null}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
              saved
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-emerald-400/25 hover:bg-emerald-500/10 hover:text-emerald-200"
            }`}
          >
            🔖 {saved ? "Saved" : "Save"}
          </button>

          {/* SHARE MENU */}

          <ArticleShare
            title={title}
            url={url}
          />

          {/* REPORT ARTICLE */}

          <ArticleReport articleId={articleId} />

          {/* READ ARTICLE */}

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]"
          >
            Read Article →
          </a>
        </div>

        {/* PERSONAL PRIVATE NOTES */}

        <ArticleNotes articleId={articleId} />

        {/* INTERACTION LOADING STATUS */}

        {loadingAction && (
          <p className="mt-3 text-[10px] text-slate-600">
            Updating your preference...
          </p>
        )}
      </div>
    </article>
  );
}
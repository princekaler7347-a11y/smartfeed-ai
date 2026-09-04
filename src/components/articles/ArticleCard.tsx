"use client";

import { useState } from "react";

type ArticleCardProps = {
  articleId: number;

  title: string;

  description: string | null;

  url: string;

  imageUrl: string | null;

  sourceName: string;

  publishedAt: string | null;

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

export default function ArticleCard({
  articleId,
  title,
  description,
  url,
  imageUrl,
  sourceName,
  publishedAt,
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
  const [liked, setLiked] =
    useState(initialLiked);

  const [disliked, setDisliked] =
    useState(initialDisliked);

  const [saved, setSaved] =
    useState(initialSaved);

  const [loadingAction, setLoadingAction] =
    useState<InteractionAction | null>(
      null
    );

  const formattedDate = publishedAt
    ? new Date(
        publishedAt
      ).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      )
    : null;

  const relevancePercent =
    relevanceScore !== null &&
    relevanceScore !== undefined
      ? Math.round(
          relevanceScore * 100
        )
      : null;

  const similarityPercent =
    similarityScore !== null &&
    similarityScore !== undefined
      ? Math.round(
          similarityScore * 100
        )
      : null;

  const combinedPercent =
    combinedScore !== null &&
    combinedScore !== undefined
      ? Math.round(
          combinedScore * 100
        )
      : null;

  function getSentimentStyles() {
    const normalized =
      sentimentLabel?.toLowerCase();

    if (normalized === "positive") {
      return {
        badge:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        dot: "bg-emerald-400",
      };
    }

    if (normalized === "negative") {
      return {
        badge:
          "border-red-400/20 bg-red-500/10 text-red-300",
        dot: "bg-red-400",
      };
    }

    return {
      badge:
        "border-slate-400/20 bg-slate-500/10 text-slate-300",
      dot: "bg-slate-400",
    };
  }

  const sentimentStyles =
    getSentimentStyles();

  async function handleInteraction(
    action: InteractionAction
  ) {
    try {
      setLoadingAction(action);

      const response = await fetch(
        "/api/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            articleId,
            action,
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        console.error(
          result.message ||
            "Failed to update interaction."
        );

        return;
      }

      setLiked(
        result.interaction.liked
      );

      setDisliked(
        result.interaction.disliked
      );

      setSaved(
        result.interaction.saved
      );
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
    <article
      className="
        group relative
        flex h-full
        flex-col
        overflow-hidden
        rounded-[1.4rem]
        border border-white/10
        bg-slate-900/60
        shadow-[0_20px_60px_rgba(0,0,0,0.22)]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-violet-400/30
        hover:shadow-[0_24px_75px_rgba(0,0,0,0.32)]
      "
    >
      {/* IMAGE */}
      {imageUrl ? (
        <div className="relative h-56 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="
              h-full w-full
              object-cover
              transition-transform
              duration-500
              group-hover:scale-[1.04]
            "
          />

          <div
            className="
              pointer-events-none
              absolute inset-0
              bg-gradient-to-t
              from-[#0b1120]
              via-transparent
              to-transparent
            "
          />

          {/* Recommendation badge over image */}
          {combinedPercent !== null && (
            <div
              className="
                absolute
                right-4 top-4
                rounded-full
                border
                border-violet-300/20
                bg-[#080c17]/80
                px-3 py-1.5
                text-xs
                font-semibold
                text-violet-200
                backdrop-blur-xl
              "
            >
              {combinedPercent}% Match
            </div>
          )}
        </div>
      ) : (
        <div
          className="
            relative flex
            h-40 w-full
            items-center
            justify-center
            overflow-hidden
            bg-gradient-to-br
            from-violet-600/15
            via-indigo-600/10
            to-blue-600/15
          "
        >
          <div
            className="
              absolute h-32 w-32
              rounded-full
              bg-violet-500/10
              blur-[55px]
            "
          />

          <div
            className="
              relative flex
              h-16 w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-violet-400/20
              bg-violet-500/10
              text-2xl
              text-violet-300
            "
          >
            ◈
          </div>

          {combinedPercent !== null && (
            <div
              className="
                absolute
                right-4 top-4
                rounded-full
                border
                border-violet-300/20
                bg-[#080c17]/80
                px-3 py-1.5
                text-xs
                font-semibold
                text-violet-200
              "
            >
              {combinedPercent}% Match
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* SOURCE + DATE */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className="
              font-semibold
              text-violet-300
            "
          >
            {sourceName}
          </span>

          {formattedDate && (
            <>
              <span className="text-slate-700">
                •
              </span>

              <span className="text-slate-500">
                {formattedDate}
              </span>
            </>
          )}
        </div>

        {/* TAGS */}
        <div className="mt-4 flex flex-wrap gap-2">
          {sentimentLabel && (
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                ${sentimentStyles.badge}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${sentimentStyles.dot}`}
              />

              {sentimentLabel}

              {sentimentScore !== null &&
                sentimentScore !==
                  undefined && (
                  <span className="opacity-70">
                    {` ${sentimentScore}`}
                  </span>
                )}
            </span>
          )}

          {relevancePercent !== null && (
            <span
              className="
                rounded-full
                border
                border-violet-400/20
                bg-violet-500/10
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-violet-300
              "
            >
              Relevance{" "}
              {relevancePercent}%
            </span>
          )}

          {similarityPercent !== null && (
            <span
              className="
                rounded-full
                border
                border-blue-400/20
                bg-blue-500/10
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-blue-300
              "
            >
              Similarity{" "}
              {similarityPercent}%
            </span>
          )}
        </div>

        {/* TITLE */}
        <h2
          className="
            mt-4
            text-xl
            font-semibold
            leading-snug
            tracking-tight
            text-slate-100
            transition-colors
            group-hover:text-white
          "
        >
          {title}
        </h2>

        {/* DESCRIPTION */}
        {description && (
          <p
            className="
              mt-3
              line-clamp-3
              text-sm
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>
        )}

        {/* RECOMMENDATION DETAILS */}
        <div className="mt-5 space-y-3">
          {relevanceReason && (
            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                p-3.5
              "
            >
              <div className="flex gap-2.5">
                <span
                  className="
                    mt-0.5
                    flex h-5 w-5
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-violet-500/10
                    text-[10px]
                    text-violet-300
                  "
                >
                  ✦
                </span>

                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.12em]
                      text-slate-600
                    "
                  >
                    Why recommended
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-400
                    "
                  >
                    {relevanceReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {matchedTerms.length > 0 && (
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-slate-600
                "
              >
                Matched terms
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {matchedTerms
                  .slice(0, 6)
                  .map((term) => (
                    <span
                      key={term}
                      className="
                        rounded-lg
                        border
                        border-white/10
                        bg-white/[0.035]
                        px-2
                        py-1
                        text-[10px]
                        text-slate-400
                      "
                    >
                      {term}
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* SCORE AREA */}
        {(relevancePercent !== null ||
          similarityPercent !== null ||
          combinedPercent !== null) && (
          <div
            className="
              mt-5
              grid
              grid-cols-3
              gap-2
            "
          >
            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                p-3
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-slate-600
                "
              >
                Relevance
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-violet-300
                "
              >
                {relevancePercent ??
                  "—"}
                {relevancePercent !==
                  null && "%"}
              </p>
            </div>

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                p-3
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-slate-600
                "
              >
                Similarity
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-blue-300
                "
              >
                {similarityPercent ??
                  "—"}
                {similarityPercent !==
                  null && "%"}
              </p>
            </div>

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.025]
                p-3
              "
            >
              <p
                className="
                  text-[9px]
                  uppercase
                  tracking-wide
                  text-slate-600
                "
              >
                Final
              </p>

              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-emerald-300
                "
              >
                {combinedPercent ??
                  "—"}
                {combinedPercent !==
                  null && "%"}
              </p>
            </div>
          </div>
        )}

        {/* FLEX SPACER */}
        <div className="flex-1" />

        {/* INTERACTION BUTTONS */}
        <div
          className="
            mt-6
            flex
            flex-wrap
            gap-2
            border-t
            border-white/10
            pt-5
          "
        >
          <button
            type="button"
            onClick={() =>
              handleInteraction(
                "like"
              )
            }
            disabled={
              loadingAction !== null
            }
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-3
              py-2
              text-xs
              font-medium
              transition-all
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                liked
                  ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-violet-400/25 hover:bg-violet-500/10 hover:text-violet-200"
              }
            `}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 10V21H4C2.9 21 2 20.1 2 19V12C2 10.9 2.9 10 4 10H7ZM7 10L11 3C11.7 1.8 13.5 2.3 13.5 3.7V8H19C20.8 8 22.1 9.7 21.6 11.4L19.4 19C19.1 20.2 18 21 16.8 21H7V10Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>

            {liked ? "Liked" : "Like"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleInteraction(
                "dislike"
              )
            }
            disabled={
              loadingAction !== null
            }
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-3
              py-2
              text-xs
              font-medium
              transition-all
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                disliked
                  ? "border-red-400/30 bg-red-500/15 text-red-200"
                  : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-red-400/25 hover:bg-red-500/10 hover:text-red-200"
              }
            `}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M7 14V3H4C2.9 3 2 3.9 2 5V12C2 13.1 2.9 14 4 14H7ZM7 14L11 21C11.7 22.2 13.5 21.7 13.5 20.3V16H19C20.8 16 22.1 14.3 21.6 12.6L19.4 5C19.1 3.8 18 3 16.8 3H7V14Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>

            {disliked
              ? "Disliked"
              : "Dislike"}
          </button>

          <button
            type="button"
            onClick={() =>
              handleInteraction(
                "save"
              )
            }
            disabled={
              loadingAction !== null
            }
            className={`
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              px-3
              py-2
              text-xs
              font-medium
              transition-all
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                saved
                  ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/[0.025] text-slate-400 hover:border-emerald-400/25 hover:bg-emerald-500/10 hover:text-emerald-200"
              }
            `}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            >
              <path
                d="M6 4C6 2.9 6.9 2 8 2H16C17.1 2 18 2.9 18 4V21L12 17L6 21V4Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
            </svg>

            {saved ? "Saved" : "Save"}
          </button>

          {/* READ ARTICLE */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              ml-auto
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-violet-600
              to-blue-600
              px-3.5
              py-2
              text-xs
              font-semibold
              text-white
              shadow-[0_8px_24px_rgba(124,58,237,0.2)]
              transition-all
              hover:-translate-y-0.5
              hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]
            "
          >
            Read Article

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M5 12H19M13 6L19 12L13 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* LOADING STATUS */}
        {loadingAction && (
          <p
            className="
              mt-3
              text-[10px]
              text-slate-600
            "
          >
            Updating your preference...
          </p>
        )}
      </div>
    </article>
  );
}
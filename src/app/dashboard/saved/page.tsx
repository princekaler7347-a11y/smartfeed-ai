import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SavedArticlesPage() {
  const supabase =
    await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: savedInteractions,
    error,
  } = await supabase
    .from(
      "user_article_interactions"
    )
    .select(`
      article_id,
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
        sentiment_label
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

  const savedArticles =
    savedInteractions
      ?.map((interaction) => {
        const article =
          Array.isArray(
            interaction.articles
          )
            ? interaction.articles[0]
            : interaction.articles;

        return article ?? null;
      })
      .filter(
        (
          article
        ): article is NonNullable<
          typeof article
        > => article !== null
      ) ?? [];

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
              Keep important stories in one
              place and return to them whenever
              you want.
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
              Articles you save from your
              personalized dashboard appear
              here automatically.
            </p>
          </div>
        </section>

        {/* SAVED ARTICLE GRID */}
        <section className="mt-9">
          {savedArticles.length > 0 ? (
            <div className="grid gap-6 xl:grid-cols-2">
              {savedArticles.map(
                (article) => {
                  const formattedDate =
                    article.published_at
                      ? new Date(
                          article.published_at
                        ).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : null;

                  const sentiment =
                    article.sentiment_label?.toLowerCase();

                  const sentimentClass =
                    sentiment === "positive"
                      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                      : sentiment ===
                        "negative"
                      ? "border-red-400/20 bg-red-500/10 text-red-300"
                      : "border-slate-400/20 bg-slate-500/10 text-slate-300";

                  return (
                    <article
                      key={article.id}
                      className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-white/10 bg-slate-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-[0_24px_75px_rgba(0,0,0,0.32)]"
                    >
                      {/* IMAGE */}
                      {article.image_url ? (
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={
                              article.image_url
                            }
                            alt={
                              article.title
                            }
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          />

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1120] via-transparent to-transparent" />

                          <div className="absolute right-4 top-4 rounded-full border border-violet-300/20 bg-[#080c17]/80 px-3 py-1.5 text-xs font-semibold text-violet-200 backdrop-blur-xl">
                            Saved
                          </div>
                        </div>
                      ) : (
                        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-blue-600/15">
                          <div className="absolute h-32 w-32 rounded-full bg-violet-500/10 blur-[55px]" />

                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-2xl text-violet-300">
                            ◈
                          </div>

                          <div className="absolute right-4 top-4 rounded-full border border-violet-300/20 bg-[#080c17]/80 px-3 py-1.5 text-xs font-semibold text-violet-200">
                            Saved
                          </div>
                        </div>
                      )}

                      {/* CONTENT */}
                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-violet-300">
                            {
                              article.source_name
                            }
                          </span>

                          {article.category && (
                            <>
                              <span className="text-slate-700">
                                •
                              </span>

                              <span className="capitalize text-slate-500">
                                {
                                  article.category
                                }
                              </span>
                            </>
                          )}
                        </div>

                        {/* SENTIMENT */}
                        {article.sentiment_label && (
                          <div className="mt-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${sentimentClass}`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />

                              {
                                article.sentiment_label
                              }
                            </span>
                          </div>
                        )}

                        {/* TITLE */}
                        <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-slate-100 transition-colors group-hover:text-white">
                          {article.title}
                        </h2>

                        {/* DESCRIPTION */}
                        {article.description && (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                            {
                              article.description
                            }
                          </p>
                        )}

                        {/* DATE */}
                        {formattedDate && (
                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="3"
                                y="5"
                                width="18"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.7"
                              />

                              <path
                                d="M8 3V7M16 3V7M3 10H21"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinecap="round"
                              />
                            </svg>

                            {formattedDate}
                          </div>
                        )}

                        <div className="flex-1" />

                        {/* FOOTER */}
                        <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                          <div className="inline-flex items-center gap-2 text-xs text-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            In your library
                          </div>

                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(124,58,237,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(124,58,237,0.35)]"
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
                      </div>
                    </article>
                  );
                }
              )}
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
                Save interesting stories from
                your personalized dashboard and
                they will appear here for easy
                access later.
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
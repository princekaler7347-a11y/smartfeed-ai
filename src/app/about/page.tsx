import type { Metadata } from "next";

import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME}, its personalization pipeline, technology stack, and development architecture.`,
};

const TECH_STACK = [
  {
    name: "Next.js",
    short: "NX",
    role: "Full-stack React framework used for the application interface, routing, server components, and API routes.",
  },
  {
    name: "TypeScript",
    short: "TS",
    role: "Provides static typing and helps reduce development errors across the application.",
  },
  {
    name: "Tailwind CSS",
    short: "TW",
    role: "Utility-first CSS framework used to build the responsive SmartFeed AI interface.",
  },
  {
    name: "Supabase",
    short: "SB",
    role: "Provides PostgreSQL database services, authentication, sessions, and Row Level Security.",
  },
  {
    name: "NewsAPI",
    short: "NA",
    role: "External news source used to retrieve real article data for the content ingestion pipeline.",
  },
  {
    name: "Sentiment",
    short: "NLP",
    role: "Lexicon-based NLP analysis used to classify article sentiment as positive, neutral, or negative.",
  },
  {
    name: "Natural",
    short: "NLP",
    role: "Used for text tokenization and cosine-based lexical similarity calculations.",
  },
  {
    name: "Vercel",
    short: "VL",
    role: "Planned production deployment platform for the Next.js application.",
  },
] as const;

const PIPELINE_STEPS = [
  {
    number: "01",
    title: "Content Ingestion",
    description:
      "News articles are retrieved from NewsAPI and stored in the Supabase PostgreSQL database.",
  },
  {
    number: "02",
    title: "Sentiment Analysis",
    description:
      "Article text is processed using lexicon-based sentiment analysis to identify its overall sentiment.",
  },
  {
    number: "03",
    title: "Relevance Scoring",
    description:
      "Article text is compared with the user's selected interests to calculate an interest-based relevance score.",
  },
  {
    number: "04",
    title: "Text Similarity",
    description:
      "Tokenized article content and user interests are compared using cosine text similarity.",
  },
  {
    number: "05",
    title: "Behavior Adjustment",
    description:
      "Likes, dislikes, saves, and category interaction history contribute additional ranking adjustments.",
  },
  {
    number: "06",
    title: "Personalized Ranking",
    description:
      "The calculated signals are combined and the highest-ranked articles are displayed in the user's feed.",
  },
] as const;

const PROJECT_FEATURES = [
  {
    icon: "◈",
    title: "Real News Content",
    description:
      "Articles are retrieved from a real external news API instead of using static demonstration data.",
  },
  {
    icon: "✦",
    title: "Personalized Recommendations",
    description:
      "Every authenticated user receives recommendations based on their selected interests and article interactions.",
  },
  {
    icon: "⌁",
    title: "NLP Processing",
    description:
      "The system performs sentiment analysis and text processing before articles are ranked.",
  },
  {
    icon: "↗",
    title: "Behavior-Aware Ranking",
    description:
      "Likes, dislikes, saves, and category-level interaction history influence recommendation scores.",
  },
  {
    icon: "♡",
    title: "Saved Article Library",
    description:
      "Users can save useful articles and access them later through a dedicated personal library.",
  },
  {
    icon: "◎",
    title: "Secure User Accounts",
    description:
      "Supabase Authentication and database access policies are used to separate user-specific data.",
  },
] as const;

const COMPLETED_PHASES = [
  {
    phase: "Phase 1",
    title: "Project Foundation",
    description:
      "Next.js project structure, TypeScript, Tailwind CSS, responsive layout, and application architecture.",
  },
  {
    phase: "Phase 2",
    title: "Database & Authentication",
    description:
      "Supabase authentication, user profiles, preferences, database tables, sessions, and Row Level Security.",
  },
  {
    phase: "Phase 3",
    title: "User Preferences",
    description:
      "Interest onboarding with twelve categories and a minimum selection requirement.",
  },
  {
    phase: "Phase 4",
    title: "News Processing Pipeline",
    description:
      "Real article ingestion through NewsAPI with database storage and sentiment processing.",
  },
  {
    phase: "Phase 5",
    title: "Recommendation System",
    description:
      "Interest relevance, cosine text similarity, behavioral signals, interaction tracking, and personalized ranking.",
  },
  {
    phase: "Phase 6",
    title: "Interface & Deployment Preparation",
    description:
      "Professional UI redesign, project testing, production review, and deployment preparation.",
  },
] as const;

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute left-[-160px] top-32 h-[480px] w-[480px] rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="pointer-events-none absolute right-[-140px] top-[650px] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

      <div className="pointer-events-none absolute inset-0 background-grid opacity-[0.14]" />

      <div className="page-container relative">
        {/* =====================================
            HERO
        ===================================== */}

        <section className="py-20 text-center sm:py-24">
          <div className="ai-badge">
            <span>✦</span>
            ABOUT THE PROJECT
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
            Intelligent content curation
            built around{" "}
            <span className="gradient-text">
              each user.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-400 sm:text-lg">
            {APP_NAME} is a BCA minor project
            titled{" "}
            <span className="font-medium text-slate-200">
              AI-Powered Content Curation System
            </span>
            . It collects real news content,
            analyzes article text, and ranks
            stories according to user interests
            and interaction behavior.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="primary-button"
            >
              Explore SmartFeed
              <span>→</span>
            </Link>

            <Link
              href="/dashboard"
              className="secondary-button"
            >
              Open Dashboard
            </Link>
          </div>
        </section>

        {/* =====================================
            PROJECT OVERVIEW
        ===================================== */}

        <section className="pb-20">
          <div className="glass-card relative overflow-hidden p-7 sm:p-9 lg:p-10">
            <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />

            <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="ai-badge">
                  PROJECT OBJECTIVE
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                  Reducing information overload
                  through personalization.
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Modern users are exposed to a
                  very large amount of online
                  content. SmartFeed AI attempts
                  to make that content easier to
                  explore by selecting and
                  ordering articles according to
                  topics the user has chosen.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  The recommendation process also
                  considers article relevance,
                  cosine-based text similarity,
                  and interaction signals such as
                  likes, dislikes, and saved
                  articles.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                    Recommendation Base
                  </p>

                  <p className="mt-4 text-3xl font-bold text-white">
                    70%
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Interest relevance
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-300">
                    Similarity Base
                  </p>

                  <p className="mt-4 text-3xl font-bold text-white">
                    30%
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Cosine text similarity
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    Personalization
                  </p>

                  <p className="mt-4 text-xl font-bold text-white">
                    Behavior Signals
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Likes, dislikes and saved
                    articles modify ranking.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-300">
                    User Interests
                  </p>

                  <p className="mt-4 text-3xl font-bold text-white">
                    12
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Available categories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            FEATURES
        ===================================== */}

        <section className="pb-20">
          <div className="text-center">
            <div className="ai-badge">
              SYSTEM FEATURES
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              What SmartFeed AI{" "}
              <span className="gradient-text">
                currently does.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              These are implemented parts of the
              current application rather than
              planned or demonstration-only
              features.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROJECT_FEATURES.map(
              (feature) => (
                <article
                  key={feature.title}
                  className="glass-card hover-card p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-lg text-violet-300">
                    {feature.icon}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        {/* =====================================
            PIPELINE
        ===================================== */}

        <section className="pb-20">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <div className="ai-badge">
                PROCESSING PIPELINE
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white">
                How a story becomes a
                recommendation.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                SmartFeed uses a multi-stage
                processing pipeline rather than
                showing raw news articles
                directly.
              </p>

              <div className="mt-7 rounded-2xl border border-violet-400/15 bg-violet-500/[0.06] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                  Important
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The current similarity
                  implementation is lexical
                  cosine text similarity. It
                  does not use neural embeddings
                  or a generative AI model.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {PIPELINE_STEPS.map(
                (step) => (
                  <article
                    key={step.number}
                    className="group flex gap-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-violet-400/25 hover:bg-slate-900/70"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600/20 to-blue-600/20 text-xs font-bold text-violet-200">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-200">
                        {step.title}
                      </h3>

                      <p className="mt-1.5 text-sm leading-6 text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            TECH STACK
        ===================================== */}

        <section className="pb-20">
          <div className="text-center">
            <div className="ai-badge">
              TECHNOLOGY STACK
            </div>

            <h2 className="mt-5 text-3xl font-bold text-white sm:text-4xl">
              Technologies behind{" "}
              <span className="gradient-text">
                SmartFeed AI
              </span>
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((item) => (
              <article
                key={item.name}
                className="glass-card hover-card p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-xs font-bold text-blue-300">
                  {item.short}
                </div>

                <h3 className="mt-4 font-semibold text-white">
                  {item.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.role}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================
            DEVELOPMENT ROADMAP
        ===================================== */}

        <section className="pb-20">
          <div className="glass-card p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="ai-badge">
                  DEVELOPMENT ROADMAP
                </div>

                <h2 className="mt-5 text-3xl font-bold text-white">
                  Project development
                  progress
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  The core application is
                  implemented. The project is
                  currently being prepared for
                  final testing and deployment.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Core System Complete
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {COMPLETED_PHASES.map(
                (item, index) => (
                  <article
                    key={item.phase}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-300">
                        {item.phase}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          index ===
                          COMPLETED_PHASES.length -
                            1
                            ? "border-blue-400/20 bg-blue-500/10 text-blue-300"
                            : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        }`}
                      >
                        {index ===
                        COMPLETED_PHASES.length -
                          1
                          ? "IN PROGRESS"
                          : "COMPLETED"}
                      </span>
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-200">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            ACADEMIC NOTE
        ===================================== */}

        <section className="pb-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/15 via-slate-950/80 to-blue-600/10 p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[100px]" />

            <div className="relative">
              <div className="ai-badge">
                BCA MINOR PROJECT
              </div>

              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold text-white sm:text-4xl">
                Built as a practical
                full-stack content curation
                system.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400">
                The project demonstrates
                database design,
                authentication, API
                integration, NLP processing,
                recommendation logic,
                personalization, secure
                user-specific data, and modern
                frontend development in one
                application.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  href="/register"
                  className="primary-button"
                >
                  Get Started
                  <span>→</span>
                </Link>

                <Link
                  href="/"
                  className="secondary-button"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
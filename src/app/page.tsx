import Link from "next/link";

const features = [
  {
    title: "Personalized Feed",
    description:
      "Your feed is ranked using selected interests, relevance scoring, similarity, and interaction history.",
    icon: "✦",
  },
  {
    title: "Sentiment Analysis",
    description:
      "Articles are automatically analyzed as positive, neutral, or negative using NLP-based sentiment scoring.",
    icon: "◌",
  },
  {
    title: "Smart Recommendations",
    description:
      "Relevant stories are ranked using multiple signals instead of showing the same feed to every user.",
    icon: "⌁",
  },
  {
    title: "Behavior-Aware Ranking",
    description:
      "Likes, dislikes, and saves influence category-level recommendation adjustments over time.",
    icon: "↗",
  },
];

const categories = [
  "Technology",
  "Business",
  "Sports",
  "Science",
  "Health",
  "Entertainment",
  "Politics",
  "Education",
  "Finance",
  "Gaming",
  "Travel",
  "Environment",
];

const workflow = [
  {
    number: "01",
    title: "Content Ingestion",
    description:
      "Real articles are collected from permitted news sources through APIs.",
  },
  {
    number: "02",
    title: "NLP Analysis",
    description:
      "Each article is processed for sentiment and text-based similarity signals.",
  },
  {
    number: "03",
    title: "Personalized Ranking",
    description:
      "Interest relevance, similarity, and interaction behavior are combined into recommendation scores.",
  },
  {
    number: "04",
    title: "Your Smart Feed",
    description:
      "The highest-ranked articles are delivered through your personalized dashboard.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* HERO */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 background-grid opacity-40" />

        <div className="pointer-events-none absolute left-[8%] top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="pointer-events-none absolute right-[8%] top-32 h-80 w-80 rounded-full bg-blue-600/15 blur-[130px]" />

        <div className="page-container relative grid min-h-[760px] items-center gap-16 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          {/* HERO LEFT */}
          <div className="max-w-3xl">
            <div className="ai-badge mb-6">
              <span className="text-violet-300">✦</span>
              AI-POWERED CONTENT CURATION
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              News that learns
              <br />
              what{" "}
              <span className="gradient-text">
                matters to you.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              SmartFeed AI transforms real news into a
              personalized reading experience using NLP,
              relevance scoring, sentiment analysis, and
              interaction-aware recommendations.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="primary-button px-6 py-3.5"
              >
                Start Your Smart Feed
                <span>→</span>
              </Link>

              <Link
                href="#features"
                className="secondary-button px-6 py-3.5"
              >
                Explore Features
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Real news sources
              </span>

              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                Personalized ranking
              </span>

              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Secure user profiles
              </span>
            </div>
          </div>

          {/* HERO DASHBOARD PREVIEW */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="pointer-events-none absolute inset-10 rounded-full bg-violet-600/20 blur-[90px]" />

            <div className="glass-card soft-glow relative overflow-hidden border-violet-400/20 p-4 sm:p-5">
              {/* WINDOW BAR */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                </div>

                <span className="text-xs font-medium text-slate-500">
                  SMARTFEED DASHBOARD
                </span>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                    Your Smart Feed
                  </p>

                  <h3 className="mt-1 text-xl font-semibold text-white">
                    Recommended for you
                  </h3>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Interests
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-200">
                    Tech • Business • Science
                  </p>
                </div>
              </div>

              {/* ARTICLE 1 */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-violet-400/30 hover:bg-white/[0.06]">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20">
                    <span className="text-2xl">◈</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-1 text-[10px] font-medium text-violet-300">
                        TECHNOLOGY
                      </span>

                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-300">
                        POSITIVE
                      </span>
                    </div>

                    <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-100">
                      New technology breakthrough reshapes the
                      future of intelligent digital services
                    </h4>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Smart ranking
                      </span>

                      <span className="text-sm font-semibold text-violet-300">
                        94% Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ARTICLE 2 */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-blue-400/30 hover:bg-white/[0.06]">
                <div className="flex items-start gap-4">
                  <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <span className="text-2xl">⌁</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-300">
                        SCIENCE
                      </span>

                      <span className="rounded-full border border-slate-400/20 bg-slate-500/10 px-2 py-1 text-[10px] font-medium text-slate-300">
                        NEUTRAL
                      </span>
                    </div>

                    <h4 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-slate-100">
                      Researchers publish major findings with
                      broad implications for future innovation
                    </h4>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Personalized
                      </span>

                      <span className="text-sm font-semibold text-blue-300">
                        87% Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCORE STRIP */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Articles
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    415+
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Categories
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    12
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Ranking
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    Smart
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section
        id="features"
        className="border-y border-white/10 bg-white/[0.015]"
      >
        <div className="page-container grid gap-px md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group border-white/10 px-6 py-8 xl:border-r xl:last:border-r-0"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-lg text-violet-300 transition group-hover:scale-105 group-hover:bg-violet-500/15">
                {feature.icon}
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {feature.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-space relative">
        <div className="page-container">
          <div className="mx-auto max-w-2xl text-center">
            <div className="ai-badge">
              <span>⌁</span>
              INTELLIGENT PIPELINE
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From raw news to your
              <span className="gradient-text">
                {" "}personalized feed
              </span>
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              SmartFeed AI automatically transforms incoming
              content into ranked recommendations through a
              structured processing pipeline.
            </p>
          </div>

          <div className="relative mt-14 grid gap-5 lg:grid-cols-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-[38px] hidden h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent lg:block" />

            {workflow.map((step) => (
              <div
                key={step.number}
                className="glass-card hover-card relative p-6"
              >
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-600/20 to-blue-600/20 text-sm font-bold text-violet-300">
                  {step.number}
                </div>

                <h3 className="mt-6 text-lg font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-white/10 bg-white/[0.015] py-24">
        <div className="page-container">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <div className="ai-badge">
                12 CURATED CATEGORIES
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Follow what you
                <span className="gradient-text">
                  {" "}actually care about.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
                Choose your interests during onboarding and
                SmartFeed AI uses them as the foundation for
                content relevance and recommendation scoring.
              </p>

              <Link
                href="/register"
                className="primary-button mt-7"
              >
                Choose Your Interests
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((category, index) => (
                <div
                  key={category}
                  className="glass-card hover-card flex min-h-[92px] items-center gap-3 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-violet-300">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <span className="text-sm font-medium text-slate-200">
                    {category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERSONALIZATION SECTION */}
      <section className="section-space">
        <div className="page-container">
          <div className="glass-card relative overflow-hidden border-violet-400/20 px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]" />

            <div className="pointer-events-none absolute -bottom-20 left-20 h-64 w-64 rounded-full bg-blue-600/15 blur-[100px]" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <div className="ai-badge">
                  PERSONALIZATION ENGINE
                </div>

                <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Your interactions help shape a
                  <span className="gradient-text">
                    {" "}better-ranked feed.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">
                  Likes, dislikes, saved articles, selected
                  interests, relevance scoring, and text
                  similarity work together to influence which
                  stories appear first.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Like", "+0.10 direct boost"],
                  ["Save", "+0.08 direct boost"],
                  ["Dislike", "−0.20 adjustment"],
                  ["Category behavior", "Adaptive affinity"],
                ].map(([title, detail]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <p className="text-sm font-semibold text-white">
                      {title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH */}
      <section className="pb-24">
        <div className="page-container">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">
              BUILT WITH MODERN TECHNOLOGY
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              {[
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Supabase",
                "NewsAPI",
                "NLP",
                "Cosine Similarity",
              ].map((tech) => (
                <span
                  key={tech}
                  className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-sm font-medium text-slate-400"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-28">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-[2rem] border border-violet-400/20 bg-gradient-to-br from-violet-600/10 via-[#101624] to-blue-600/10 px-6 py-16 text-center shadow-[0_30px_100px_rgba(0,0,0,0.4)] sm:px-10">
            <div className="pointer-events-none absolute left-1/2 top-0 h-44 w-[500px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative">
              <div className="ai-badge">
                YOUR NEWS. YOUR INTERESTS.
              </div>

              <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Stop scrolling through noise.
                <br />
                <span className="gradient-text">
                  Build your SmartFeed.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
                Create an account, select your interests, and
                experience personalized content ranking.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="primary-button px-7 py-3.5"
                >
                  Get Started Free
                  <span>→</span>
                </Link>

                <Link
                  href="/about"
                  className="secondary-button px-7 py-3.5"
                >
                  About the Project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
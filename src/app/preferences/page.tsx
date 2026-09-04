"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

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

const categoryDetails: Record<
  string,
  {
    icon: string;
    description: string;
  }
> = {
  Technology: {
    icon: "⌘",
    description: "Software, AI, devices and digital innovation",
  },
  Business: {
    icon: "↗",
    description: "Companies, startups, markets and industry",
  },
  Sports: {
    icon: "◉",
    description: "Matches, athletes, tournaments and results",
  },
  Science: {
    icon: "⌁",
    description: "Research, discovery and scientific progress",
  },
  Health: {
    icon: "✚",
    description: "Health news, wellness and medical updates",
  },
  Entertainment: {
    icon: "▶",
    description: "Movies, music, celebrities and media",
  },
  Politics: {
    icon: "◆",
    description: "Government, policy and political developments",
  },
  Education: {
    icon: "▣",
    description: "Learning, institutions and academic updates",
  },
  Finance: {
    icon: "₹",
    description: "Markets, money, banking and finance",
  },
  Gaming: {
    icon: "✦",
    description: "Games, releases, esports and industry news",
  },
  Travel: {
    icon: "⌖",
    description: "Destinations, tourism and travel updates",
  },
  Environment: {
    icon: "♧",
    description: "Climate, sustainability and environment",
  },
};

export default function PreferencesPage() {
  const router = useRouter();

  const [supabase] = useState(() =>
    createSupabaseBrowserClient()
  );

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<string[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    async function loadPreferences() {
      const {
        data: { user },
      } =
        await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } =
        await supabase
          .from("user_preferences")
          .select("categories")
          .eq("user_id", user.id)
          .single();

      if (error) {
        setMessage(
          "Unable to load your preferences."
        );

        setLoading(false);
        return;
      }

      setSelectedCategories(
        data?.categories ?? []
      );

      setLoading(false);
    }

    loadPreferences();
  }, [router, supabase]);

  function toggleCategory(
    category: string
  ) {
    setSelectedCategories(
      (current) =>
        current.includes(category)
          ? current.filter(
              (item) =>
                item !== category
            )
          : [...current, category]
    );

    setMessage("");
  }

  async function savePreferences() {
    if (
      selectedCategories.length < 3
    ) {
      setMessage(
        "Please select at least 3 interests."
      );

      return;
    }

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { error } =
      await supabase
        .from("user_preferences")
        .update({
          categories:
            selectedCategories,
          onboarding_completed: true,
          updated_at:
            new Date().toISOString(),
        })
        .eq("user_id", user.id);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        "/api/relevance/process",
        {
          method: "POST",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        setMessage(
          result.message ||
            "Preferences saved, but relevance scores could not be updated."
        );

        setSaving(false);
        return;
      }
    } catch {
      setMessage(
        "Preferences saved, but relevance scores could not be updated."
      );

      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[110px]" />

        <div className="relative text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-300/30 border-t-violet-300" />
          </div>

          <p className="mt-5 text-sm font-medium text-slate-300">
            Loading your preferences
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Preparing your interest profile...
          </p>
        </div>
      </main>
    );
  }

  const minimumReached =
    selectedCategories.length >= 3;

  return (
    <main className="relative min-h-screen overflow-hidden pb-24">
      {/* Background effects */}
      <div className="pointer-events-none absolute left-[-120px] top-16 h-96 w-96 rounded-full bg-violet-600/12 blur-[130px]" />

      <div className="pointer-events-none absolute right-[-100px] top-[380px] h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute inset-0 background-grid opacity-20" />

      <div className="page-container relative py-12 sm:py-16">
        {/* ======================================
            PAGE HEADER
        ====================================== */}

        <section className="mx-auto max-w-3xl text-center">
          <div className="ai-badge">
            <span>✦</span>
            PERSONALIZE YOUR EXPERIENCE
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
            Choose what{" "}
            <span className="gradient-text">
              matters to you.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Select at least 3 interests.
            SmartFeed AI uses these
            categories as the starting point
            for relevance scoring and your
            personalized news feed.
          </p>
        </section>

        {/* ======================================
            PROGRESS PANEL
        ====================================== */}

        <section className="glass-card mx-auto mt-9 max-w-4xl p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                Interest Profile
              </p>

              <div className="mt-2 flex items-end gap-2">
                <span className="text-3xl font-bold text-white">
                  {
                    selectedCategories.length
                  }
                </span>

                <span className="pb-1 text-sm text-slate-500">
                  selected
                </span>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
                minimumReached
                  ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-400/20 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  minimumReached
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />

              {minimumReached
                ? "Minimum selection complete"
                : `${
                    3 -
                    selectedCategories.length
                  } more needed`}
            </div>
          </div>

          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  (selectedCategories.length /
                    3) *
                    100
                )}%`,
              }}
            />
          </div>
        </section>

        {/* ======================================
            CATEGORY GRID
        ====================================== */}

        <section className="mx-auto mt-8 max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map(
              (category) => {
                const selected =
                  selectedCategories.includes(
                    category
                  );

                const details =
                  categoryDetails[
                    category
                  ];

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      toggleCategory(
                        category
                      )
                    }
                    className={`
                      group
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      p-5
                      text-left
                      transition-all
                      duration-300
                      ${
                        selected
                          ? "border-violet-400/45 bg-gradient-to-br from-violet-600/15 via-slate-900/80 to-blue-600/10 shadow-[0_16px_45px_rgba(124,58,237,0.16)]"
                          : "border-white/10 bg-slate-900/55 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-slate-900/75"
                      }
                    `}
                  >
                    {selected && (
                      <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-violet-500/15 blur-[45px]" />
                    )}

                    <div className="relative flex items-start justify-between gap-4">
                      <div
                        className={`
                          flex h-11 w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          border
                          text-lg
                          transition-all
                          ${
                            selected
                              ? "border-violet-400/30 bg-violet-500/15 text-violet-200"
                              : "border-white/10 bg-white/[0.035] text-slate-500 group-hover:text-violet-300"
                          }
                        `}
                      >
                        {details?.icon ??
                          "✦"}
                      </div>

                      <div
                        className={`
                          flex h-6 w-6
                          items-center
                          justify-center
                          rounded-full
                          border
                          transition-all
                          ${
                            selected
                              ? "border-violet-400 bg-violet-500 text-white"
                              : "border-white/15 bg-white/[0.025] text-transparent"
                          }
                        `}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12.5L9.2 16.5L19 7"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="relative mt-5">
                      <h2
                        className={`text-base font-semibold ${
                          selected
                            ? "text-white"
                            : "text-slate-200"
                        }`}
                      >
                        {category}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {
                          details?.description
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* ======================================
            SELECTION SUMMARY
        ====================================== */}

        {selectedCategories.length >
          0 && (
          <section className="glass-card mx-auto mt-8 max-w-5xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Your selected interests
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  You can change these
                  anytime from your
                  dashboard.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(
                  (category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() =>
                        toggleCategory(
                          category
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-200 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
                    >
                      {category}

                      <span className="text-sm opacity-60">
                        ×
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* ======================================
            MESSAGE
        ====================================== */}

        {message && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-center text-sm text-red-300">
            {message}
          </div>
        )}

        {/* ======================================
            SAVE AREA
        ====================================== */}

        <section className="mx-auto mt-8 max-w-5xl">
          <div className="glass-card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-violet-600/15 blur-[90px]" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-violet-300">
                  Recommendation Profile
                </p>

                <h2 className="mt-2 text-xl font-semibold text-white">
                  Ready to personalize
                  your feed?
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Saving your interests
                  updates your preference
                  profile and recalculates
                  relevance scores for your
                  recommendations.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  savePreferences
                }
                disabled={saving}
                className={`
                  inline-flex
                  min-w-[220px]
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    saving
                      ? "cursor-not-allowed border border-white/10 bg-white/[0.05] text-slate-500"
                      : minimumReached
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_12px_35px_rgba(124,58,237,0.28)] hover:-translate-y-0.5 hover:shadow-[0_16px_45px_rgba(124,58,237,0.38)]"
                      : "border border-white/10 bg-white/[0.035] text-slate-500 hover:border-violet-400/20"
                  }
                `}
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                    Updating Recommendations...
                  </>
                ) : (
                  <>
                    Save Preferences

                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
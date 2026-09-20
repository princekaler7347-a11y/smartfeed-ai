
import PersonalizedFeed from "@/components/articles/PersonalizedFeed";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import LogoutButton from "@/components/auth/LogoutButton";

import {
  calculateCategoryBehaviorScores,
  getCategoryBehaviorAdjustment,
} from "@/services/behavioral-scoring";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // --------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // --------------------------------------------
  // USER PROFILE
  // --------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // --------------------------------------------
  // USER PREFERENCES
  // --------------------------------------------

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("categories, onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if (!preferences?.onboarding_completed) {
    redirect("/preferences");
  }

  const userCategories: string[] =
    preferences.categories?.map((category: string) =>
      category.toLowerCase()
    ) ?? [];

  // --------------------------------------------
  // FETCH PERSONALIZED ARTICLES
  // --------------------------------------------

  let articlesQuery = supabase
    .from("articles")
    .select(
      "id, title, description, url, image_url, source_name, category, published_at, sentiment_label, sentiment_score"
    )
    .eq("is_hidden", false)
    .order("published_at", {
      ascending: false,
    })
    .limit(1000);

  if (userCategories.length > 0) {
    articlesQuery = articlesQuery.in(
      "category",
      userCategories
    );
  }

  const {
    data: articles,
    error: articlesError,
  } = await articlesQuery;

  if (articlesError) {
    console.error(
      "Failed to load personalized articles:",
      articlesError.message
    );
  }

  // --------------------------------------------
  // RELEVANCE AND SIMILARITY SCORES
  // --------------------------------------------

  const {
    data: relevanceScores,
    error: relevanceError,
  } = await supabase
    .from("user_article_scores")
    .select(
      "article_id, relevance_score, relevance_reason, similarity_score, matched_terms"
    )
    .eq("user_id", user.id);

  if (relevanceError) {
    console.error(
      "Failed to load recommendation scores:",
      relevanceError.message
    );
  }

  // --------------------------------------------
  // USER INTERACTIONS
  // --------------------------------------------

  const {
    data: interactions,
    error: interactionsError,
  } = await supabase
    .from("user_article_interactions")
    .select(`
      article_id,
      liked,
      disliked,
      saved,
      articles (
        category
      )
    `)
    .eq("user_id", user.id);

  if (interactionsError) {
    console.error(
      "Failed to load user interactions:",
      interactionsError.message
    );
  }

  // --------------------------------------------
  // SCORE LOOKUP
  // --------------------------------------------

  const scoreMap = new Map(
    relevanceScores?.map((score) => [
      score.article_id,
      {
        relevanceScore: score.relevance_score,
        relevanceReason: score.relevance_reason,
        similarityScore: score.similarity_score,
        matchedTerms: score.matched_terms,
      },
    ]) ?? []
  );

  // --------------------------------------------
  // INTERACTION LOOKUP
  // --------------------------------------------

  const interactionMap = new Map(
    interactions?.map((interaction) => [
      interaction.article_id,
      {
        liked: interaction.liked,
        disliked: interaction.disliked,
        saved: interaction.saved,
      },
    ]) ?? []
  );

  // --------------------------------------------
  // BEHAVIORAL HISTORY
  // --------------------------------------------

  const behavioralHistory =
    interactions?.map((interaction) => {
      const relatedArticle = Array.isArray(
        interaction.articles
      )
        ? interaction.articles[0]
        : interaction.articles;

      return {
        category: relatedArticle?.category ?? null,
        liked: interaction.liked,
        disliked: interaction.disliked,
        saved: interaction.saved,
      };
    }) ?? [];

  const categoryBehaviorScores =
    calculateCategoryBehaviorScores(
      behavioralHistory
    );

  // --------------------------------------------
  // BUILD PERSONALIZED FEED
  // --------------------------------------------

  const personalizedArticles =
    articles
      ?.map((article) => {
        const scoreData = scoreMap.get(article.id);

        const interactionData = interactionMap.get(
          article.id
        );

        const relevanceScore =
          scoreData?.relevanceScore ?? 0;

        const similarityScore =
          scoreData?.similarityScore ?? 0;

        // 70% relevance + 30% similarity

        const baseRecommendationScore =
          relevanceScore * 0.7 +
          similarityScore * 0.3;

        // Category behavior

        const categoryBehaviorAdjustment =
          getCategoryBehaviorAdjustment(
            article.category,
            categoryBehaviorScores
          );

        // Direct interactions

        const likeBoost = interactionData?.liked
          ? 0.1
          : 0;

        const dislikePenalty =
          interactionData?.disliked ? 0.2 : 0;

        const saveBoost = interactionData?.saved
          ? 0.08
          : 0;

        // Final recommendation score

        const combinedScore = Number(
          Math.max(
            0,
            Math.min(
              1,
              baseRecommendationScore +
                categoryBehaviorAdjustment +
                likeBoost -
                dislikePenalty +
                saveBoost
            )
          ).toFixed(4)
        );

        return {
          ...article,

          relevance_score: relevanceScore,

          relevance_reason:
            scoreData?.relevanceReason ??
            "No relevance score available.",

          similarity_score: similarityScore,

          matched_terms:
            scoreData?.matchedTerms ?? [],

          category_behavior_adjustment:
            categoryBehaviorAdjustment,

          combined_score: combinedScore,

          liked: interactionData?.liked ?? false,

          disliked:
            interactionData?.disliked ?? false,

          saved: interactionData?.saved ?? false,
        };
      })

      .sort((a, b) => {
        if (
          b.combined_score !== a.combined_score
        ) {
          return (
            b.combined_score - a.combined_score
          );
        }

        const dateA = a.published_at
          ? new Date(a.published_at).getTime()
          : 0;

        const dateB = b.published_at
          ? new Date(b.published_at).getTime()
          : 0;

        return dateB - dateA;
      }) ?? [];

  // --------------------------------------------
  // DASHBOARD STATISTICS
  // --------------------------------------------

  const likedCount =
    interactions?.filter(
      (interaction) => interaction.liked
    ).length ?? 0;

  const savedCount =
    interactions?.filter(
      (interaction) => interaction.saved
    ).length ?? 0;

  const interestCount =
    preferences.categories?.length ?? 0;

  // --------------------------------------------
  // DASHBOARD UI
  // --------------------------------------------

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background effects */}

      <div className="pointer-events-none absolute left-[-120px] top-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[130px]" />

      <div className="pointer-events-none absolute right-[-100px] top-[420px] h-96 w-96 rounded-full bg-blue-600/10 blur-[130px]" />

      <div className="page-container relative py-10 sm:py-12">

        {/* ====================================
            WELCOME SECTION
        ==================================== */}

        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="ai-badge">
              <span>✦</span>
              PERSONALIZED INTELLIGENCE
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome back,{" "}

              <span className="gradient-text">
                {profile?.full_name ??
                  user.email?.split("@")[0] ??
                  "Reader"}
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Your personalized news dashboard uses
              your interests, relevance scoring,
              cosine text similarity, and interaction
              history.
            </p>
          </div>

          {/* NAVIGATION BUTTONS */}

          <div className="flex flex-wrap gap-3">

            <Link
              href="/preferences"
              className="secondary-button"
            >
              <span>⚙</span>
              Edit Interests
            </Link>

            <Link
              href="/dashboard/saved"
              className="primary-button"
            >
              <span>♡</span>
              Saved Articles
            </Link>

            {/* NEW: TODAY'S NEWS BUTTON */}

            <Link
              href="/dashboard/today"
              className="secondary-button"
            >
              <span>📰</span>
              Latest Available News
            </Link>

          </div>
        </section>

        {/* ====================================
            DASHBOARD STATISTICS
        ==================================== */}

        <section className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* RECOMMENDATIONS */}

          <div className="glass-card hover-card p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                ◈
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Feed
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {Math.min(
                personalizedArticles.length,
                100
              )}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Available recommendations
            </p>

          </div>

          {/* INTERESTS */}

          <div className="glass-card hover-card p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
                ✦
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Profile
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {interestCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Selected interests
            </p>

          </div>

          {/* LIKED ARTICLES */}

          <div className="glass-card hover-card p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                ↑
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Behavior
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {likedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Liked articles
            </p>

          </div>

          {/* SAVED ARTICLES */}

          <div className="glass-card hover-card p-5">

            <div className="flex items-center justify-between">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                ♡
              </div>

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                Library
              </span>

            </div>

            <p className="mt-5 text-3xl font-bold text-white">
              {savedCount}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Saved articles
            </p>

          </div>

        </section>

        {/* ====================================
            INTEREST PROFILE
        ==================================== */}

        <section className="glass-card relative mt-6 overflow-hidden p-6 sm:p-7">

          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-600/10 blur-[70px]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white">
                ✦
              </div>

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Your Interest Profile
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  These interests form the foundation
                  of your recommendations.
                </p>

              </div>

            </div>

            <Link
              href="/preferences"
              className="text-sm font-medium text-violet-300 transition hover:text-violet-200"
            >
              Manage interests →
            </Link>

          </div>

          <div className="relative mt-6 flex flex-wrap gap-2.5">

            {preferences.categories?.map(
              (category: string) => (
                <span
                  key={category}
                  className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3.5 py-1.5 text-xs font-medium text-violet-200"
                >
                  {category}
                </span>
              )
            )}

          </div>

        </section>

        {/* ====================================
            PERSONALIZED NEWS FEED
        ==================================== */}

        <section className="mt-12">

          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />

                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Personalized Feed
                </span>

              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Recommended for you
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Explore news using relevance,
                similarity, category behavior, and
                your article interactions. Select
                Latest News to see newer stories first.
              </p>

            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-slate-500">

              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />

              Up to{" "}
              {Math.min(
                personalizedArticles.length,
                100
              )}{" "}
              articles

            </div>

          </div>

          {/* PERSONALIZED FEED COMPONENT */}

          <PersonalizedFeed
            articles={personalizedArticles}
            categories={
              preferences.categories ?? []
            }
          />

        </section>

        {/* ====================================
            RECOMMENDATION EXPLANATION
        ==================================== */}

        <section className="mt-12">

          <div className="glass-card grid gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

            <div>

              <div className="ai-badge">
                WHY THIS FEED?
              </div>

              <h2 className="mt-4 text-2xl font-bold text-white">
                Multiple signals shape your
                recommendations.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                SmartFeed AI combines multiple
                personalization signals to calculate
                recommendation scores.
              </p>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              {/* RELEVANCE */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-200">
                    Interest relevance
                  </span>

                  <span className="text-xs font-semibold text-violet-300">
                    70%
                  </span>

                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">

                  <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-violet-600 to-violet-400" />

                </div>

              </div>

              {/* SIMILARITY */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-200">
                    Text similarity
                  </span>

                  <span className="text-xs font-semibold text-blue-300">
                    30%
                  </span>

                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">

                  <div className="h-full w-[30%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />

                </div>

              </div>

              {/* INTERACTIONS */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                <p className="text-sm font-medium text-slate-200">
                  Interaction signals
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Likes, dislikes, and saved articles
                  adjust individual article scores.
                </p>

              </div>

              {/* CATEGORY BEHAVIOR */}

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">

                <p className="text-sm font-medium text-slate-200">
                  Category behavior
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Your interaction history influences
                  category-level ranking adjustments.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================
            ACCOUNT SECTION
        ==================================== */}

        <section className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-sm font-medium text-slate-300">
              Signed in as
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {user.email}
            </p>

          </div>

          <LogoutButton />

        </section>

      </div>
    </main>
  );
}
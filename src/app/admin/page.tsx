
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import AdminRefreshNews from "@/components/AdminRefreshNews";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // STEP 1: Verify authentication.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // STEP 2: Verify administrator role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // STEP 3: Fetch dashboard statistics.
  const admin = createSupabaseAdminClient();

  const [
    articlesResult,
    usersResult,
    interactionsResult,
    reportsResult,
  ] = await Promise.all([
    admin
      .from("articles")
      .select("*", { count: "exact", head: true }),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    admin
      .from("user_interactions")
      .select("*", { count: "exact", head: true }),

    admin
      .from("article_reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const stats = [
    {
      title: "Total Articles",
      value: articlesResult.count ?? 0,
      icon: "📰",
    },
    {
      title: "Registered Users",
      value: usersResult.count ?? 0,
      icon: "👥",
    },
    {
      title: "User Interactions",
      value: interactionsResult.count ?? 0,
      icon: "❤️",
    },
    {
      title: "Pending Reports",
      value: reportsResult.count ?? 0,
      icon: "🚩",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              SmartFeed AI · Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-slate-400">
              Welcome, {profile.full_name || "Administrator"}.
              Manage your SmartFeed AI platform here.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium transition hover:bg-slate-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* DASHBOARD STATISTICS */}

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-violet-500/20 bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">
                  {stat.title}
                </p>

                <span className="text-2xl">
                  {stat.icon}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* CONTENT MANAGEMENT */}

        <section className="mt-12">
          <h2 className="text-2xl font-bold">
            Content Management
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage articles, users, and reports submitted
            by your readers.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {/* ARTICLE MANAGEMENT */}

            <Link
              href="/admin/articles"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-violet-500 hover:bg-slate-800"
            >
              <div className="mb-4 text-3xl">
                📰
              </div>

              <h3 className="text-lg font-semibold text-white">
                Article Management
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View, edit, hide, unhide, and delete
                articles published on SmartFeed AI.
              </p>

              <p className="mt-5 text-sm font-semibold text-violet-400">
                Manage Articles →
              </p>
            </Link>

            {/* USER MANAGEMENT */}

            <Link
              href="/admin/users"
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-violet-500 hover:bg-slate-800"
            >
              <div className="mb-4 text-3xl">
                👥
              </div>

              <h3 className="text-lg font-semibold text-white">
                User Management
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View registered users and their
                account information.
              </p>

              <p className="mt-5 text-sm font-semibold text-violet-400">
                View Users →
              </p>
            </Link>

            {/* REPORT MANAGEMENT */}

            <Link
              href="/admin/reports"
              className="rounded-2xl border border-amber-500/20 bg-slate-900 p-6 transition hover:border-amber-500 hover:bg-slate-800"
            >
              <div className="mb-4 text-3xl">
                🚩
              </div>

              <h3 className="text-lg font-semibold text-white">
                Manage Reports
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Review reported articles, resolve or
                dismiss reports, and hide articles.
              </p>

              <p className="mt-5 text-sm font-semibold text-amber-400">
                Review Reports →
              </p>
            </Link>
          </div>
        </section>

        {/* ORIGINAL NEWS PIPELINE - RESTORED */}

        <AdminRefreshNews />
      </div>
    </main>
  );
}
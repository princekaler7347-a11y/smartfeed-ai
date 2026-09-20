
import { redirect } from "next/navigation";
import Link from "next/link";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import AdminRefreshNews from "@/components/AdminRefreshNews";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Step 1: Verify the logged-in user.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Step 2: Check the user's role on the server.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Step 3: Load dashboard statistics.
  // Use the secret-key client only after verifying admin access.
  const admin = createSupabaseAdminClient();

  const [
    { count: totalArticles, error: articlesError },
    { count: totalUsers, error: usersError },
    { count: totalInteractions, error: interactionsError },
  ] = await Promise.all([
    admin
      .from("articles")
      .select("*", { count: "exact", head: true }),

    admin
      .from("profiles")
      .select("*", { count: "exact", head: true }),

    admin
      .from("user_article_interactions")
      .select("*", { count: "exact", head: true }),
  ]);

  if (articlesError || usersError || interactionsError) {
    throw new Error(
      "Unable to load admin dashboard statistics."
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: totalUsers ?? 0,
    },
    {
      label: "Total Articles",
      value: totalArticles ?? 0,
    },
    {
      label: "User Interactions",
      value: totalInteractions ?? 0,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-400">
              SmartFeed AI
            </p>

            <h1 className="text-3xl font-bold md:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-slate-400">
              Welcome, {profile.full_name || "Administrator"}.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium transition hover:bg-slate-800"
          >
            User Dashboard
          </Link>
        </div>

        {/* STATISTICS */}
        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-violet-500/20 bg-slate-900 p-7 shadow-lg"
            >
              <p className="text-sm text-slate-400">
                {stat.label}
              </p>

              <p className="mt-4 text-4xl font-bold text-violet-400">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* CONTENT MANAGEMENT */}
        <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-7">
          <h2 className="text-2xl font-bold">
            Content Management
          </h2>

          <p className="mt-3 text-slate-400">
            Manage articles and view registered users from
            your administration panel.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            {/* MANAGE ARTICLES */}
            <Link
              href="/admin/articles"
              className="inline-flex items-center gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-3 font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/20"
            >
              <span>▤</span>
              Manage Articles
              <span>→</span>
            </Link>

            {/* MANAGE USERS */}
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-300 transition hover:border-blue-400 hover:bg-blue-500/20"
            >
              <span>♙</span>
              Manage Users
              <span>→</span>
            </Link>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Administrator access is required to open
            management pages.
          </p>
        </section>

        {/* NEWS PIPELINE */}
        <AdminRefreshNews />
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import {
  hideArticle,
  unhideArticle,
} from "@/app/admin/articles/actions";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  // Step 1: Verify authentication.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Step 2: Verify the admin role.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Step 3: Load articles.
  const admin = createSupabaseAdminClient();

  const { data: articles, error: articlesError } = await admin
    .from("articles")
    .select(
      "id, title, category, source_name, published_at, is_hidden"
    )
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(100);

  if (articlesError) {
    throw new Error(
      `Unable to load articles: ${articlesError.message}`
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              SmartFeed AI · Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Article Management
            </h1>

            <p className="mt-2 text-slate-400">
              Edit, hide, unhide, or delete the latest 100 articles.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 px-5 py-3 hover:bg-slate-800"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* Article table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="border-b border-slate-700 bg-slate-800 text-slate-300">
              <tr>
                <th className="px-5 py-4">Article Title</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Source</th>
                <th className="px-5 py-4">Published</th>
                <th className="px-5 py-4">Visibility</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {(articles ?? []).map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-slate-800 last:border-0 hover:bg-slate-800/60"
                >
                  {/* Article title */}
                  <td className="max-w-md px-5 py-4 font-medium">
                    {article.title}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 capitalize text-slate-300">
                    {article.category ?? "Uncategorized"}
                  </td>

                  {/* Source */}
                  <td className="px-5 py-4 text-slate-300">
                    {article.source_name ?? "Unknown"}
                  </td>

                  {/* Published date */}
                  <td className="px-5 py-4 text-slate-400">
                    {article.published_at
                      ? new Date(
                          article.published_at
                        ).toLocaleDateString("en-IN")
                      : "Not available"}
                  </td>

                  {/* Visibility status */}
                  <td className="px-5 py-4">
                    {article.is_hidden ? (
                      <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                        Hidden
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Visible
                      </span>
                    )}
                  </td>

                  {/* Action buttons */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {/* EDIT */}
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="rounded-lg bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700"
                      >
                        Edit
                      </Link>

                      {/* HIDE / UNHIDE */}
                      {article.is_hidden ? (
                        <form action={unhideArticle}>
                          <input
                            type="hidden"
                            name="id"
                            value={article.id}
                          />

                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
                          >
                            Unhide
                          </button>
                        </form>
                      ) : (
                        <form action={hideArticle}>
                          <input
                            type="hidden"
                            name="id"
                            value={article.id}
                          />

                          <button
                            type="submit"
                            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700"
                          >
                            Hide
                          </button>
                        </form>
                      )}

                      {/* DELETE: opens confirmation page */}
                      <Link
                        href={`/admin/articles/${article.id}/delete`}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 font-medium text-red-300 transition hover:bg-red-500/20"
                      >
                        Delete
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!articles || articles.length === 0) && (
            <p className="p-8 text-center text-slate-400">
              No articles found.
            </p>
          )}
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Hidden articles remain in the database and are excluded
          from the dashboard and saved articles. Permanent deletion
          requires confirmation on a separate page.
        </p>
      </div>
    </main>
  );
}
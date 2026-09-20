
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import { deleteArticle } from "@/app/admin/articles/actions";

export const dynamic = "force-dynamic";

export default async function DeleteArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Verify that the user is signed in.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Verify that the user is an administrator.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Read and validate the article ID.
  const { id: articleId } = await params;

  if (!/^[1-9]\d*$/.test(articleId)) {
    notFound();
  }

  const id = Number(articleId);

  if (!Number.isSafeInteger(id)) {
    notFound();
  }

  // Load the article.
  const admin = createSupabaseAdminClient();

  const { data: article, error: articleError } = await admin
    .from("articles")
    .select("id, title, source_name, category")
    .eq("id", id)
    .maybeSingle();

  if (articleError) {
    throw new Error(
      `Unable to load article: ${articleError.message}`
    );
  }

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/admin/articles"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to Article Management
        </Link>

        <div className="mt-8 rounded-2xl border border-red-500/30 bg-slate-900 p-6 shadow-xl sm:p-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-3xl text-red-400">
            !
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            Danger Zone
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Permanently Delete Article
          </h1>

          <p className="mt-4 leading-7 text-slate-400">
            You are about to permanently delete the following
            article from SmartFeed AI.
          </p>

          <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Selected Article
            </p>

            <h2 className="mt-3 text-lg font-semibold text-white">
              {article.title}
            </h2>

            <p className="mt-3 text-sm text-slate-400">
              Source: {article.source_name ?? "Unknown"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Category: {article.category ?? "Uncategorized"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Article ID: {article.id}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
            <h3 className="font-semibold text-red-300">
              Warning: This action cannot be undone
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Deleting this article also removes its associated
              recommendation scores and user interactions,
              including saved and liked records.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              If you only want to remove an article from
              users&apos; feeds temporarily, use the Hide
              button instead.
            </p>
          </div>

          <form action={deleteArticle} className="mt-8">
            <input
              type="hidden"
              name="id"
              value={article.id}
            />

            <label
              htmlFor="confirmation"
              className="block text-sm font-medium text-slate-200"
            >
              Type DELETE to confirm
            </label>

            <input
              id="confirmation"
              name="confirmation"
              type="text"
              required
              autoComplete="off"
              placeholder="DELETE"
              className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-red-500"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
              >
                Permanently Delete
              </button>

              <Link
                href="/admin/articles"
                className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
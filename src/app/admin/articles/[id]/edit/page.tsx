
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { updateArticle } from "@/app/admin/articles/actions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Step 1: Check whether the user is logged in.
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // Step 2: Only admins can open this page.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Step 3: Read the article ID from the URL.
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    notFound();
  }

  // Step 4: Load the selected article.
  const admin = createSupabaseAdminClient();

  const { data: article, error: articleError } = await admin
    .from("articles")
    .select(
      "id, title, description, url, image_url, source_name, category"
    )
    .eq("id", Number(id))
    .maybeSingle();

  if (articleError) {
    throw new Error(`Unable to load article: ${articleError.message}`);
  }

  if (!article) {
    notFound();
  }

  const inputClass =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500";

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/articles"
          className="text-sm text-violet-400 hover:text-violet-300"
        >
          ← Back to Articles
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Edit Article</h1>

        <p className="mt-2 text-slate-400">
          Update the article information below.
        </p>

        <form
          action={updateArticle}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-7"
        >
          <input type="hidden" name="id" value={article.id} />

          <div>
            <label htmlFor="title" className="mb-2 block text-sm">
              Article Title
            </label>

            <input
              id="title"
              name="title"
              required
              defaultValue={article.title}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-2 block text-sm">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={article.description ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="category" className="mb-2 block text-sm">
              Category
            </label>

            <input
              id="category"
              name="category"
              defaultValue={article.category ?? ""}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="source_name" className="mb-2 block text-sm">
              Source Name
            </label>

            <input
              id="source_name"
              name="source_name"
              required
              defaultValue={article.source_name}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="url" className="mb-2 block text-sm">
              Article URL
            </label>

            <input
              id="url"
              name="url"
              type="url"
              required
              defaultValue={article.url}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="image_url" className="mb-2 block text-sm">
              Image URL
            </label>

            <input
              id="image_url"
              name="image_url"
              type="url"
              defaultValue={article.image_url ?? ""}
              className={inputClass}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-700"
            >
              Save Changes
            </button>

            <Link
              href="/admin/articles"
              className="rounded-xl border border-slate-700 px-6 py-3 hover:bg-slate-800"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
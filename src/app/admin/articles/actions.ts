
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// Verify admin access before performing any action.
async function requireAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must sign in first.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Admin access required.");
  }

  return createSupabaseAdminClient();
}

// Validate the article ID.
function getArticleId(formData: FormData) {
  const value = formData.get("id");

  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new Error("Invalid article ID.");
  }

  const id = Number(value);

  if (!Number.isSafeInteger(id)) {
    throw new Error("Invalid article ID.");
  }

  return id;
}

// Read a required form field.
function getRequiredText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }

  return value.trim();
}

// Read an optional form field.
function getOptionalText(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

// Refresh pages after an article changes.
function refreshArticlePages() {
  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/dashboard");
}

// --------------------------------------------------
// 1. EDIT ARTICLE
// --------------------------------------------------

export async function updateArticle(formData: FormData) {
  const admin = await requireAdmin();

  const id = getArticleId(formData);
  
  const confirmation = formData.get("confirmation");

  if (confirmation !== "DELETE") {
    throw new Error(
      'Deletion cancelled. Type DELETE exactly to confirm.'
    );
  }
  const title = getRequiredText(formData, "title");
  const url = getRequiredText(formData, "url");
  const sourceName = getRequiredText(formData, "source_name");

  try {
    const parsedUrl = new URL(url);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    throw new Error("Enter a valid HTTP or HTTPS article URL.");
  }

  const imageUrl = getOptionalText(formData, "image_url");

  if (imageUrl) {
    try {
      const parsedImageUrl = new URL(imageUrl);

      if (!["http:", "https:"].includes(parsedImageUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      throw new Error("Enter a valid HTTP or HTTPS image URL.");
    }
  }

  const { data: updatedArticle, error } = await admin
    .from("articles")
    .update({
      title,
      description: getOptionalText(formData, "description"),
      url,
      image_url: imageUrl,
      source_name: sourceName,
      category: getOptionalText(formData, "category"),
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to update article: ${error.message}`);
  }

  if (!updatedArticle) {
    throw new Error("Article not found.");
  }

  refreshArticlePages();

  redirect("/admin/articles");
}

// --------------------------------------------------
// 2. HIDE ARTICLE
// --------------------------------------------------

export async function hideArticle(formData: FormData) {
  const admin = await requireAdmin();
  const id = getArticleId(formData);

  const { data: hiddenArticle, error } = await admin
    .from("articles")
    .update({ is_hidden: true })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to hide article: ${error.message}`);
  }

  if (!hiddenArticle) {
    throw new Error("Article not found.");
  }

  refreshArticlePages();

  redirect("/admin/articles");
}

// --------------------------------------------------
// 3. UNHIDE ARTICLE
// --------------------------------------------------

export async function unhideArticle(formData: FormData) {
  const admin = await requireAdmin();
  const id = getArticleId(formData);

  const { data: visibleArticle, error } = await admin
    .from("articles")
    .update({ is_hidden: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to unhide article: ${error.message}`);
  }

  if (!visibleArticle) {
    throw new Error("Article not found.");
  }

  refreshArticlePages();

  redirect("/admin/articles");
}

// --------------------------------------------------
// 4. PERMANENTLY DELETE ARTICLE
// --------------------------------------------------

export async function deleteArticle(formData: FormData) {
  const admin = await requireAdmin();
  const id = getArticleId(formData);

  const { data: deletedArticle, error } = await admin
    .from("articles")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to delete article: ${error.message}`);
  }

  if (!deletedArticle) {
    throw new Error("Article not found.");
  }

  refreshArticlePages();

  redirect("/admin/articles");
}
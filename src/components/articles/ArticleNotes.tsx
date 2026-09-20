
"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type ArticleNotesProps = {
  articleId: number;
};

export default function ArticleNotes({
  articleId,
}: ArticleNotesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function openNotes() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to access your notes.");
      }

      const { data, error: fetchError } = await supabase
        .from("user_article_notes")
        .select("content")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      const content = data?.content ?? "";

      setNote(content);
      setSavedNote(content);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your note."
      );
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    const content = note.trim();

    if (!content) {
      setError("Please write something before saving.");
      return;
    }

    if (content.length > 5000) {
      setError("Notes cannot exceed 5,000 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to save your note.");
      }

      const { error: saveError } = await supabase
        .from("user_article_notes")
        .upsert(
          {
            user_id: user.id,
            article_id: articleId,
            content,
          },
          {
            onConflict: "user_id,article_id",
          }
        );

      if (saveError) {
        throw saveError;
      }

      setNote(content);
      setSavedNote(content);
      setMessage("Note saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save your note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote() {
    if (!savedNote) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please log in to delete your note.");
      }

      const { error: deleteError } = await supabase
        .from("user_article_notes")
        .delete()
        .eq("user_id", user.id)
        .eq("article_id", articleId);

      if (deleteError) {
        throw deleteError;
      }

      setNote("");
      setSavedNote("");
      setMessage("Note deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete your note."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={openNotes}
        disabled={loading || saving}
        className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:opacity-50"
      >
        📝 {isOpen ? "Close Notes" : "My Notes"}
      </button>

      {isOpen && (
        <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-4">
          <h3 className="text-sm font-semibold text-white">
            My Personal Note
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Only you can access this note through your account.
          </p>

          {loading ? (
            <p className="mt-4 text-xs text-slate-400">
              Loading your note...
            </p>
          ) : (
            <>
              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setMessage("");
                }}
                maxLength={5000}
                rows={5}
                placeholder="Write your thoughts or important points about this article..."
                disabled={saving}
                className="mt-4 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-white outline-none focus:border-blue-400 disabled:opacity-50"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {note.length}/5000
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveNote}
                  disabled={saving || !note.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "Please wait..." : "Save Note"}
                </button>

                {savedNote && (
                  <button
                    type="button"
                    onClick={deleteNote}
                    disabled={saving}
                    className="rounded-lg border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Delete Note
                  </button>
                )}
              </div>

              {message && (
                <p role="status" className="mt-3 text-xs text-emerald-400">
                  {message}
                </p>
              )}

              {error && (
                <p role="alert" className="mt-3 text-xs text-red-400">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
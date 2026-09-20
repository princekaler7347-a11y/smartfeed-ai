
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRefreshNews() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function refreshNews() {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/pipeline/run", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please log in again.");
      }

      if (response.status === 403) {
        throw new Error("Only administrators can refresh the news.");
      }

      if (!response.ok) {
        throw new Error(
          `News refresh failed (HTTP ${response.status}). Check your terminal for details.`
        );
      }

      setMessage(
        "Pipeline completed successfully. Check Latest Available News for the newest articles."
      );

      router.refresh();
    } catch (error) {
      setIsError(true);

      setMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-emerald-500/20 bg-slate-900 p-7">
      <h2 className="text-xl font-bold text-white">
        News Pipeline
      </h2>

      <p className="mt-3 text-sm text-slate-400">
        Fetch available news and update article processing and
        recommendations.
      </p>

      <button
        type="button"
        onClick={refreshNews}
        disabled={loading}
        className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Refreshing news..." : "Refresh News"}
      </button>

      {message && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            isError ? "text-red-400" : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
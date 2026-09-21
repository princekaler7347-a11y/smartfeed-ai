
"use client";

import { useState } from "react";

const REPORT_REASONS = [
  "Misleading or false information",
  "Spam or advertisement",
  "Inappropriate content",
  "Broken or suspicious link",
  "Other",
] as const;

type ArticleReportProps = {
  articleId: number;
};

export default function ArticleReport({
  articleId,
}: ArticleReportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!reason || submitting || reported) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          reason,
          details,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setReported(true);
        setIsOpen(false);
        setMessage("Report submitted successfully.");
        setIsError(false);
      } else if (response.status === 409) {
        setReported(true);
        setIsOpen(false);
        setMessage("You have already reported this article.");
        setIsError(false);
      } else {
        setMessage(
          result.message ||
            "Unable to submit your report."
        );
        setIsError(true);
      }
    } catch {
      setMessage(
        "A network error occurred. Please try again."
      );
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => {
          setIsOpen((previous) => !previous);
          setMessage("");
        }}
        disabled={reported || submitting}
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
          reported
            ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
            : "border-amber-400/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
        }`}
      >
        🚩 {reported ? "Reported" : "Report"}
      </button>

      {isOpen && !reported && (
        <form
          onSubmit={handleSubmit}
          className="mt-3 space-y-4 rounded-xl border border-amber-400/20 bg-slate-950 p-4"
        >
          <h3 className="text-sm font-semibold text-white">
            Report this article
          </h3>

          <p className="text-xs leading-5 text-slate-400">
            Tell our administrators what is wrong
            with this article.
          </p>

          <div>
            <label
              htmlFor={`report-reason-${articleId}`}
              className="mb-2 block text-xs font-medium text-slate-300"
            >
              Reason
            </label>

            <select
              id={`report-reason-${articleId}`}
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              required
              disabled={submitting}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="">
                Select a reason
              </option>

              {REPORT_REASONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={`report-details-${articleId}`}
              className="mb-2 block text-xs font-medium text-slate-300"
            >
              Additional details (optional)
            </label>

            <textarea
              id={`report-details-${articleId}`}
              value={details}
              onChange={(event) =>
                setDetails(event.target.value)
              }
              maxLength={1000}
              rows={3}
              disabled={submitting}
              placeholder="Describe the issue..."
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {details.length}/1000
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={!reason || submitting}
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Report"}
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
              className="rounded-lg border border-slate-700 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>

          {message && (
            <p
              role="status"
              className={`text-xs ${
                isError
                  ? "text-red-400"
                  : "text-emerald-400"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      )}

      {message && !isOpen && (
        <p
          role="status"
          className={`mt-2 text-xs ${
            isError
              ? "text-red-400"
              : "text-emerald-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
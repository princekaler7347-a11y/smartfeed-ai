
import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

import {
  resolveReport,
  dismissReport,
  hideReportedArticle,
} from "./actions";

export const dynamic = "force-dynamic";

type ReportStatus = "pending" | "resolved" | "dismissed";

type Report = {
  id: number;
  article_id: number;
  user_id: string;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
  reviewed_at: string | null;
};

type Article = {
  id: number;
  title: string;
  url: string;
  source_name: string | null;
  is_hidden: boolean;
};

function formatDate(value: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusStyle(status: ReportStatus): string {
  if (status === "pending") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-300";
  }

  if (status === "resolved") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  }

  return "border-slate-500/30 bg-slate-500/10 text-slate-300";
}

export default async function AdminReportsPage() {
  // 1. Verify authentication.

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Verify administrator role.

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // 3. Load reports with the privileged client,
  // only after authorization.

  const admin = createSupabaseAdminClient();

  const { data: reportsData, error: reportsError } =
    await admin
      .from("article_reports")
      .select(
        "id, article_id, user_id, reason, details, status, created_at, reviewed_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

  if (reportsError) {
    throw new Error(
      `Unable to load reports: ${reportsError.message}`
    );
  }

  const reports = (reportsData ?? []) as Report[];

  // 4. Load the related article information.

  const articleIds = [
    ...new Set(reports.map((report) => report.article_id)),
  ];

  let articles: Article[] = [];

  if (articleIds.length > 0) {
    const { data, error } = await admin
      .from("articles")
      .select("id, title, url, source_name, is_hidden")
      .in("id", articleIds);

    if (error) {
      throw new Error(
        `Unable to load reported articles: ${error.message}`
      );
    }

    articles = (data ?? []) as Article[];
  }

  const articleMap = new Map(
    articles.map((article) => [article.id, article])
  );

  // 5. Calculate statistics for the loaded reports.

  const pendingCount = reports.filter(
    (report) => report.status === "pending"
  ).length;

  const resolvedCount = reports.filter(
    (report) => report.status === "resolved"
  ).length;

  const dismissedCount = reports.filter(
    (report) => report.status === "dismissed"
  ).length;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-400">
              SmartFeed AI · Admin
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Report Management
            </h1>

            <p className="mt-3 text-slate-400">
              Review user-submitted article reports and
              moderate reported content.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium transition hover:bg-slate-800"
          >
            ← Back to Admin
          </Link>
        </div>

        {/* STATISTICS */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Loaded Reports",
              value: reports.length,
              color: "text-violet-300",
            },
            {
              label: "Pending",
              value: pendingCount,
              color: "text-amber-300",
            },
            {
              label: "Resolved",
              value: resolvedCount,
              color: "text-emerald-300",
            },
            {
              label: "Dismissed",
              value: dismissedCount,
              color: "text-slate-300",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-violet-500/20 bg-slate-900 p-6"
            >
              <p className="text-sm text-slate-400">
                {stat.label}
              </p>

              <p
                className={`mt-3 text-3xl font-bold ${stat.color}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Statistics cover the latest 100 reports displayed
          on this page.
        </p>

        {/* REPORTS TABLE */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-6">
            <h2 className="text-xl font-bold">
              Submitted Reports
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Review the article and report details before
              taking action.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left text-sm">
              <thead className="border-b border-slate-700 bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-5 py-4">Article</th>
                  <th className="px-5 py-4">Reported By</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Submitted</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => {
                  const article = articleMap.get(
                    report.article_id
                  );

                  return (
                    <tr
                      key={report.id}
                      className="border-b border-slate-800 align-top last:border-0 hover:bg-slate-800/50"
                    >
                      {/* ARTICLE */}

                      <td className="max-w-xs px-5 py-5">
                        <p className="font-semibold text-white">
                          {article?.title ??
                            "Article unavailable"}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {article?.source_name ??
                            "Unknown source"}
                        </p>

                        {article?.is_hidden && (
                          <span className="mt-2 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
                            Hidden
                          </span>
                        )}

                        {article?.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 block text-xs font-medium text-violet-300 hover:text-violet-200"
                          >
                            Open original article ↗
                          </a>
                        )}
                      </td>

                      {/* REPORTING USER */}

                      <td className="px-5 py-5 text-xs text-slate-400">
                        <span className="break-all">
                          {report.user_id}
                        </span>
                      </td>

                      {/* REASON AND DETAILS */}

                      <td className="max-w-xs px-5 py-5">
                        <p className="font-medium text-amber-200">
                          {report.reason}
                        </p>

                        {report.details && (
                          <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
                            {report.details}
                          </p>
                        )}
                      </td>

                      {/* SUBMISSION DATE */}

                      <td className="whitespace-nowrap px-5 py-5 text-xs text-slate-400">
                        {formatDate(report.created_at)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyle(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>

                        {report.reviewed_at && (
                          <p className="mt-2 text-xs text-slate-500">
                            Reviewed:{" "}
                            {formatDate(report.reviewed_at)}
                          </p>
                        )}
                      </td>

                      {/* ADMIN ACTIONS */}

                      <td className="px-5 py-5">
                        {report.status === "pending" ? (
                          <div className="flex flex-col gap-2">
                            <form action={resolveReport}>
                              <input
                                type="hidden"
                                name="reportId"
                                value={report.id}
                              />

                              <button
                                type="submit"
                                className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Mark Resolved
                              </button>
                            </form>

                            <form action={dismissReport}>
                              <input
                                type="hidden"
                                name="reportId"
                                value={report.id}
                              />

                              <button
                                type="submit"
                                className="w-full rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                              >
                                Dismiss Report
                              </button>
                            </form>

                            {!article?.is_hidden && article && (
                              <form action={hideReportedArticle}>
                                <input
                                  type="hidden"
                                  name="reportId"
                                  value={report.id}
                                />

                                <button
                                  type="submit"
                                  className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
                                >
                                  Hide Article &amp; Resolve
                                </button>
                              </form>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">
                            Review completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {reports.length === 0 && (
            <p className="p-10 text-center text-slate-400">
              No reports have been submitted yet.
            </p>
          )}
        </section>

        <p className="mt-5 text-sm text-slate-500">
          Hiding an article removes it from the user feed
          without permanently deleting it. Reports remain
          stored for review history.
        </p>
      </div>
    </main>
  );
}
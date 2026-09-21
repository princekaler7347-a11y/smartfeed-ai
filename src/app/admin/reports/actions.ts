
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

type ReviewStatus = "resolved" | "dismissed";

async function verifyAdmin() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return user;
}

function getReportId(formData: FormData): number {
  const rawId = formData.get("reportId");

  if (typeof rawId !== "string") {
    throw new Error("Missing report ID.");
  }

  const reportId = Number(rawId);

  if (!Number.isSafeInteger(reportId) || reportId <= 0) {
    throw new Error("Invalid report ID.");
  }

  return reportId;
}

async function updateReportStatus(
  formData: FormData,
  status: ReviewStatus
) {
  const user = await verifyAdmin();
  const reportId = getReportId(formData);

  const admin = createSupabaseAdminClient();

  const { data: report, error: reportError } =
    await admin
      .from("article_reports")
      .select("id, status")
      .eq("id", reportId)
      .maybeSingle();

  if (reportError || !report) {
    throw new Error("Report not found.");
  }

  if (report.status !== "pending") {
    throw new Error("This report has already been reviewed.");
  }

  const { data: updatedReport, error: updateError } =
    await admin
      .from("article_reports")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", reportId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

  if (updateError || !updatedReport) {
    throw new Error(
      "Unable to update the report. It may already have been reviewed."
    );
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

export async function resolveReport(
  formData: FormData
) {
  await updateReportStatus(formData, "resolved");
}

export async function dismissReport(
  formData: FormData
) {
  await updateReportStatus(formData, "dismissed");
}

export async function hideReportedArticle(
  formData: FormData
) {
  const user = await verifyAdmin();
  const reportId = getReportId(formData);

  const admin = createSupabaseAdminClient();

  const { data: report, error: reportError } =
    await admin
      .from("article_reports")
      .select("id, article_id, status")
      .eq("id", reportId)
      .maybeSingle();

  if (reportError || !report) {
    throw new Error("Report not found.");
  }

  if (report.status !== "pending") {
    throw new Error("This report has already been reviewed.");
  }

  // Hide the article without permanently deleting it.
  const { error: articleError } = await admin
    .from("articles")
    .update({ is_hidden: true })
    .eq("id", report.article_id);

  if (articleError) {
    throw new Error("Unable to hide the reported article.");
  }

  // Mark the report as resolved after hiding the article.
  const { data: updatedReport, error: updateError } =
    await admin
      .from("article_reports")
      .update({
        status: "resolved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", reportId)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

  if (updateError || !updatedReport) {
    throw new Error(
      "Article was hidden, but the report could not be marked resolved. Please review it manually."
    );
  }

  revalidatePath("/admin/reports");
  revalidatePath("/admin/articles");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/saved");
  revalidatePath("/dashboard/today");
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_REASONS = [
  "Misleading or false information",
  "Spam or advertisement",
  "Inappropriate content",
  "Broken or suspicious link",
  "Other",
];

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // 1. Verify the logged-in user.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Please log in to report an article.",
        },
        { status: 401 }
      );
    }

    // 2. Read and validate the submitted data.
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report data.",
        },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    const articleId = input.articleId;
    const reason = input.reason;
    const details = input.details;

    if (
      typeof articleId !== "number" ||
      !Number.isSafeInteger(articleId) ||
      articleId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid article ID.",
        },
        { status: 400 }
      );
    }

    if (
      typeof reason !== "string" ||
      !ALLOWED_REASONS.includes(reason)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid report reason.",
        },
        { status: 400 }
      );
    }

    if (
      details !== undefined &&
      details !== null &&
      typeof details !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid report details.",
        },
        { status: 400 }
      );
    }

    const cleanedDetails =
      typeof details === "string" ? details.trim() : "";

    if (cleanedDetails.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          message: "Report details cannot exceed 1000 characters.",
        },
        { status: 400 }
      );
    }

    // 3. Confirm that the article exists and is visible.
    const { data: article, error: articleError } =
      await supabase
        .from("articles")
        .select("id")
        .eq("id", articleId)
        .eq("is_hidden", false)
        .maybeSingle();

    if (articleError) {
      console.error("Report article lookup failed:", articleError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to verify the article.",
        },
        { status: 500 }
      );
    }

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "This article is no longer available.",
        },
        { status: 404 }
      );
    }

    // 4. Save the report using the authenticated user's ID.
    // RLS and the database unique constraint provide
    // additional protection.
    const { error: insertError } = await supabase
      .from("article_reports")
      .insert({
        article_id: articleId,
        user_id: user.id,
        reason,
        details: cleanedDetails || null,
      });

    if (insertError) {
      // PostgreSQL unique-constraint violation.
      if (insertError.code === "23505") {
        return NextResponse.json(
          {
            success: false,
            message: "You have already reported this article.",
          },
          { status: 409 }
        );
      }

      console.error("Report submission failed:", insertError);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to submit your report. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your report has been submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Unexpected report API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
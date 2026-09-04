import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { processRecommendationsForUser } from "@/services/recommendation-processing";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const result =
      await processRecommendationsForUser(user.id);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      totalFound: result.totalFound,
      userCategories: result.userCategories,
      message:
        "Relevance and similarity processing completed successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { syncNews } from "@/services/news-sync";
import { processAllSentiment } from "@/services/sentiment-processing";
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

    // -----------------------------------------
    // STEP 1: SYNC LATEST NEWS
    // -----------------------------------------

    const newsResult = await syncNews();

    // -----------------------------------------
    // STEP 2: PROCESS ALL NEW SENTIMENT
    // -----------------------------------------

    const sentimentResult =
      await processAllSentiment();

    // -----------------------------------------
    // STEP 3: RECALCULATE USER RECOMMENDATIONS
    // -----------------------------------------

    const recommendationResult =
      await processRecommendationsForUser(
        user.id
      );

    // -----------------------------------------
    // PIPELINE COMPLETE
    // -----------------------------------------

    return NextResponse.json({
      success: true,

      news: {
        fetched:
          newsResult.fetched,
        inserted:
          newsResult.inserted,
      },

      sentiment: {
        processed:
          sentimentResult.processed,
      },

      recommendations: {
        processed:
          recommendationResult.processed,

        totalFound:
          recommendationResult.totalFound,

        userCategories:
          recommendationResult.userCategories,
      },

      message:
        "SmartFeed AI processing pipeline completed successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown pipeline error.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
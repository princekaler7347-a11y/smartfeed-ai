
import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

import { syncNews } from "@/services/news-sync";

import { processAllSentiment } from "@/services/sentiment-processing";

import { processRecommendationsForUser } from "@/services/recommendation-processing";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();

    // -----------------------------------------
    // STEP 1: VERIFY AUTHENTICATION
    // -----------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    // -----------------------------------------
    // STEP 2: VERIFY ADMIN ROLE
    // -----------------------------------------

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden. Admin access required.",
        },
        { status: 403 }
      );
    }

    // -----------------------------------------
    // STEP 3: SYNC LATEST NEWS
    // -----------------------------------------

    const newsResult = await syncNews();

    // -----------------------------------------
    // STEP 4: PROCESS ALL NEW SENTIMENT
    // -----------------------------------------

    const sentimentResult =
      await processAllSentiment();

    // -----------------------------------------
    // STEP 5: RECALCULATE ADMIN RECOMMENDATIONS
    // -----------------------------------------

    const recommendationResult =
      await processRecommendationsForUser(
        user.id
      );

    // -----------------------------------------
    // STEP 6: RETURN PIPELINE RESULTS
    // -----------------------------------------

    return NextResponse.json({
      success: true,

      news: {
        fetched: newsResult.fetched,
        inserted: newsResult.inserted,
      },

      sentiment: {
        processed: sentimentResult.processed,
      },

      recommendations: {
        processed: recommendationResult.processed,
        totalFound: recommendationResult.totalFound,
        userCategories: recommendationResult.userCategories,
      },

      message:
        "SmartFeed AI processing pipeline completed successfully.",
    });
  } catch (error) {
    console.error("Pipeline execution failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Pipeline execution failed.",
      },
      { status: 500 }
    );
  }
}
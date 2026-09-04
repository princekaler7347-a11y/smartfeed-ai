import { NextResponse } from "next/server";
import { syncNews } from "@/services/news-sync";
import { processAllSentiment } from "@/services/sentiment-processing";
import { processRecommendationsForAllUsers } from "@/services/all-users-recommendation-processing";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "CRON_SECRET is missing from the server environment.",
        },
        { status: 500 }
      );
    }

    const authorization =
      request.headers.get("authorization");

    if (
      authorization !== `Bearer ${cronSecret}`
    ) {
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
    // STEP 2: PROCESS SENTIMENT
    // -----------------------------------------

    const sentimentResult =
      await processAllSentiment();

    // -----------------------------------------
    // STEP 3: PROCESS ALL USERS
    // -----------------------------------------

    const recommendationResult =
      await processRecommendationsForAllUsers();

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
        usersProcessed:
          recommendationResult.usersProcessed,

        totalRecommendationsProcessed:
          recommendationResult.totalRecommendationsProcessed,
      },

      message:
        "SmartFeed AI scheduled pipeline completed successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown cron pipeline error.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
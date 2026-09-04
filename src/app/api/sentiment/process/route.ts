import { NextResponse } from "next/server";
import { processSentimentBatch } from "@/services/sentiment-processing";

export async function POST(request: Request) {
  try {
    const pipelineSecret =
      process.env.PIPELINE_SECRET;

    if (!pipelineSecret) {
      return NextResponse.json(
        {
          success: false,
          message:
            "PIPELINE_SECRET is missing from the server environment.",
        },
        { status: 500 }
      );
    }

    const providedSecret =
      request.headers.get("x-pipeline-secret");

    if (providedSecret !== pipelineSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const result =
      await processSentimentBatch(100);

    return NextResponse.json({
      success: true,
      processed: result.processed,
      totalFound: result.totalFound,
      message:
        result.totalFound === 0
          ? "No unprocessed articles found."
          : "Article sentiment processing completed successfully.",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
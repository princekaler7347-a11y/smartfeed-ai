import { NextResponse } from "next/server";
import { syncNews } from "@/services/news-sync";

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

    const result = await syncNews();

    return NextResponse.json({
      success: true,
      fetched: result.fetched,
      inserted: result.inserted,
      headlineCategories:
        result.headlineCategories,
      keywordCategories:
        result.keywordCategories,
      message:
        "Full category and keyword news synchronization completed successfully.",
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
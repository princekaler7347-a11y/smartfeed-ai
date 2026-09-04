import { NextResponse } from "next/server";
import { fetchTopHeadlines } from "@/services/news-api";

export async function GET() {
  try {
    const articles = await fetchTopHeadlines();

    return NextResponse.json({
      success: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
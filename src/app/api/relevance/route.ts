import { NextResponse } from "next/server";
import { calculateRelevance } from "@/services/relevance-scoring";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : null;

    const userCategories = Array.isArray(body?.userCategories)
      ? body.userCategories.filter(
          (category: unknown): category is string =>
            typeof category === "string"
        )
      : [];

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          message: "Title is required.",
        },
        { status: 400 }
      );
    }

    const result = calculateRelevance(
      title,
      description,
      userCategories
    );

    return NextResponse.json({
      success: true,
      relevance: result,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request.",
      },
      { status: 400 }
    );
  }
}
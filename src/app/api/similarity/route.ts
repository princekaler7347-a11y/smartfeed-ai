import { NextResponse } from "next/server";
import { calculateSemanticSimilarity } from "@/services/semantic-similarity";

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

    if (userCategories.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one user interest is required.",
        },
        { status: 400 }
      );
    }

    const similarity = calculateSemanticSimilarity(
      title,
      description,
      userCategories
    );

    return NextResponse.json({
      success: true,
      similarity,
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
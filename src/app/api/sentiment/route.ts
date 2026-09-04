import { NextResponse } from "next/server";
import { analyzeSentiment } from "@/services/sentiment-analysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          message: "Text is required.",
        },
        { status: 400 }
      );
    }

    const result = analyzeSentiment(text);

    return NextResponse.json({
      success: true,
      text,
      sentiment: result,
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
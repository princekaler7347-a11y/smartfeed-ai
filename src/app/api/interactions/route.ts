import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type InteractionAction = "like" | "dislike" | "save";

export async function POST(request: Request) {
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

    const body = await request.json();

    const articleId = Number(body?.articleId);
    const action = body?.action as InteractionAction;

    if (!Number.isInteger(articleId) || articleId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid articleId is required.",
        },
        { status: 400 }
      );
    }

    if (!["like", "dislike", "save"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid interaction action.",
        },
        { status: 400 }
      );
    }

    const { data: existingInteraction, error: fetchError } =
      await supabase
        .from("user_article_interactions")
        .select("liked, disliked, saved")
        .eq("user_id", user.id)
        .eq("article_id", articleId)
        .maybeSingle();

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    let liked = existingInteraction?.liked ?? false;
    let disliked = existingInteraction?.disliked ?? false;
    let saved = existingInteraction?.saved ?? false;

    if (action === "like") {
      liked = !liked;

      if (liked) {
        disliked = false;
      }
    }

    if (action === "dislike") {
      disliked = !disliked;

      if (disliked) {
        liked = false;
      }
    }

    if (action === "save") {
      saved = !saved;
    }

    const { data, error: upsertError } = await supabase
      .from("user_article_interactions")
      .upsert(
        {
          user_id: user.id,
          article_id: articleId,
          liked,
          disliked,
          saved,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,article_id",
        }
      )
      .select("liked, disliked, saved")
      .single();

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    return NextResponse.json({
      success: true,
      interaction: data,
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
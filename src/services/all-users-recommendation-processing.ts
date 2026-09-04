import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { processRecommendationsForUser } from "@/services/recommendation-processing";

export async function processRecommendationsForAllUsers() {
  const supabase = createSupabaseAdminClient();

  const {
    data: users,
    error: usersError,
  } = await supabase
    .from("user_preferences")
    .select("user_id, onboarding_completed")
    .eq("onboarding_completed", true);

  if (usersError) {
    throw new Error(usersError.message);
  }

  if (!users || users.length === 0) {
    return {
      usersProcessed: 0,
      totalRecommendationsProcessed: 0,
    };
  }

  let usersProcessed = 0;
  let totalRecommendationsProcessed = 0;

  for (const user of users) {
    try {
      const result =
        await processRecommendationsForUser(
          user.user_id
        );

      usersProcessed++;

      totalRecommendationsProcessed +=
        result.processed;
    } catch (error) {
      console.error(
        `Failed to process recommendations for user ${user.user_id}:`,
        error
      );
    }
  }

  return {
    usersProcessed,
    totalRecommendationsProcessed,
  };
}
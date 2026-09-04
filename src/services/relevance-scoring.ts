export type RelevanceResult = {
    score: number;
    reason: string;
  };
  
  export function calculateRelevance(
    title: string,
    description: string | null,
    userCategories: string[]
  ): RelevanceResult {
    if (userCategories.length === 0) {
      return {
        score: 0,
        reason: "No user interests available.",
      };
    }
  
    const text = `${title} ${description ?? ""}`.toLowerCase();
  
    let matchedCategories = 0;
  
    for (const category of userCategories) {
      const normalizedCategory = category.toLowerCase().trim();
  
      if (normalizedCategory && text.includes(normalizedCategory)) {
        matchedCategories++;
      }
    }
  
    const score = Number(
      (matchedCategories / userCategories.length).toFixed(4)
    );
  
    if (matchedCategories === 0) {
      return {
        score: 0,
        reason: "No direct interest keywords matched.",
      };
    }
  
    return {
      score,
      reason: `${matchedCategories} of ${userCategories.length} interests matched the article text.`,
    };
  }
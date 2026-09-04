export type ArticleInteraction = {
    category: string | null;
    liked: boolean;
    disliked: boolean;
    saved: boolean;
  };
  
  export type CategoryBehaviorScores = Record<string, number>;
  
  export function calculateCategoryBehaviorScores(
    interactions: ArticleInteraction[]
  ): CategoryBehaviorScores {
    const scores: CategoryBehaviorScores = {};
  
    for (const interaction of interactions) {
      if (!interaction.category) {
        continue;
      }
  
      const category = interaction.category.toLowerCase();
  
      if (!scores[category]) {
        scores[category] = 0;
      }
  
      if (interaction.liked) {
        scores[category] += 0.05;
      }
  
      if (interaction.saved) {
        scores[category] += 0.04;
      }
  
      if (interaction.disliked) {
        scores[category] -= 0.08;
      }
    }
  
    // Keep category influence within a safe range.
    for (const category of Object.keys(scores)) {
      scores[category] = Number(
        Math.max(
          -0.2,
          Math.min(0.2, scores[category])
        ).toFixed(4)
      );
    }
  
    return scores;
  }
  
  export function getCategoryBehaviorAdjustment(
    category: string | null,
    categoryScores: CategoryBehaviorScores
  ): number {
    if (!category) {
      return 0;
    }
  
    return categoryScores[category.toLowerCase()] ?? 0;
  }
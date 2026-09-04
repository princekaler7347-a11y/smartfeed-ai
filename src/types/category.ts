/**
 * Content categories users can choose during onboarding.
 * These match the topic areas SmartFeed AI will curate news for.
 */
export type ContentCategory =
  | "technology"
  | "artificial-intelligence"
  | "programming"
  | "business"
  | "finance"
  | "science"
  | "education"
  | "sports"
  | "entertainment"
  | "gaming"
  | "health"
  | "world-news";

export type ContentCategoryOption = {
  id: ContentCategory;
  label: string;
  description: string;
};

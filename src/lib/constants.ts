import type { ContentCategoryOption, NavItem } from "@/types";

export const APP_NAME = "SmartFeed AI";

export const APP_DESCRIPTION =
  "An AI-powered content curation system that delivers personalized news and articles based on your interests.";

export const APP_TAGLINE = "Your intelligent news feed, curated by AI.";

export const MAIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    href: "/",
    description: "Landing page and project overview",
  },
  {
    label: "About",
    href: "/about",
    description: "Learn about SmartFeed AI",
  },
];

export const CONTENT_CATEGORIES: ContentCategoryOption[] = [
  {
    id: "technology",
    label: "Technology",
    description: "Latest tech news, gadgets, and industry updates.",
  },
  {
    id: "artificial-intelligence",
    label: "Artificial Intelligence",
    description: "AI research, tools, and breakthroughs.",
  },
  {
    id: "programming",
    label: "Programming",
    description: "Software development, languages, and best practices.",
  },
  {
    id: "business",
    label: "Business",
    description: "Startups, markets, and business strategy.",
  },
  {
    id: "finance",
    label: "Finance",
    description: "Markets, investing, and personal finance.",
  },
  {
    id: "science",
    label: "Science",
    description: "Discoveries and research across scientific fields.",
  },
  {
    id: "education",
    label: "Education",
    description: "Learning resources and education news.",
  },
  {
    id: "sports",
    label: "Sports",
    description: "Scores, highlights, and sports industry news.",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    description: "Movies, music, TV, and celebrity news.",
  },
  {
    id: "gaming",
    label: "Gaming",
    description: "Video games, esports, and gaming culture.",
  },
  {
    id: "health",
    label: "Health",
    description: "Wellness, medicine, and fitness updates.",
  },
  {
    id: "world-news",
    label: "World News",
    description: "Global headlines and current events.",
  },
];

export const LANDING_FEATURES = [
  {
    title: "Personalized Feed",
    description:
      "Get articles matched to your interests instead of scrolling through irrelevant news.",
  },
  {
    title: "AI Summaries",
    description:
      "Read concise AI-generated summaries so you understand stories quickly.",
  },
  {
    title: "Smart Recommendations",
    description:
      "Discover relevant content based on your reading history and preferences.",
  },
  {
    title: "Category Filtering",
    description:
      "Focus on the topics you care about across 12 curated content categories.",
  },
] as const;

type NewsApiArticle = {
    source?: {
      id?: string | null;
      name?: string;
    };
    author?: string | null;
    title?: string | null;
    description?: string | null;
    url?: string | null;
    urlToImage?: string | null;
    publishedAt?: string | null;
    content?: string | null;
  };
  
  type NewsApiResponse = {
    status: string;
    totalResults?: number;
    articles?: NewsApiArticle[];
    code?: string;
    message?: string;
  };
  
  export type Article = {
    title: string;
    description: string | null;
    url: string;
    imageUrl: string | null;
    sourceName: string;
    publishedAt: string | null;
  };
  
  export async function fetchTopHeadlines(
    category?: string
  ): Promise<Article[]> {
    const apiKey = process.env.NEWS_API_KEY;
  
    if (!apiKey) {
      throw new Error("NEWS_API_KEY is missing from .env.local");
    }
  
    const params = new URLSearchParams({
      country: "us",
      pageSize: "20",
    });
  
    if (category) {
      params.set("category", category.toLowerCase());
    }
  
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?${params.toString()}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
        cache: "no-store",
      }
    );
  
    const data: NewsApiResponse = await response.json();
  
    if (!response.ok || data.status !== "ok") {
      throw new Error(
        data.message || "Failed to fetch news from NewsAPI"
      );
    }
  
    if (!Array.isArray(data.articles)) {
      return [];
    }
  
    return data.articles
      .filter(
        (article) =>
          typeof article.title === "string" &&
          typeof article.url === "string" &&
          article.title.trim() !== "" &&
          article.url.trim() !== ""
      )
      .map((article) => ({
        title: article.title!,
        description: article.description ?? null,
        url: article.url!,
        imageUrl: article.urlToImage ?? null,
        sourceName: article.source?.name || "Unknown Source",
        publishedAt: article.publishedAt ?? null,
      }));
  }
  
  export async function fetchNewsByKeyword(
    keyword: string
  ): Promise<Article[]> {
    const apiKey = process.env.NEWS_API_KEY;
  
    if (!apiKey) {
      throw new Error("NEWS_API_KEY is missing from .env.local");
    }
  
    const params = new URLSearchParams({
      q: keyword,
      language: "en",
      sortBy: "publishedAt",
      pageSize: "20",
    });
  
    const response = await fetch(
      `https://newsapi.org/v2/everything?${params.toString()}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
        cache: "no-store",
      }
    );
  
    const data: NewsApiResponse = await response.json();
  
    if (!response.ok || data.status !== "ok") {
      throw new Error(
        data.message || `Failed to fetch ${keyword} news from NewsAPI`
      );
    }
  
    if (!Array.isArray(data.articles)) {
      return [];
    }
  
    return data.articles
      .filter(
        (article) =>
          typeof article.title === "string" &&
          typeof article.url === "string" &&
          article.title.trim() !== "" &&
          article.url.trim() !== ""
      )
      .map((article) => ({
        title: article.title!,
        description: article.description ?? null,
        url: article.url!,
        imageUrl: article.urlToImage ?? null,
        sourceName: article.source?.name || "Unknown Source",
        publishedAt: article.publishedAt ?? null,
      }));
  }
import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type NewsCategory = "EVENT" | "NEWS" | "MATCH";

export type NewsItem = {
  slug: string;
  date: string;
  displayDate: string;
  category: NewsCategory;
  title: string;
  excerpt: string;
  cover?: string;
  participants?: number;
  partners?: string[];
};

export type NewsArticle = NewsItem & {
  body: string;
};

const NEWS_DIR = path.join(process.cwd(), "content", "news");

const isValidCategory = (v: unknown): v is NewsCategory =>
  v === "EVENT" || v === "NEWS" || v === "MATCH";

const formatDisplayDate = (iso: string) => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
};

async function readFiles() {
  const entries = await fs.readdir(NEWS_DIR);
  return entries.filter((f) => f.endsWith(".mdx"));
}

function buildItem(slug: string, raw: matter.GrayMatterFile<string>): NewsArticle {
  const data = raw.data as Record<string, unknown>;
  const date = String(data.date ?? "");
  const category = isValidCategory(data.category) ? data.category : "NEWS";

  return {
    slug,
    date,
    displayDate: formatDisplayDate(date),
    category,
    title: String(data.title ?? ""),
    excerpt: String(data.excerpt ?? ""),
    cover: typeof data.cover === "string" ? data.cover : undefined,
    participants:
      typeof data.participants === "number" ? data.participants : undefined,
    partners: Array.isArray(data.partners)
      ? data.partners.map(String)
      : undefined,
    body: raw.content,
  };
}

export async function getAllNews(): Promise<NewsItem[]> {
  const files = await readFiles();
  const items = await Promise.all(
    files.map(async (file) => {
      const slug = file.replace(/\.mdx$/, "");
      const source = await fs.readFile(path.join(NEWS_DIR, file), "utf8");
      const parsed = matter(source);
      const article = buildItem(slug, parsed);
      const { body: _body, ...item } = article;
      return item;
    }),
  );
  return items.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const source = await fs.readFile(
      path.join(NEWS_DIR, `${slug}.mdx`),
      "utf8",
    );
    return buildItem(slug, matter(source));
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const files = await readFiles();
  return files.map((f) => f.replace(/\.mdx$/, ""));
}

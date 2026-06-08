type Frontmatter = Record<string, string>;

export type MarkdownBlogPost = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  author: string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  body: string;
};

function parseFrontmatter(raw: string): { meta: Frontmatter; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw.trim() };
  const meta: Frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

const markdownModules = import.meta.glob("../../../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function slugFromPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const fileName = normalized.split("/").pop() ?? normalized;
  return fileName.replace(/\.md$/i, "");
}

function toPost(path: string, raw: string): MarkdownBlogPost {
  const { meta, body } = parseFrontmatter(raw);
  const slug = meta.slug?.trim() || slugFromPath(path);
  const title = meta.title?.trim() || slug;
  const publishedAt = meta.date?.trim() || new Date().toISOString().slice(0, 10);
  const excerpt = meta.summary?.trim() || meta.description?.trim() || title;
  const author = meta.author?.trim() || "BUILDCHAIN";
  const tags = (meta.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const seoTitle = meta.seoTitle?.trim() || undefined;
  const seoDescription = meta.seoDescription?.trim() || undefined;

  return {
    slug,
    title,
    publishedAt,
    excerpt,
    author,
    tags,
    seoTitle,
    seoDescription,
    body,
  };
}

const POSTS: MarkdownBlogPost[] = Object.entries(markdownModules)
  .map(([path, raw]) => toPost(path, raw))
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

export function listBlogPostsSorted(): MarkdownBlogPost[] {
  return POSTS;
}

export function getBlogPostBySlug(slug: string): MarkdownBlogPost | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export const BLOG_SLUGS: string[] = POSTS.map((post) => post.slug);

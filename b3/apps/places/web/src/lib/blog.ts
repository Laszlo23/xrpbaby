import fs from "fs";
import path from "path";

export type BlogPostListItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
};

export type BlogPost = BlogPostListItem & { body: string };

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw.trim() };
  const meta: Record<string, string> = {};
  for (const line of m[1]!.split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    meta[k] = v;
  }
  return { meta, body: m[2]!.trim() };
}

export function listBlogPosts(): BlogPostListItem[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  const out: BlogPostListItem[] = [];
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), "utf8");
    const { meta } = parseFrontmatter(raw);
    out.push({
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? "",
      summary: meta.summary ?? "",
    });
  }
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return out;
}

export function getBlogPost(slug: string): BlogPost | null {
  const fp = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) return null;
  const raw = fs.readFileSync(fp, "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    summary: meta.summary ?? "",
    body,
  };
}

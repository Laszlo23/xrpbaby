#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.resolve(ROOT, "../content/blog");
const DAYS = Number(process.argv.find((arg) => arg.startsWith("--days="))?.split("=")[1] || "7");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return { meta, body: match[2] };
}

function listPosts() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  return files
    .map((file) => {
      const full = path.join(CONTENT_DIR, file);
      const raw = fs.readFileSync(full, "utf8");
      const { meta } = parseFrontmatter(raw);
      return {
        slug: file.replace(/\.md$/, ""),
        title: meta.title || file,
        date: meta.date || "",
        summary: meta.summary || "",
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function postsInWindow(posts, days) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return posts.filter((post) => {
    const t = new Date(post.date).getTime();
    return Number.isFinite(t) && t >= since;
  });
}

function printReport() {
  const posts = listPosts();
  const recent = postsInWindow(posts, DAYS);
  const cadence = recent.length / Math.max(1, DAYS);
  const cadenceLabel = cadence >= 1 ? "on-track" : cadence >= 0.5 ? "warning" : "off-track";

  console.log("# Weekly Growth Report");
  console.log("");
  console.log(`- Window: last ${DAYS} days`);
  console.log(`- Posts published: ${recent.length}`);
  console.log(`- Cadence status: ${cadenceLabel}`);
  console.log("");
  console.log("## Recent Blog Posts");
  if (recent.length === 0) {
    console.log("- none");
  } else {
    for (const post of recent) {
      console.log(`- ${post.date} | ${post.title} | /blog/${post.slug}`);
    }
  }
  console.log("");
  console.log("## Growth Ops Checklist");
  console.log("- Verify /sitemap.xml includes /blog URLs");
  console.log("- Verify /blog/feed.xml returns latest entries");
  console.log("- Run: npm run growth:validate -- --origin=https://app.buildingcultureid.space");
  console.log("- Confirm one daily post reached X + Telegram + Slack");
}

printReport();

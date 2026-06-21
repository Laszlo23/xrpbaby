import { BUILDER_TAPES } from "@/content/builder-tapes";

const BUCKET = "https://0xlaszlo.4everbucket.com/buildingculture";

const ALLOWED_FILENAMES = new Set([
  "Dial-Up Whispers.mp3",
  "Screen-Glow Hope.mp3",
  "Bitcoin Whitepaper.mp3",
  "Cathedral Builders.mp3",
  "Builders Inherit.mp3",
]);

/** Same-origin URL for `<audio src>` — correct MIME + Range via app proxy. */
export function builderTapeMediaPath(filename: string): string {
  return `/api/media/builder-tapes/${encodeURIComponent(filename)}`;
}

export function builderTapeFilenameFromSlug(slug: string): string | undefined {
  const tape = BUILDER_TAPES.find((t) => t.slug === slug);
  if (!tape) return undefined;
  const prefix = "/api/media/builder-tapes/";
  if (!tape.audioUrl.startsWith(prefix)) return undefined;
  try {
    return decodeURIComponent(tape.audioUrl.slice(prefix.length));
  } catch {
    return undefined;
  }
}

export async function proxyBuilderTapeAudio(
  rawFileParam: string,
  request: Request,
): Promise<Response> {
  let filename: string;
  try {
    filename = decodeURIComponent(rawFileParam);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (!ALLOWED_FILENAMES.has(filename)) {
    return new Response("Not found", { status: 404 });
  }

  const upstreamUrl = `${BUCKET}/${encodeURIComponent(filename)}`;
  const range = request.headers.get("Range");
  const upstream = await fetch(upstreamUrl, {
    headers: range ? { Range: range } : undefined,
  });

  if (!upstream.ok && upstream.status !== 206) {
    return new Response("Upstream unavailable", { status: upstream.status || 502 });
  }

  const headers = new Headers();
  headers.set("Content-Type", "audio/mpeg");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", "public, max-age=86400, immutable");
  headers.set("Access-Control-Allow-Origin", "*");

  for (const key of ["Content-Length", "Content-Range", "ETag", "Last-Modified"] as const) {
    const value = upstream.headers.get(key);
    if (value) headers.set(key, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  });
}

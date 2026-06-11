import { checkBnbNameAvailable, formatBnbName, resolveBnbName, reverseBnbAddress } from "@/lib/identity/spaceid";

export async function handleIdentityResolveBnbGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const name = url.searchParams.get("name")?.trim() ?? "";
  const address = url.searchParams.get("address")?.trim() ?? "";

  if (name) {
    const result = await resolveBnbName(name);
    return jsonResponse({ ok: result.ok, ...result });
  }

  if (address) {
    const result = await reverseBnbAddress(address);
    return jsonResponse({ ok: result.ok, ...result });
  }

  return jsonResponse({ ok: false, error: "name_or_address_required" }, 400);
}

export async function handleIdentityCheckBnbGet(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const label = url.searchParams.get("label")?.trim() ?? "";
  if (!label) {
    return jsonResponse({ ok: false, error: "label_required" }, 400);
  }
  const available = await checkBnbNameAvailable(label);
  return jsonResponse({
    ok: true,
    label,
    name: formatBnbName(label),
    available,
    registerUrl: "https://space.id/tld/1",
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

import {
  buildHackQuestGithubField,
  buildHackQuestOnChainProof,
  buildOgHackathonXPost,
  OG_AGENT_ID_SOL_PATH,
  OG_CHAIN_ID,
  OG_CHAIN_NAME,
  OG_HACKATHON_JUDGE_README,
  OG_HACKATHON_PAGE,
  OG_HACKATHON_REPO,
  OG_JUDGE_ONE_LINER,
  OG_PROJECT_DESCRIPTION,
  OG_PROJECT_NAME,
  OG_PROJECT_ONE_LINER,
  OG_PRODUCTION_PROOF_URL,
  OG_RPC,
  ogExplorerAddressUrl,
  ogExplorerTxUrl,
  resolveOgAgentIdProof,
} from "./og-hackathon";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Standalone HTML proof page — avoids root SSR / Prisma on production Node. */
export function buildOgAgentIdProofHtml(proofUrl: string = OG_PRODUCTION_PROOF_URL): string {
  const { contract, deployTx, mintTx } = resolveOgAgentIdProof({});
  const xPost = buildOgHackathonXPost(contract, proofUrl);
  const hqOnChain = buildHackQuestOnChainProof(contract, proofUrl);
  const hqGithub = buildHackQuestGithubField();

  const copyItems = [
    ["Pitch", OG_PROJECT_DESCRIPTION],
    ["≤30 words", OG_PROJECT_ONE_LINER],
    ["One-liner", OG_JUDGE_ONE_LINER],
    ["Contract", contract],
    ["HQ on-chain", hqOnChain],
    ["HQ GitHub", hqGithub],
    ["X post", xPost],
    ["Proof URL", proofUrl],
  ] as const;

  const copyButtons = copyItems
    .map(
      ([label, value]) =>
        `<button type="button" class="chip" data-copy="${esc(value)}">${esc(label)}</button>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(OG_PROJECT_NAME)} — 0G proof</title>
  <meta name="description" content="${esc(OG_PROJECT_DESCRIPTION)}" />
  <style>
    :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; background: #09090b; color: #e4e4e7; line-height: 1.5; }
    .wrap { max-width: 56rem; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
    .eyebrow { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #67e8f9; }
    h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); margin: 0.5rem 0; }
    .lead { color: #a1a1aa; max-width: 42rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1.25rem 0 2rem; }
    a.btn, button.chip { border-radius: 9999px; font-size: 13px; padding: 0.45rem 0.9rem; cursor: pointer; }
    a.btn { background: #06b6d4; color: #042f2e; text-decoration: none; font-weight: 600; }
    button.chip { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); color: #e4e4e7; }
    button.chip:hover { background: rgba(255,255,255,0.08); }
    section { border: 1px solid rgba(255,255,255,0.08); border-radius: 1.25rem; padding: 1.25rem; margin-bottom: 1rem; background: rgba(255,255,255,0.02); }
    section.highlight { border-color: rgba(6,182,212,0.25); background: rgba(6,182,212,0.06); }
    .label { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #71717a; margin-bottom: 0.5rem; }
    .mono { font-family: ui-monospace, monospace; font-size: 13px; word-break: break-all; }
    a { color: #67e8f9; }
    #toast { position: fixed; bottom: 1rem; right: 1rem; background: #14532d; color: #dcfce7; padding: 0.5rem 0.75rem; border-radius: 0.5rem; display: none; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrap">
    <p class="eyebrow">0G APAC Hackathon</p>
    <h1>${esc(OG_PROJECT_NAME)}</h1>
    <p class="lead">${esc(OG_PROJECT_DESCRIPTION)}</p>
    <div class="actions">
      <a class="btn" href="${esc(ogExplorerAddressUrl(contract))}" target="_blank" rel="noreferrer">View on 0G ChainScan</a>
      <a class="btn" href="${esc(OG_HACKATHON_PAGE)}" target="_blank" rel="noreferrer">Open HackQuest</a>
      <a class="btn" href="${esc(`${OG_HACKATHON_REPO}/blob/main/${OG_HACKATHON_JUDGE_README}`)}" target="_blank" rel="noreferrer">Judge README</a>
    </div>
    <section class="highlight">
      <div class="label">Copy for HackQuest / X</div>
      <div class="actions">${copyButtons}</div>
    </section>
    <section>
      <div class="label">Network</div>
      <p>${esc(OG_CHAIN_NAME)} (chainId ${OG_CHAIN_ID}) · RPC <a href="${esc(OG_RPC)}">${esc(OG_RPC)}</a></p>
    </section>
    <section>
      <div class="label">Contract</div>
      <p class="mono">${esc(contract)}</p>
      <p><a href="${esc(ogExplorerAddressUrl(contract))}">Contract on ChainScan →</a></p>
    </section>
    <section>
      <div class="label">Proof transactions</div>
      <p>Deploy: <span class="mono">${esc(deployTx)}</span> · <a href="${esc(ogExplorerTxUrl(deployTx))}">tx</a></p>
      <p>Mint: <span class="mono">${esc(mintTx)}</span> · <a href="${esc(ogExplorerTxUrl(mintTx))}">tx</a></p>
    </section>
    <section>
      <div class="label">Token metadata</div>
      <p>Minted token #1 → <a href="/0g/agentid/1.json">/0g/agentid/1.json</a></p>
    </section>
    <section>
      <div class="label">Source</div>
      <p class="mono">${esc(OG_AGENT_ID_SOL_PATH)} · ${esc(OG_HACKATHON_REPO)}</p>
    </section>
  </div>
  <div id="toast">Copied</div>
  <script>
    document.querySelectorAll('[data-copy]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var text = btn.getAttribute('data-copy') || '';
        navigator.clipboard.writeText(text).then(function() {
          var t = document.getElementById('toast');
          if (t) { t.textContent = btn.textContent + ' copied'; t.style.display = 'block';
            setTimeout(function() { t.style.display = 'none'; }, 2000); }
        });
      });
    });
  </script>
</body>
</html>`;
}

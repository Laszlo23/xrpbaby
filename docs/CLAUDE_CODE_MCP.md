# Claude Code + Supabase MCP (this repo)

## 1. Project MCP config

[`/.mcp.json`](../.mcp.json) registers the **HTTP** Supabase MCP endpoint for project `duocnytkircadfswyvox` with docs, database, functions, storage, etc.

Equivalent CLI (if you install [Claude Code](https://docs.claude.com/en/docs/claude-code)):

```bash
claude mcp add --scope project --transport http supabase "https://mcp.supabase.com/mcp?project_ref=duocnytkircadfswyvox&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
```

## 2. Authenticate (your machine)

In a **regular terminal** (not necessarily the IDE), run Claude Code and complete MCP login:

```bash
claude /mcp
```

Choose **supabase** → **Authenticate** and finish the browser flow.

If Claude Code warns about project MCP servers, approve them once (or run `claude mcp reset-project-choices` to reset approvals).

## 3. Agent skills (installed)

Supabase skills were added under `.agents/skills/` via:

```bash
npx skills add supabase/agent-skills -y
```

Includes **Supabase** and **Postgres Best Practices** skill folders for Cursor / Claude Code / others.

## 4. Changing project

If you point MCP at another Supabase project, update the `project_ref` query parameter in [`.mcp.json`](../.mcp.json) and re-authenticate if prompted.

import { DynamicStructuredTool } from "@langchain/core/tools";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import {
  deleteStudioFile,
  listStudioFilePaths,
  readStudioFile,
  upsertStudioFile,
} from "@/server/studio/store";
import {
  getSandboxHealth,
  runSandboxCommand,
  syncSandboxFiles,
} from "@/server/studio/sandbox-client";

const ALLOWED_COMMANDS = new Set(["npm install", "npm run build", "npm run dev"]);

export function createStudioTools(
  prisma: PrismaClient,
  projectId: string,
  sandboxId: string | null,
  onFilesChanged: () => Promise<Record<string, string>>,
) {
  return [
    new DynamicStructuredTool({
      name: "list_files",
      description: "List all file paths in the project.",
      schema: z.object({}),
      func: async () => {
        const paths = await listStudioFilePaths(prisma, projectId);
        return JSON.stringify({ paths });
      },
    }),
    new DynamicStructuredTool({
      name: "read_file",
      description: "Read a project file by path.",
      schema: z.object({ path: z.string().min(1).max(500) }),
      func: async ({ path }) => {
        const content = await readStudioFile(prisma, projectId, path);
        if (content === null) return JSON.stringify({ error: "not_found", path });
        return JSON.stringify({ path, content });
      },
    }),
    new DynamicStructuredTool({
      name: "write_file",
      description: "Create or update a project file.",
      schema: z.object({
        path: z.string().min(1).max(500),
        content: z.string().max(200_000),
      }),
      func: async ({ path, content }) => {
        await upsertStudioFile(prisma, projectId, path, content);
        const files = await onFilesChanged();
        if (sandboxId) {
          await syncSandboxFiles(sandboxId, files);
        }
        return JSON.stringify({ ok: true, path });
      },
    }),
    new DynamicStructuredTool({
      name: "delete_file",
      description: "Delete a project file.",
      schema: z.object({ path: z.string().min(1).max(500) }),
      func: async ({ path }) => {
        const deleted = await deleteStudioFile(prisma, projectId, path);
        const files = await onFilesChanged();
        if (sandboxId) {
          await syncSandboxFiles(sandboxId, files);
        }
        return JSON.stringify({ ok: deleted, path });
      },
    }),
    new DynamicStructuredTool({
      name: "run_command",
      description: "Run npm install, npm run build, or npm run dev in the sandbox.",
      schema: z.object({ command: z.string().min(1).max(200) }),
      func: async ({ command }) => {
        const trimmed = command.trim();
        if (!ALLOWED_COMMANDS.has(trimmed)) {
          return JSON.stringify({ error: "command_not_allowed", allowed: [...ALLOWED_COMMANDS] });
        }
        if (!sandboxId) {
          return JSON.stringify({ error: "sandbox_not_running" });
        }
        const result = await runSandboxCommand(sandboxId, trimmed);
        return JSON.stringify(result);
      },
    }),
    new DynamicStructuredTool({
      name: "get_preview_errors",
      description: "Check sandbox Vite health and recent logs.",
      schema: z.object({}),
      func: async () => {
        if (!sandboxId) return JSON.stringify({ ready: false, logs: "no_sandbox" });
        const health = await getSandboxHealth(sandboxId);
        return JSON.stringify(health);
      },
    }),
  ];
}

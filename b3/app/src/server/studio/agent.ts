import type { BaseMessage } from "@langchain/core/messages";
import { HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import type { PrismaClient } from "@prisma/client";

import { createEliasChatModel } from "@/server/elias/llm-client";
import { STUDIO_AGENT_MAX_ITERATIONS } from "@/server/studio/config";
import { appendStudioMessage, getProjectFilesMap } from "@/server/studio/store";
import { createStudioTools } from "@/server/studio/tools";
import { syncSandboxFiles } from "@/server/studio/sandbox-client";

const STUDIO_SYSTEM = `You are BC Studio — Building Culture's app builder agent.

You edit a Vite + React + TypeScript project. Use tools to list, read, write, and delete files.
After meaningful edits, call get_preview_errors if a sandbox is running.

Rules:
- Build general-purpose web apps from user prompts.
- Keep changes focused and incremental.
- Never exfiltrate secrets or read .env files.
- Do not run destructive shell commands.
- Prefer accessible, clean UI with inline styles or simple CSS.
- Guidance only — you are not providing legal, financial, or medical advice.`;

export type StudioAgentResult = {
  assistantReply: string;
  toolCallsCount: number;
  offline?: boolean;
};

async function invokeTool(
  tool: { name: string; invoke: (input: Record<string, unknown>) => Promise<unknown> },
  args: Record<string, unknown>,
): Promise<string> {
  const out = await tool.invoke(args);
  return typeof out === "string" ? out : JSON.stringify(out);
}

export async function runStudioAgent(
  prisma: PrismaClient,
  projectId: string,
  userMessage: string,
  sandboxId: string | null,
): Promise<StudioAgentResult> {
  const model = createEliasChatModel({ temperature: 0.35 });
  if (!model) {
    const offline =
      "**BC Studio (offline)** — set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` on the server to enable the builder agent.";
    await appendStudioMessage(prisma, projectId, "assistant", offline);
    return { assistantReply: offline, toolCallsCount: 0, offline: true };
  }

  await appendStudioMessage(prisma, projectId, "user", userMessage);

  const filesMap = await getProjectFilesMap(prisma, projectId);
  const refreshFiles = async () => getProjectFilesMap(prisma, projectId);

  const tools = createStudioTools(prisma, projectId, sandboxId, refreshFiles);
  const modelWithTools = model.bindTools(tools);

  const fileIndex = Object.keys(filesMap).sort().join(", ");
  let messages: BaseMessage[] = [
    new SystemMessage(`${STUDIO_SYSTEM}\n\nCurrent files: ${fileIndex || "(empty)"}`),
    new HumanMessage(userMessage),
  ];

  let toolCallsCount = 0;
  let finalText = "";

  for (let i = 0; i < STUDIO_AGENT_MAX_ITERATIONS; i++) {
    const response = await modelWithTools.invoke(messages);
    const toolCalls = response.tool_calls ?? [];

    if (toolCalls.length === 0) {
      finalText =
        typeof response.content === "string" ? response.content : JSON.stringify(response.content);
      break;
    }

    messages = [...messages, response];
    toolCallsCount += toolCalls.length;

    for (const call of toolCalls) {
      const tool = tools.find((t) => t.name === call.name) as
        | { name: string; invoke: (input: Record<string, unknown>) => Promise<unknown> }
        | undefined;
      const args = (call.args ?? {}) as Record<string, unknown>;
      let output = JSON.stringify({ error: "unknown_tool" });
      if (tool) {
        try {
          output = await invokeTool(tool, args);
        } catch (e) {
          output = JSON.stringify({
            error: e instanceof Error ? e.message : "tool_failed",
          });
        }
      }
      messages.push(
        new ToolMessage({
          content: output,
          tool_call_id: call.id ?? `${call.name}-${i}`,
        }),
      );
    }
  }

  if (!finalText) {
    finalText = "I updated the project files. Check the preview panel for your app.";
  }

  await appendStudioMessage(prisma, projectId, "assistant", finalText, {
    toolCallsCount,
  });

  if (sandboxId) {
    const latest = await getProjectFilesMap(prisma, projectId);
    await syncSandboxFiles(sandboxId, latest);
  }

  return { assistantReply: finalText, toolCallsCount };
}

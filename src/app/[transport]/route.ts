// src/mcp/route.ts
import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = createMcpHandler((server) => {
  server.tool(
    "get_goals",
    "Get all current gaols with their descriptions and progress",
    {},
    async () => {
      const goals = await prisma.goal.findMany({
        include: { actions: true, deliverables: true, logs: true },
      });
      return {
        content: [
          {
            type: "text",
            text: goals
              .map(
                (g) =>
                  `📌 ${g.title} — ${g.percentComplete}% complete\n` +
                  `• ${g.description}\n`,
              )
              .join("\n"),
          },
        ],
      };
    },
  );

  server.tool(
    "list_goals_by_id",
    "List all goals with their IDs",
    {},
    async () => {
      const goals = await prisma.goal.findMany({
        select: { id: true, title: true },
      });
      return {
        content: [
          {
            type: "text",
            text: goals.map((g) => `ID: ${g.id} - ${g.title}`).join("\n"),
          },
        ],
      };
    },
  );

  server.tool(
    "log_action",
    "Log a note or progress update for a specific goal.",
    {
      goalId: z.string(),
      text: z.string(),
    },
    async ({ goalId, text }) => {
      await prisma.actionLog.create({
        data: { text, goalId },
      });

      return {
        content: [
          {
            type: "text",
            text: `✅ Logged: "${text}" for goal ID: ${goalId}`,
          },
        ],
      };
    },
  );

  server.tool(
    "get_goal",
    "Get details for a specific goal by ID",
    {
      goalId: z.string(),
    },
    async ({ goalId }) => {
      const goal = await prisma.goal.findUnique({
        where: { id: goalId },
        include: { actions: true, deliverables: true, logs: true },
      });

      if (!goal) {
        return {
          content: [
            {
              type: "text",
              text: `❌ Goal with ID ${goalId} not found.`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text:
              `📌 ${goal.title} — ${goal.percentComplete}% complete\n` +
              `• ${goal.description}\n` +
              `Actions:\n` +
              goal.actions.map((a) => `- ${a.text}`).join("\n") +
              "\n" +
              `Deliverables:\n` +
              goal.deliverables.map((d) => `- ${d.name}`).join("\n") +
              "\n" +
              `Logs:\n` +
              goal.logs
                .map((l) => `- ${l.text} (${l.timestamp.toLocaleString()})`)
                .join("\n"),
          },
        ],
      };
    },
  );

  server.tool(
    "get_logs",
    "View recent actions across all goals",
    {},
    async () => {
      const logs = await prisma.actionLog.findMany({
        orderBy: { timestamp: "desc" },
        take: 10,
        include: { goal: true },
      });

      return {
        content: [
          {
            type: "text",
            text: logs
              .map(
                (log) =>
                  `🕓 [${log.timestamp.toLocaleString()}] (${log.goal.title}): ${log.text}`,
              )
              .join("\n"),
          },
        ],
      };
    },
  );
}, {});

export { handler as GET, handler as POST };

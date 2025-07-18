// src/mcp/route.ts
import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const handler = createMcpHandler((server) => {
  server.tool(
    "get_goals",
    "Retrieve a list of all current goals with summaries, including percent complete and descriptions. Use this to get a high-level view before selecting a goal to drill into with get_goal.",
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
    "Get a compact list of all goal IDs and titles. Use this to identify a goal when you need to call tools like get_goal or log_action which require a goal ID.",
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
    "Log a progress update or activity note related to a goal by ID. Use this to track work or meetings. Combine with get_goal to view the latest state and get_logs to see recent entries.",
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
    "Retrieve detailed information about a specific goal, including actions, deliverables, and logs. Use the goal ID from get_goals or list_goals_by_id.",
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
    "Retrieve the 10 most recent log entries across all goals. Use this for a quick view of recent progress or to verify that log_action was successful.\n",
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

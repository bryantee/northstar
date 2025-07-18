import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MCP goals...");

  await prisma.goal.create({
    data: {
      title: "AI-Powered Feature",
      description:
        "Ship one AI-powered feature or prototype that improves workflow efficiency or UX.",
      why: "Builds applied AI experience and delivers tangible platform value. Informs the business of AI applicability through learnings.",
      timeline: "Idea validated and prototyped by Q3, shipped by Q4",
      percentComplete: 0,
      tags: "AI,Efficiency",
      deliverables: {
        create: [
          { name: "Production-ready AI feature", isDone: false },
          { name: "Demo video or presentation", isDone: false },
          { name: "Learnings documentation", isDone: false },
        ],
      },
      actions: {
        create: [
          { text: "Identify 2-3 AI opportunity areas", isComplete: false },
          {
            text: "Validate one idea with stakeholder feedback",
            isComplete: false,
          },
          { text: "Build prototype and iterate to launch", isComplete: false },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Design System Patterns",
      description:
        "Establish and document 3 high-impact UI/UX patterns in the design system and refactor key flows to adopt them.",
      why: "Improve design consistency and developer velocity.",
      timeline: "Audit by Q3, documentation and migration plan by Q4",
      percentComplete: 10,
      tags: "Design System,UX",
      deliverables: {
        create: [
          { name: "Pattern documentation in Storybook", isDone: false },
          { name: "Migration plan for 2–3 flows", isDone: false },
        ],
      },
      actions: {
        create: [
          {
            text: "Audit current patterns across workflows",
            isComplete: false,
          },
          {
            text: "Identify pattern gaps (Layout, Cards, Iconography)",
            isComplete: true,
          },
          {
            text: "Collaborate with product design on conventions",
            isComplete: false,
          },
          { text: "Document patterns in Storybook", isComplete: false },
          { text: "Plan migration of core areas", isComplete: false },
        ],
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Accessibility Best Practices",
      description:
        "Ensure 100% of new features meet WCAG 2.2 AA and establish accessibility best practices.",
      why: "Build inclusive UI, reduce tech debt, expand market reach and competitiveness through improved compliance.",
      timeline: "Docs by Q3, adoption of process by Q4",
      percentComplete: 0,
      tags: "Accessibility,Compliance",
      deliverables: {
        create: [
          { name: "Accessibility checklist", isDone: false },
          { name: "Automation tooling for verification", isDone: false },
          { name: "Proof of compliance for new features", isDone: false },
        ],
      },
      actions: {
        create: [
          {
            text: "Complete accessibility training or cert",
            isComplete: false,
          },
          {
            text: "Create automation tools for verification",
            isComplete: false,
          },
          {
            text: "Partner with QE to add accessibility reviews",
            isComplete: false,
          },
          { text: "Host team learning session", isComplete: false },
        ],
      },
    },
  });

  console.log("✅ Done seeding.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

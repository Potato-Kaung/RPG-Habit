
import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      playerLevel,
      theme,
      activeQuests,
      completedQuests,
      availableSlots,
    } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    if (
      !Number.isInteger(availableSlots) ||
      availableSlots < 1 ||
      availableSlots > 5
    ) {
      return NextResponse.json(
        { error: "No available quest slots." },
        { status: 400 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      instructions: `
You are the AI Quest Master of QuestForge, an RPG productivity game.

Generate realistic, useful quests based on the player's history and RPG theme.

Rules:
- Generate exactly the requested number of quests.
- Avoid duplicates of active and recently completed quests.
- Adapt difficulty to the player's level and history.
- Make tasks measurable and achievable.
- Use the selected RPG theme for quest titles and storytelling.
- Rewards should be reasonable.
- Return valid JSON only.
      `,
      input: JSON.stringify({
        playerLevel,
        theme,
        activeQuests,
        completedQuests,
        requestedQuestCount: availableSlots,
      }),
      text: {
        format: {
          type: "json_schema",
          name: "quest_suggestions",
          strict: true,
          schema: {
            type: "object",
            properties: {
              quests: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    difficulty: {
                      type: "string",
                      enum: ["Easy", "Medium", "Hard"],
                    },
                    estimatedMinutes: { type: "integer" },
                    xpReward: { type: "integer" },
                    goldReward: { type: "integer" },
                    completionCondition: { type: "string" },
                  },
                  required: [
                    "title",
                    "description",
                    "category",
                    "difficulty",
                    "estimatedMinutes",
                    "xpReward",
                    "goldReward",
                    "completionCondition",
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ["quests"],
            additionalProperties: false,
          },
        },
      },
    });

    const result = JSON.parse(response.output_text);

    if (
      !Array.isArray(result.quests) ||
      result.quests.length !== availableSlots
    ) {
      throw new Error("AI returned an unexpected number of quests.");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Quest generation failed:", error);

    return NextResponse.json(
      { error: "Failed to generate quests. Please try again." },
      { status: 500 }
    );
  }
}

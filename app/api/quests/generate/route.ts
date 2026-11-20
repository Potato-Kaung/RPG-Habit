
import OpenAI from "openai";
import { NextResponse } from "next/server";





const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      playerLevel = 1,
      theme = "fantasy",
      activeQuests = [],
      completedQuests = [],
      availableMinutes = 30,
    } = body;

    const response = await openai.responses.create({
      model: "gpt-5-mini",

      input: [
        {
          role: "system",
          content: `
You are an AI Quest Master for a gamified productivity RPG.

Create exactly ONE personalized quest.

Rules:
- Make the quest realistic and achievable.
- Make it measurable and clearly completable.
- Avoid duplicating active quests.
- Use completed quests to avoid repetitive suggestions.
- Difficulty must match the player's level.
- The quest must fit the available time.
- Do not make the quest dangerous or unhealthy.
- Do not directly award rewards. Rewards are handled by the game.
- Use the fantasy RPG theme for wording.
- XP reward must be between 10 and 50.
- Gold reward must be between 5 and 20.
- Return only the requested JSON structure.
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            playerLevel,
            theme,
            activeQuests,
            completedQuests,
            availableMinutes,
          }),
        },
      ],

      text: {
        format: {
          type: "json_schema",
          name: "ai_quest",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: {
                type: "string",
              },
              description: {
                type: "string",
              },
              category: {
                type: "string",
              },
              difficulty: {
                type: "string",
                enum: ["Easy", "Medium", "Hard"],
              },
              estimatedMinutes: {
                type: "integer",
              },
              xpReward: {
                type: "integer",
              },
              goldReward: {
                type: "integer",
              },
              completionCondition: {
                type: "string",
              },
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
    });

    const quest = JSON.parse(response.output_text);

    return NextResponse.json({
      quest,
    });
  } catch (error) {
    console.error("AI Quest API error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate AI quest.",
      },
      { status: 500 }
    );
  }
}
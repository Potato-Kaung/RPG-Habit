import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const SYSTEM_PROMPT = `
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

Reply with ONLY a JSON object, no other text, with exactly these keys:
{
  "title": string,
  "description": string,
  "category": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "estimatedMinutes": integer,
  "xpReward": integer,
  "goldReward": integer,
  "completionCondition": string
}
`;

// Keep a number inside a range (the server never trusts the AI's numbers).
function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Only pass short titles to the AI, and no more than 10 of them.
function cleanTitles(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .slice(0, 10)
    .map((q) => String((q as { title?: unknown })?.title ?? "").slice(0, 100))
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    // 1) The user must be logged in (otherwise anyone could use your AI quota).
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    // 2) The API key must exist. Created inside the handler so a missing key
    //    returns a readable JSON error instead of crashing the whole route.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    // 3) Read and limit what the browser sent.
    const body = await request.json();
    const playerLevel = clamp(body.playerLevel, 1, 999, 1);
    const theme = String(body.theme ?? "fantasy").slice(0, 30);
    const availableMinutes = clamp(body.availableMinutes, 5, 240, 30);
    const activeQuests = cleanTitles(body.activeQuests);
    const completedQuests = cleanTitles(body.completedQuests);

    // 4) Ask Gemini.
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      contents: JSON.stringify({
        playerLevel,
        theme,
        activeQuests,
        completedQuests,
        availableMinutes,
      }),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
      },
    });

    // 5) Parse and validate. Never trust the AI's output as-is.
    const text = (response.text ?? "").replace(/```json|```/g, "").trim();
    const raw = JSON.parse(text);

    const quest = {
      title: String(raw.title ?? "").slice(0, 100),
      description: String(raw.description ?? "").slice(0, 300),
      category: String(raw.category ?? "General").slice(0, 30),
      difficulty: ["Easy", "Medium", "Hard"].includes(raw.difficulty)
        ? raw.difficulty
        : "Medium",
      estimatedMinutes: clamp(raw.estimatedMinutes, 1, 240, availableMinutes),
      xpReward: clamp(raw.xpReward, 10, 50, 20),
      goldReward: clamp(raw.goldReward, 5, 20, 10),
      completionCondition: String(raw.completionCondition ?? "").slice(0, 200),
    };

    if (!quest.title) {
      throw new Error("The AI returned an empty quest. Please try again.");
    }

    return NextResponse.json({ quest });
  } catch (error) {
    console.error("AI Quest API error:", error);

    const message = error instanceof Error ? error.message : "";
    const friendly =
      message.includes("429") || message.includes("RESOURCE_EXHAUSTED")
        ? "The free AI limit has been reached for now. Please try again later."
        : "Could not generate a quest. Please try again.";

    return NextResponse.json({ error: friendly }, { status: 500 });
  }
}

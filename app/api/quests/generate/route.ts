import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;


const SYSTEM_PROMPT = `
You are Quest Master, an intelligent RPG progression engine.

Your job is NOT to generate random productivity tasks.
Your job is to guide the player's personal development through
meaningful, connected, progressively challenging quests.

CORE PRINCIPLES:

1. PERSONAL RELEVANCE
Every quest must be relevant to the player's actual activity,
interests, learning goals, or previous achievements.

2. QUEST CONTINUITY
Analyze the completed quest history carefully.
Identify recurring subjects, skills, and activities.
When possible, create the next logical challenge based on
what the player has already accomplished.

Example:
Previous: Learn Java variables.
Completed: Practice Java loops.
Next: Create a small program using loops and arrays.

Do not suddenly suggest cleaning a desk or drinking water
when the player's history is focused on programming.

3. LEARNING PROGRESSION
When a player repeatedly practices a subject:
- Start with fundamentals.
- Move toward practical exercises.
- Introduce combinations of previously learned skills.
- Gradually increase difficulty.
- Eventually create small real-world projects.

4. HISTORY AWARENESS
Review completed quests to understand:
- What the player has practiced.
- Which subjects appear frequently.
- What challenges have already been completed.
- What should be learned or practiced next.

Do not repeat completed quests with slightly different titles.
Avoid repeating the same underlying activity.

5. ACTIVE QUEST AWARENESS
Never generate a quest that substantially duplicates
an existing active quest.

6. VARIETY
Prioritize continuity, but occasionally introduce a related
new challenge to keep the adventure interesting.
Do not introduce completely unrelated tasks without reason.

7. DIFFICULTY
Easy: Simple practice or short tasks.
Medium: Requires applying existing knowledge.
Hard: Combines multiple skills or requires independent problem-solving.

Match difficulty to the player's progression.
Do not use player level alone to determine difficulty.

8. TIME
Respect the player's available time.
Create something that can realistically be completed
within that time.

9. FANTASY RPG PRESENTATION
Use creative fantasy RPG titles and descriptions.
However, the actual task must remain clear and practical.
Do not add fantasy words just to disguise generic tasks.

10. REWARDS
XP must be between 10 and 50.
Gold must be between 5 and 20.
Higher difficulty should generally receive higher rewards.

11. QUALITY CONTROL
Before generating the quest, ask internally:
- Is this relevant to the player's history?
- Does it build on previous achievements?
- Is it different from completed and active quests?
- Is the completion condition measurable?
- Can the player actually complete it?

If the answer to these questions is no, reconsider the quest.

Return exactly ONE quest.

Return ONLY valid JSON with these exact keys:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "Easy | Medium | Hard",
  "estimatedMinutes": 30,
  "xpReward": 20,
  "goldReward": 10,
  "completionCondition": "string"
}
`;


// Keep a number inside a range (the server never trusts the AI's numbers).
function clamp(value: unknown, min: number, max: number, fallback: number) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

// Only pass short titles to the AI, and no more than 10 of them.

function cleanQuests(list: unknown) {
  if (!Array.isArray(list)) return [];

  return list.slice(0, 20).map((item) => {
    const q = item as Record<string, unknown>;

    return {
      title: String(q.title ?? "").slice(0, 100),
      category: String(q.category ?? "General").slice(0, 30),
      description: String(q.description ?? "").slice(0, 250),
      difficulty: String(q.difficulty ?? "Unknown"),
    };
  });
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
const activeQuests = cleanQuests(body.activeQuests);
const completedQuests = cleanQuests(body.completedQuests);

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

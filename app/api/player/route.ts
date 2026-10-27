
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/oracle";

export async function GET() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT USER_ID, XP, HP, PLAYER_LEVEL, GOLD
       FROM USER_STATUS
       WHERE USER_ID = :userId`,
      { userId: 1 },
      { outFormat: 4002 }
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    

    
const row = result.rows[0] as Record<string, number>;

return NextResponse.json({
  success: true,
  player: {
    userId: row.USER_ID,
    xp: row.XP,
    hp: row.HP,
    level: row.PLAYER_LEVEL,
    gold: row.GOLD,
  },
});

  } catch (error) {
    console.error("Player API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load player" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.close();
  }
}

export async function PUT(request: Request) {
  let connection;

  try {
    const body = await request.json();
    const { xp, hp, level, gold } = body;

    if (
      !Number.isInteger(xp) || xp < 0 ||
      !Number.isInteger(hp) || hp < 0 ||
      !Number.isInteger(level) || level < 1 ||
      !Number.isInteger(gold) || gold < 0
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid player stats" },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const result = await connection.execute(
      `UPDATE USER_STATUS
       SET XP = :xp,
           HP = :hp,
           PLAYER_LEVEL = :playerlevel,
           GOLD = :gold
       WHERE USER_ID = :userId`,
      {
        xp,
        hp,
        playerlevel:level,
        gold,
        userId: 1,
      },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player stats saved",
    });
  } catch (error) {
    console.error("Save player API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to save player stats" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.close();
  }
}


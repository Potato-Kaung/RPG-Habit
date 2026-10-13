
import { NextResponse } from "next/server";
import { getConnection } from "@/lib/oracle";

export async function GET() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT TASK_ID, TASK_NAME, DESCRIPTION,
              XP_REWARD, HP_COST, GOLD_REWARD, USER_ID
       FROM TASKS
       ORDER BY TASK_ID`,
      [],
      { outFormat: 4002 }
    );

    return NextResponse.json({
      success: true,
      tasks: result.rows,
    });
  } catch (error) {
    console.error("Tasks API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to load tasks" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.close();
  }
}

export async function POST(request: Request) {
  let connection;

  try {
    const body = await request.json();
    const title = body.title?.trim();

    if (!title || title.length > 100) {
      return NextResponse.json(
        { success: false, error: "Task name must be 1–100 characters." },
        { status: 400 }
      );
    }

    connection = await getConnection();

    const xpReward = Math.floor(Math.random() * 41) + 10;

    const result = await connection.execute(
      `INSERT INTO TASKS
         (TASK_NAME, XP_REWARD, HP_COST, GOLD_REWARD)
       VALUES
         (:title, :xpReward, 0, 5)
       RETURNING TASK_ID INTO :taskId`,
      {
        title,
        xpReward,
        taskId: { dir: 3003, type: 2010 },
      },
      { autoCommit: true }
    );

    return NextResponse.json({
      success: true,
      task: {
        id: String(result.outBinds?.taskId),
        title,
        xpReward,
        goldReward: 5,
        completed: false,
      },
    });
  } catch (error) {
    console.error("Create task API error:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create task" },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.close();
  }
}

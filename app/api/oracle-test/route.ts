import { NextResponse } from "next/server";
import { getConnection } from "@/lib/oracle";

export async function GET() {
  let connection;

  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT 'Oracle connection successful!' AS MESSAGE FROM DUAL`
    );

    return NextResponse.json({
      success: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Oracle error:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}
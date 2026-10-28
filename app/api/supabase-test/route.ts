
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("rewards")
    .select("id, name")
    .limit(1);

  if (error) {
    console.error("Supabase test error:", error.message);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Supabase connection successful!",
    rewards: data,
  });
}

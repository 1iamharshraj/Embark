import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { message: "Purchase packages through the order payment flow" },
    { status: 400 }
  );
}

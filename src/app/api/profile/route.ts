import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Profile endpoint" });
}

export async function POST() {
  return NextResponse.json({ message: "Profile created/updated" });
}

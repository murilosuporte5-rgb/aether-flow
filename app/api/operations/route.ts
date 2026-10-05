import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Esta área não faz parte do MVP." }, { status: 404 });
}

export function POST() {
  return NextResponse.json({ error: "Esta área não faz parte do MVP." }, { status: 404 });
}

// app/api/auth/session/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// API Route : Récupérer la session admin actuelle
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSession } from "@/lib/jwt";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la session" },
      { status: 500 }
    );
  }
}
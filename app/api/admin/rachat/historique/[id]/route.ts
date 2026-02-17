// app/api/admin/rachat/historique/[id]/route.ts
// Récupère le détail complet d'une estimation sauvegardée

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()

    const { id } = await context.params

    const estimation = await prisma.rachatEstimation.findUnique({
      where: { id },
    })

    if (!estimation) {
      return NextResponse.json(
        { error: 'Estimation introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ estimation })
  } catch (error) {
    console.error('Erreur récupération détail estimation:', error)

    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
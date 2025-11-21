import { NextResponse } from 'next/server';
import { createPlayer } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, ...playerData } = body;

    if (!tournamentId || !playerData.teamId || !playerData.playerName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const newPlayer = await createPlayer(tournamentId, playerData);
    return NextResponse.json(newPlayer);
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { error: '選手の作成に失敗しました' },
      { status: 500 }
    );
  }
}

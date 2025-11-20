import { NextResponse } from 'next/server';
import { createGame } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, ...gameData } = body;

    if (!tournamentId || !gameData.teamHomeId || !gameData.teamAwayId || !gameData.gameType || !gameData.scheduledDate || !gameData.scheduledTime) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const newGame = await createGame(tournamentId, gameData);
    return NextResponse.json(newGame);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: '試合の作成に失敗しました' },
      { status: 500 }
    );
  }
}

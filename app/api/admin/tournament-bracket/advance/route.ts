import { NextResponse } from 'next/server';
import { advanceTournamentWinner } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, gameId, winnerId } = body;

    if (!tournamentId || !gameId || !winnerId) {
      return NextResponse.json(
        { error: 'tournamentId、gameId、winnerIdが必要です' },
        { status: 400 }
      );
    }

    await advanceTournamentWinner(tournamentId, gameId, winnerId);

    return NextResponse.json({
      success: true,
      message: '勝者を次のラウンドに進めました',
    });
  } catch (error) {
    console.error('Error advancing winner:', error);
    return NextResponse.json(
      { error: '勝者の進行に失敗しました' },
      { status: 500 }
    );
  }
}

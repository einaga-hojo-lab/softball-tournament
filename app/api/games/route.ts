import { NextResponse } from 'next/server';
import { getGames, getCurrentTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournament = await getCurrentTournament();

    if (!tournament) {
      return NextResponse.json(
        { error: 'アクティブな大会が見つかりません' },
        { status: 404 }
      );
    }

    const games = await getGames(tournament.tournamentId);
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json(
      { error: '試合情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

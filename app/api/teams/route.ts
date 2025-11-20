import { NextResponse } from 'next/server';
import { getTeams, getCurrentTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournament = await getCurrentTournament();

    if (!tournament) {
      return NextResponse.json(
        { error: 'アクティブな大会が見つかりません' },
        { status: 404 }
      );
    }

    const teams = await getTeams(tournament.tournamentId);
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'チーム情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

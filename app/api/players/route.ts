import { NextResponse } from 'next/server';
import { getPlayers, getCurrentTournament } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    let targetTournamentId: string;

    if (tournamentId) {
      targetTournamentId = tournamentId;
    } else {
      const tournament = await getCurrentTournament();
      if (!tournament) {
        return NextResponse.json(
          { error: 'アクティブな大会が見つかりません' },
          { status: 404 }
        );
      }
      targetTournamentId = tournament.tournamentId;
    }

    const players = await getPlayers(targetTournamentId);
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: '選手情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

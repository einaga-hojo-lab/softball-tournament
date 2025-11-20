import { NextResponse } from 'next/server';
import { getPlayerStats, getCurrentTournament } from '@/lib/googleSheets';

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

    const stats = await getPlayerStats(targetTournamentId);

    // 打率の高い順にソート
    const sortedStats = stats.sort((a, b) => b.battingAverage - a.battingAverage);

    return NextResponse.json(sortedStats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json(
      { error: '個人成績の取得に失敗しました' },
      { status: 500 }
    );
  }
}

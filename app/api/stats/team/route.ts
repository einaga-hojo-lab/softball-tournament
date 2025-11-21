import { NextResponse } from 'next/server';
import { getTeamStats, getCurrentTournament } from '@/lib/googleSheets';

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

    const stats = await getTeamStats(targetTournamentId);

    // 勝率の高い順にソート
    const sortedStats = stats.sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      return b.runDifferential - a.runDifferential;
    });

    return NextResponse.json(sortedStats);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: 'チーム統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}

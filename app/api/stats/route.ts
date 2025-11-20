import { NextResponse } from 'next/server';
import { getPlayerStats, getCurrentTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournament = await getCurrentTournament();

    if (!tournament) {
      return NextResponse.json(
        { error: 'アクティブな大会が見つかりません' },
        { status: 404 }
      );
    }

    const stats = await getPlayerStats(tournament.tournamentId);

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

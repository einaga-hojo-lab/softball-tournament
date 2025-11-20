import { NextResponse } from 'next/server';
import { getLeagueStandings, getCurrentTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournament = await getCurrentTournament();

    if (!tournament) {
      return NextResponse.json(
        { error: 'アクティブな大会が見つかりません' },
        { status: 404 }
      );
    }

    const standings = await getLeagueStandings(tournament.tournamentId);

    // ブロックごとにグループ化
    const groupedByBlock: { [block: string]: typeof standings } = {};
    standings.forEach(standing => {
      if (!groupedByBlock[standing.block]) {
        groupedByBlock[standing.block] = [];
      }
      groupedByBlock[standing.block].push(standing);
    });

    // 各ブロック内で順位順にソート
    Object.keys(groupedByBlock).forEach(block => {
      groupedByBlock[block].sort((a, b) => a.rank - b.rank);
    });

    return NextResponse.json(groupedByBlock);
  } catch (error) {
    console.error('Error fetching league standings:', error);
    return NextResponse.json(
      { error: 'リーグ順位表の取得に失敗しました' },
      { status: 500 }
    );
  }
}

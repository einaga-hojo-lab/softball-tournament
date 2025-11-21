import { NextResponse } from 'next/server';
import { generateTournamentBracket } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, teamIds, useSeedRanking } = body;

    if (!tournamentId || !teamIds || !Array.isArray(teamIds)) {
      return NextResponse.json(
        { error: 'tournamentIdとteamIds（配列）が必要です' },
        { status: 400 }
      );
    }

    const bracket = await generateTournamentBracket(
      tournamentId,
      teamIds,
      useSeedRanking || false
    );

    return NextResponse.json(bracket);
  } catch (error) {
    console.error('Error generating tournament bracket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'トーナメント表の生成に失敗しました' },
      { status: 500 }
    );
  }
}

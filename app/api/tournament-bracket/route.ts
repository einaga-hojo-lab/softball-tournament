import { NextResponse } from 'next/server';
import { getTournamentBracket } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'tournamentIdが必要です' },
        { status: 400 }
      );
    }

    const bracket = await getTournamentBracket(tournamentId);
    return NextResponse.json(bracket);
  } catch (error) {
    console.error('Error fetching tournament bracket:', error);
    return NextResponse.json(
      { error: 'トーナメント表の取得に失敗しました' },
      { status: 500 }
    );
  }
}

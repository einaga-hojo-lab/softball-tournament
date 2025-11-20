import { NextResponse } from 'next/server';
import { getCurrentTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournament = await getCurrentTournament();

    if (!tournament) {
      return NextResponse.json(
        { error: 'アクティブな大会が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return NextResponse.json(
      { error: '大会情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

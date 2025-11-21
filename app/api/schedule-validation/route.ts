import { NextResponse } from 'next/server';
import { validateSchedule } from '@/lib/googleSheets';

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

    const conflicts = await validateSchedule(tournamentId);
    return NextResponse.json(conflicts);
  } catch (error) {
    console.error('Error validating schedule:', error);
    return NextResponse.json(
      { error: 'スケジュール検証に失敗しました' },
      { status: 500 }
    );
  }
}

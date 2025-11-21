import { NextResponse } from 'next/server';
import { getInnings, updateInning } from '@/lib/googleSheets';
import { Inning } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { error: 'gameIdが必要です' },
        { status: 400 }
      );
    }

    const innings = await getInnings(gameId);
    return NextResponse.json(innings);
  } catch (error) {
    console.error('Error fetching innings:', error);
    return NextResponse.json(
      { error: 'イニング情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gameId, inning, homeScore, awayScore } = body;

    if (!gameId || inning === undefined || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: 'gameId、inning、homeScore、awayScoreが必要です' },
        { status: 400 }
      );
    }

    const inningData: Inning = {
      gameId,
      inning: parseInt(inning),
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
    };

    await updateInning(inningData);

    return NextResponse.json({
      success: true,
      message: 'イニング情報を更新しました',
    });
  } catch (error) {
    console.error('Error updating inning:', error);
    return NextResponse.json(
      { error: 'イニング情報の更新に失敗しました' },
      { status: 500 }
    );
  }
}

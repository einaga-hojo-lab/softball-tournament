import { NextResponse } from 'next/server';
import { getAtBats, addAtBat } from '@/lib/googleSheets';
import { AtBat, AtBatResult } from '@/lib/types';

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

    const atBats = await getAtBats(gameId);
    return NextResponse.json(atBats);
  } catch (error) {
    console.error('Error fetching at-bats:', error);
    return NextResponse.json(
      { error: '打席記録の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      gameId,
      inning,
      teamId,
      playerId,
      battingOrder,
      result,
      bases,
      isHomerun,
      rbi,
      notes,
    } = body;

    if (
      !gameId ||
      inning === undefined ||
      !teamId ||
      !playerId ||
      battingOrder === undefined ||
      !result
    ) {
      return NextResponse.json(
        {
          error:
            'gameId、inning、teamId、playerId、battingOrder、resultが必要です',
        },
        { status: 400 }
      );
    }

    const atBat: AtBat = {
      gameId,
      inning: parseInt(inning),
      teamId,
      playerId,
      battingOrder: parseInt(battingOrder),
      result: result as AtBatResult,
      bases: parseInt(bases || '0'),
      isHomerun: isHomerun === true || isHomerun === 'true',
      rbi: parseInt(rbi || '0'),
      notes,
    };

    await addAtBat(atBat);

    return NextResponse.json({
      success: true,
      message: '打席記録を追加しました',
    });
  } catch (error) {
    console.error('Error adding at-bat:', error);
    return NextResponse.json(
      { error: '打席記録の追加に失敗しました' },
      { status: 500 }
    );
  }
}

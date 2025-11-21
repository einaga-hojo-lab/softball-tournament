import { NextResponse } from 'next/server';
import { updateGameScore } from '@/lib/googleSheets';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { tournamentId, scoreHome, scoreAway, status } = body;

    if (!tournamentId || scoreHome === undefined || scoreAway === undefined || !status) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    await updateGameScore(tournamentId, gameId, {
      scoreHome,
      scoreAway,
      status,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating game score:', error);
    return NextResponse.json(
      { error: 'スコアの更新に失敗しました' },
      { status: 500 }
    );
  }
}

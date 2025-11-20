import { NextResponse } from 'next/server';
import { getTournamentById, updateTournamentStatus, deleteTournament } from '@/lib/googleSheets';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  try {
    const { tournamentId } = await params;
    const tournament = await getTournamentById(tournamentId);

    if (!tournament) {
      return NextResponse.json(
        { error: '大会が見つかりません' },
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  try {
    const { tournamentId } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'ステータスが指定されていません' },
        { status: 400 }
      );
    }

    await updateTournamentStatus(tournamentId, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating tournament status:', error);
    return NextResponse.json(
      { error: 'ステータスの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tournamentId: string }> }
) {
  try {
    const { tournamentId } = await params;
    await deleteTournament(tournamentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: '大会の削除に失敗しました' },
      { status: 500 }
    );
  }
}

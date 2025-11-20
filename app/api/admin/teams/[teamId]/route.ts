import { NextResponse } from 'next/server';
import { updateTeam, deleteTeam } from '@/lib/googleSheets';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const { tournamentId, ...teamData } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'tournament IDが必要です' },
        { status: 400 }
      );
    }

    await updateTeam(tournamentId, teamId, teamData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json(
      { error: 'チームの更新に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'tournamentIdが必要です' },
        { status: 400 }
      );
    }

    await deleteTeam(tournamentId, teamId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json(
      { error: 'チームの削除に失敗しました' },
      { status: 500 }
    );
  }
}

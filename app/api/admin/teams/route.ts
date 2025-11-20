import { NextResponse } from 'next/server';
import { createTeam } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, ...teamData } = body;

    if (!tournamentId || !teamData.teamName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    const newTeam = await createTeam(tournamentId, teamData);
    return NextResponse.json(newTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'チームの作成に失敗しました' },
      { status: 500 }
    );
  }
}

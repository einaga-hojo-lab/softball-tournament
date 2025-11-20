import { NextResponse } from 'next/server';
import { getTournaments, createTournament } from '@/lib/googleSheets';

export async function GET() {
  try {
    const tournaments = await getTournaments();
    return NextResponse.json(tournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: '大会一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentName, tournamentDate, season, year, previousTournamentId } = body;

    if (!tournamentName || !tournamentDate || !season || !year) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }

    const tournament = await createTournament({
      tournamentName,
      tournamentDate,
      season,
      year: parseInt(year),
      previousTournamentId,
    });

    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: '大会の作成に失敗しました' },
      { status: 500 }
    );
  }
}

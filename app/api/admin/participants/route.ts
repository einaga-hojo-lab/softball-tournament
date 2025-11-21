import { NextResponse } from 'next/server';
import { getParticipants, createParticipant } from '@/lib/googleSheets';

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

    const participants = await getParticipants(tournamentId);
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: '参加者情報の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId, ...participantData } = body;

    if (!tournamentId) {
      return NextResponse.json(
        { error: 'tournamentIdが必要です' },
        { status: 400 }
      );
    }

    const newParticipant = await createParticipant(tournamentId, participantData);
    return NextResponse.json(newParticipant);
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: '参加者の登録に失敗しました' },
      { status: 500 }
    );
  }
}

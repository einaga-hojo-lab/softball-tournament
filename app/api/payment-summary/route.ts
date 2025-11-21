import { NextResponse } from 'next/server';
import { getPaymentSummary } from '@/lib/googleSheets';

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

    const summary = await getPaymentSummary(tournamentId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    return NextResponse.json(
      { error: '集金サマリーの取得に失敗しました' },
      { status: 500 }
    );
  }
}

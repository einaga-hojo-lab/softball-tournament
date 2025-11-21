import { NextResponse } from 'next/server';
import { getParticipants } from '@/lib/googleSheets';

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

    // CSVヘッダー
    const headers = [
      '参加者ID',
      'チーム名',
      '選手名',
      'メールアドレス',
      '電話番号',
      '支払いステータス',
      '支払い方法',
      '支払い日',
      '参加費',
      '登録日',
      '備考',
    ];

    // CSVデータを作成
    const csvRows = [headers.join(',')];
    participants.forEach(participant => {
      const row = [
        participant.participantId,
        `"${participant.teamName}"`,
        `"${participant.playerName}"`,
        participant.email,
        participant.phone,
        participant.paymentStatus === 'paid' ? '支払済' :
        participant.paymentStatus === 'unpaid' ? '未払い' :
        participant.paymentStatus === 'exempted' ? '免除' : '返金済',
        participant.paymentMethod === 'paypay' ? 'PayPay' :
        participant.paymentMethod === 'bank_transfer' ? '銀行振込' :
        participant.paymentMethod === 'cash' ? '現金' :
        participant.paymentMethod === 'other' ? 'その他' : '',
        participant.paymentDate || '',
        participant.paymentAmount,
        participant.registrationDate,
        `"${participant.notes || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // UTF-8 BOM付きで返す
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    return new Response(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="participants_${tournamentId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting participants:', error);
    return NextResponse.json(
      { error: '参加者データのエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

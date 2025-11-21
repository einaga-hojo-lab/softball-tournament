import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/googleSheets';

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

    const teams = await getTeams(tournamentId);

    // CSVヘッダー
    const headers = [
      'チームID',
      'チーム名',
      'ブロック',
      '合同チーム',
      'シード順位',
      '前回順位',
      '代表者名',
      'メールアドレス',
      'メンバー数',
      '備考',
    ];

    // CSVデータを作成
    const csvRows = [headers.join(',')];
    teams.forEach(team => {
      const row = [
        team.teamId,
        `"${team.teamName}"`,
        team.block || '',
        team.combinedTeam ? 'はい' : 'いいえ',
        team.seedRank || '',
        team.previousRank || '',
        `"${team.captainName || ''}"`,
        team.captainEmail || '',
        team.memberCount || '',
        `"${team.notes || ''}"`,
      ];
      csvRows.push(row.join(','));
    });

    const csv = csvRows.join('\n');

    // UTF-8 BOM付きで返す（Excelでの文字化け防止）
    const bom = '\uFEFF';
    const csvWithBom = bom + csv;

    return new Response(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teams_${tournamentId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting teams:', error);
    return NextResponse.json(
      { error: 'チームデータのエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

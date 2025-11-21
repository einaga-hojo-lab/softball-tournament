import { NextResponse } from 'next/server';
import { getPlayers, getTeams } from '@/lib/googleSheets';

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

    const [players, teams] = await Promise.all([
      getPlayers(tournamentId),
      getTeams(tournamentId)
    ]);

    // チームIDとチーム名のマッピング
    const teamMap: { [teamId: string]: string } = {};
    teams.forEach(team => {
      teamMap[team.teamId] = team.teamName;
    });

    // CSVヘッダー
    const headers = [
      '選手ID',
      'チームID',
      'チーム名',
      '選手名',
      '背番号',
      'ポジション',
    ];

    // CSVデータを作成
    const csvRows = [headers.join(',')];
    players.forEach(player => {
      const row = [
        player.playerId,
        player.teamId,
        `"${teamMap[player.teamId] || player.teamId}"`,
        `"${player.playerName}"`,
        player.uniformNumber || '',
        player.position || '',
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
        'Content-Disposition': `attachment; filename="players_${tournamentId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting players:', error);
    return NextResponse.json(
      { error: '選手データのエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getGames, getTeams } from '@/lib/googleSheets';

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

    const [games, teams] = await Promise.all([
      getGames(tournamentId),
      getTeams(tournamentId)
    ]);

    // チームIDとチーム名のマッピング
    const teamMap: { [teamId: string]: string } = {};
    teams.forEach(team => {
      teamMap[team.teamId] = team.teamName;
    });

    // CSVヘッダー
    const headers = [
      '試合ID',
      '試合タイプ',
      'ラウンド',
      'ブロック',
      'ホームチームID',
      'ホームチーム名',
      'アウェイチームID',
      'アウェイチーム名',
      '日付',
      '時間',
      '会場',
      'ステータス',
      'ホームスコア',
      'アウェイスコア',
      '記録者',
    ];

    // CSVデータを作成
    const csvRows = [headers.join(',')];
    games.forEach(game => {
      const row = [
        game.gameId,
        game.gameType === 'league' ? 'リーグ戦' : 'トーナメント',
        game.round || '',
        game.block || '',
        game.teamHomeId,
        `"${teamMap[game.teamHomeId] || game.teamHomeId}"`,
        game.teamAwayId,
        `"${teamMap[game.teamAwayId] || game.teamAwayId}"`,
        game.scheduledDate || '',
        game.scheduledTime || '',
        game.groundNumber || '',
        game.status === 'scheduled' ? '予定' :
        game.status === 'in_progress' ? '進行中' :
        game.status === 'completed' ? '完了' :
        game.status === 'cancelled' ? '中止' : '延期',
        game.scoreHome,
        game.scoreAway,
        game.recorder || '',
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
        'Content-Disposition': `attachment; filename="games_${tournamentId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting games:', error);
    return NextResponse.json(
      { error: '試合データのエクスポートに失敗しました' },
      { status: 500 }
    );
  }
}

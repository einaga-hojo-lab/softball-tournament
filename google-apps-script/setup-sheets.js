/**
 * ソフトボール大会管理システム - Google Sheets自動セットアップスクリプト
 *
 * 使い方:
 * 1. Google Sheets (ID: 1hE4zyNoE4kesA7Ysb5eV9U-RI8nmw4Uwj-A3WbThJPM) を開く
 * 2. 拡張機能 → Apps Script をクリック
 * 3. このスクリプトをコピー&ペースト
 * 4. setupAllSheets() 関数を実行
 */

const SPREADSHEET_ID = '1hE4zyNoE4kesA7Ysb5eV9U-RI8nmw4Uwj-A3WbThJPM';

/**
 * メイン関数：すべてのシートをセットアップ
 */
function setupAllSheets() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  Logger.log('🚀 シートのセットアップを開始します...');

  // 既存のデフォルトシート（Sheet1など）を削除
  deleteDefaultSheets(ss);

  // 各シートを作成
  createTournamentsSheet(ss);
  createTournamentConfigSheet(ss);
  createParticipantsSheet(ss);
  createTeamsSheet(ss);
  createPlayersSheet(ss);
  createGamesSheet(ss);
  createInningsSheet(ss);
  createAtBatsSheet(ss);
  createLeagueStandingsSheet(ss);
  createTournamentBracketSheet(ss);
  createPlayerStatsSheet(ss);
  createPaymentSummarySheet(ss);

  Logger.log('✅ すべてのシートのセットアップが完了しました！');
  SpreadsheetApp.getUi().alert('✅ セットアップ完了！\n\n12個のシートが作成されました。');
}

/**
 * デフォルトシートを削除
 */
function deleteDefaultSheets(ss) {
  const sheets = ss.getSheets();
  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name.match(/^Sheet\d+$/) || name === 'シート1') {
      ss.deleteSheet(sheet);
      Logger.log(`削除: ${name}`);
    }
  });
}

/**
 * シートを作成または取得するヘルパー関数
 */
function getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);

  if (sheet) {
    Logger.log(`既存のシートを使用: ${name}`);
    sheet.clear(); // 既存データをクリア
  } else {
    sheet = ss.insertSheet(name);
    Logger.log(`新規作成: ${name}`);
  }

  // ヘッダー行を設定
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

    // ヘッダー行のスタイル設定
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#4285f4')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');

    // 列幅を自動調整
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }

    // 先頭行を固定
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * 1. Tournaments シート
 */
function createTournamentsSheet(ss) {
  const headers = [
    'tournament_id',
    'tournament_name',
    'tournament_date',
    'status',
    'created_at',
    'archived',
    'season',
    'year',
    'previous_tournament_id'
  ];

  getOrCreateSheet(ss, 'Tournaments', headers);
}

/**
 * 2. TournamentConfig シート
 */
function createTournamentConfigSheet(ss) {
  const headers = [
    'tournament_id',
    'config_key',
    'config_value',
    'description'
  ];

  getOrCreateSheet(ss, 'TournamentConfig', headers);
}

/**
 * 3. Participants シート
 */
function createParticipantsSheet(ss) {
  const headers = [
    'participant_id',
    'tournament_id',
    'team_name',
    'player_name',
    'email',
    'phone',
    'payment_status',
    'payment_method',
    'payment_date',
    'payment_amount',
    'registration_date',
    'notes'
  ];

  getOrCreateSheet(ss, 'Participants', headers);
}

/**
 * 4. Teams シート
 */
function createTeamsSheet(ss) {
  const headers = [
    'team_id',
    'tournament_id',
    'team_name',
    'block',
    'combined_team',
    'seed_rank',
    'previous_rank',
    'auto_assigned',
    'captain_name',
    'captain_email',
    'member_count',
    'notes'
  ];

  getOrCreateSheet(ss, 'Teams', headers);
}

/**
 * 5. Players シート
 */
function createPlayersSheet(ss) {
  const headers = [
    'player_id',
    'tournament_id',
    'team_id',
    'player_name',
    'uniform_number',
    'position',
    'participant_id'
  ];

  getOrCreateSheet(ss, 'Players', headers);
}

/**
 * 6. Games シート
 */
function createGamesSheet(ss) {
  const headers = [
    'game_id',
    'tournament_id',
    'game_type',
    'block',
    'round',
    'team_home_id',
    'team_away_id',
    'score_home',
    'score_away',
    'status',
    'scheduled_date',
    'scheduled_time',
    'actual_start_time',
    'actual_end_time',
    'ground_number',
    'referee',
    'recorder'
  ];

  getOrCreateSheet(ss, 'Games', headers);
}

/**
 * 7. Innings シート
 */
function createInningsSheet(ss) {
  const headers = [
    'game_id',
    'inning',
    'home_score',
    'away_score'
  ];

  getOrCreateSheet(ss, 'Innings', headers);
}

/**
 * 8. AtBats シート
 */
function createAtBatsSheet(ss) {
  const headers = [
    'game_id',
    'inning',
    'team_id',
    'player_id',
    'batting_order',
    'result',
    'bases',
    'is_homerun',
    'rbi',
    'notes'
  ];

  getOrCreateSheet(ss, 'AtBats', headers);
}

/**
 * 9. LeagueStandings シート
 */
function createLeagueStandingsSheet(ss) {
  const headers = [
    'tournament_id',
    'block',
    'team_id',
    'games',
    'wins',
    'losses',
    'draws',
    'win_rate',
    'points_for',
    'points_against',
    'rank'
  ];

  getOrCreateSheet(ss, 'LeagueStandings', headers);
}

/**
 * 10. TournamentBracket シート
 */
function createTournamentBracketSheet(ss) {
  const headers = [
    'tournament_id',
    'round',
    'match_number',
    'team1_id',
    'team2_id',
    'winner_id',
    'score1',
    'score2',
    'game_id'
  ];

  getOrCreateSheet(ss, 'TournamentBracket', headers);
}

/**
 * 11. PlayerStats シート
 */
function createPlayerStatsSheet(ss) {
  const headers = [
    'tournament_id',
    'player_id',
    'player_name',
    'team_id',
    'at_bats',
    'hits',
    'homeruns',
    'rbis',
    'strikeouts',
    'batting_average'
  ];

  getOrCreateSheet(ss, 'PlayerStats', headers);
}

/**
 * 12. PaymentSummary シート
 */
function createPaymentSummarySheet(ss) {
  const headers = [
    'tournament_id',
    'total_participants',
    'paid_count',
    'unpaid_count',
    'total_collected',
    'total_expected',
    'collection_rate'
  ];

  getOrCreateSheet(ss, 'PaymentSummary', headers);
}

/**
 * カスタムメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚾ 大会管理')
    .addItem('🔧 シートをセットアップ', 'setupAllSheets')
    .addItem('📝 サンプルデータを追加', 'addSampleData')
    .addItem('🗑️ 全データをクリア', 'clearAllData')
    .addToUi();
}

/**
 * 全データをクリア
 */
function clearAllData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '確認',
    '全シートのデータ（ヘッダー行以外）をクリアしますか？',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheets = ss.getSheets();

    sheets.forEach(sheet => {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
        Logger.log(`クリア: ${sheet.getName()}`);
      }
    });

    ui.alert('✅ 完了', '全データをクリアしました。', ui.ButtonSet.OK);
  }
}

/**
 * サンプルデータ投入スクリプト
 *
 * 使い方:
 * 1. setup-sheets.js を先に実行してシートを作成
 * 2. このスクリプトをApps Scriptエディタに追加
 * 3. addSampleData() 関数を実行
 *
 * 注意: SPREADSHEET_ID は setup-sheets.js で定義されています
 */

/**
 * サンプルデータを追加
 */
function addSampleData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '確認',
    'サンプルデータを追加しますか？\n（既存データは保持されます）',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }

  Logger.log('📝 サンプルデータの投入を開始します...');

  addSampleTournaments(ss);
  addSampleTournamentConfig(ss);
  addSampleTeams(ss);
  addSamplePlayers(ss);
  addSampleParticipants(ss);
  addSampleGames(ss);
  addSampleInnings(ss);
  addSampleAtBats(ss);
  addSampleLeagueStandings(ss);
  addSamplePlayerStats(ss);
  addSamplePaymentSummary(ss);

  Logger.log('✅ サンプルデータの投入が完了しました！');
  ui.alert('✅ 完了！\n\nサンプルデータを追加しました。');
}

/**
 * Tournamentsのサンプルデータ
 */
function addSampleTournaments(ss) {
  const sheet = ss.getSheetByName('Tournaments');
  const data = [
    ['T2025F', '2025年秋季大会', '2025-11-19', 'active', '2025-10-01', 'FALSE', 'fall', '2025', 'T2025S'],
    ['T2025S', '2025年春季大会', '2025-05-15', 'completed', '2025-04-01', 'FALSE', 'spring', '2025', 'T2024F'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Tournaments サンプルデータ追加');
}

/**
 * TournamentConfigのサンプルデータ
 */
function addSampleTournamentConfig(ss) {
  const sheet = ss.getSheetByName('TournamentConfig');
  const data = [
    ['T2025F', 'league_blocks', '2', 'リーグブロック数'],
    ['T2025F', 'teams_per_block', '4,5', '各ブロックのチーム数'],
    ['T2025F', 'tournament_teams', '8', 'トーナメント進出数'],
    ['T2025F', 'game_time_limit', '60', '試合時間制限（分）'],
    ['T2025F', 'innings_default', '7', 'デフォルトイニング数'],
    ['T2025F', 'seed_teams_count', '2', 'シード数'],
    ['T2025F', 'entry_fee', '3000', '参加費（円）'],
    ['T2025F', 'payment_deadline', '2025-11-10', '支払期限'],
    ['T2025F', 'registration_deadline', '2025-11-05', '登録締切'],
    ['T2025F', 'venue', '○○グラウンド', '会場名'],
    ['T2025F', 'start_time', '09:00', '大会開始時刻'],
    ['T2025F', 'grounds_count', '2', '同時使用グラウンド数'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ TournamentConfig サンプルデータ追加');
}

/**
 * Teamsのサンプルデータ
 */
function addSampleTeams(ss) {
  const sheet = ss.getSheetByName('Teams');
  const data = [
    ['T001', 'T2025F', '永長・北條研', 'A', 'TRUE', '1', '1', 'TRUE', '山田太郎', 'yamada@example.com', '12', '前回優勝'],
    ['T002', 'T2025F', '田中研', 'A', 'FALSE', '', '3', 'TRUE', '鈴木次郎', 'suzuki@example.com', '10', ''],
    ['T003', 'T2025F', '佐藤研', 'A', 'FALSE', '', '5', 'TRUE', '高橋花子', 'takahashi@example.com', '9', ''],
    ['T004', 'T2025F', '伊藤研', 'A', 'FALSE', '', '7', 'TRUE', '渡辺太郎', 'watanabe@example.com', '11', ''],
    ['T005', 'T2025F', '中村研', 'B', 'FALSE', '2', '2', 'TRUE', '小林次郎', 'kobayashi@example.com', '10', '前回準優勝'],
    ['T006', 'T2025F', '加藤研', 'B', 'FALSE', '', '4', 'TRUE', '山本花子', 'yamamoto@example.com', '8', ''],
    ['T007', 'T2025F', '吉田研', 'B', 'FALSE', '', '6', 'TRUE', '林太郎', 'hayashi@example.com', '9', ''],
    ['T008', 'T2025F', '松本研', 'B', 'FALSE', '', '8', 'TRUE', '井上花子', 'inoue@example.com', '10', ''],
    ['T009', 'T2025F', '木村研', 'B', 'FALSE', '', '9', 'TRUE', '清水太郎', 'shimizu@example.com', '7', ''],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Teams サンプルデータ追加');
}

/**
 * Playersのサンプルデータ
 */
function addSamplePlayers(ss) {
  const sheet = ss.getSheetByName('Players');
  const data = [
    ['P001', 'T2025F', 'T001', '山田太郎', '1', '投手', 'PAR001'],
    ['P002', 'T2025F', 'T001', '鈴木花子', '2', '捕手', 'PAR002'],
    ['P003', 'T2025F', 'T001', '高橋次郎', '3', '一塁手', 'PAR003'],
    ['P004', 'T2025F', 'T001', '田中三郎', '4', '二塁手', 'PAR004'],
    ['P005', 'T2025F', 'T002', '佐藤太郎', '5', '投手', 'PAR005'],
    ['P006', 'T2025F', 'T002', '渡辺花子', '6', '捕手', 'PAR006'],
    ['P007', 'T2025F', 'T003', '伊藤次郎', '7', '投手', 'PAR007'],
    ['P008', 'T2025F', 'T003', '中村三郎', '8', '捕手', 'PAR008'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Players サンプルデータ追加');
}

/**
 * Participantsのサンプルデータ
 */
function addSampleParticipants(ss) {
  const sheet = ss.getSheetByName('Participants');
  const data = [
    ['PAR001', 'T2025F', '永長・北條研', '山田太郎', 'yamada@example.com', '090-1234-5678', 'paid', 'paypay', '2025-11-10', '3000', '2025-11-01', ''],
    ['PAR002', 'T2025F', '永長・北條研', '鈴木花子', 'suzuki@example.com', '080-9876-5432', 'paid', 'bank_transfer', '2025-11-09', '3000', '2025-11-01', ''],
    ['PAR003', 'T2025F', '永長・北條研', '高橋次郎', 'takahashi@example.com', '070-1111-2222', 'unpaid', '', '', '3000', '2025-11-02', '催促メール送信済'],
    ['PAR004', 'T2025F', '永長・北條研', '田中三郎', 'tanaka@example.com', '090-3333-4444', 'paid', 'paypay', '2025-11-11', '3000', '2025-11-02', ''],
    ['PAR005', 'T2025F', '田中研', '佐藤太郎', 'sato@example.com', '080-5555-6666', 'paid', 'cash', '2025-11-19', '3000', '2025-11-03', '当日払い'],
    ['PAR006', 'T2025F', '田中研', '渡辺花子', 'watanabe-h@example.com', '070-7777-8888', 'paid', 'paypay', '2025-11-08', '3000', '2025-11-03', ''],
    ['PAR007', 'T2025F', '佐藤研', '伊藤次郎', 'ito@example.com', '090-9999-0000', 'unpaid', '', '', '3000', '2025-11-04', ''],
    ['PAR008', 'T2025F', '佐藤研', '中村三郎', 'nakamura@example.com', '080-1111-3333', 'paid', 'bank_transfer', '2025-11-12', '3000', '2025-11-04', ''],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Participants サンプルデータ追加');
}

/**
 * Gamesのサンプルデータ
 */
function addSampleGames(ss) {
  const sheet = ss.getSheetByName('Games');
  const data = [
    ['G001', 'T2025F', 'league', 'A', '', 'T001', 'T002', '5', '3', 'completed', '2025-11-19', '09:00', '09:05', '10:10', '1', '田中先生', '山田'],
    ['G002', 'T2025F', 'league', 'A', '', 'T003', 'T004', '7', '2', 'completed', '2025-11-19', '09:00', '09:10', '10:15', '2', '佐藤先生', '鈴木'],
    ['G003', 'T2025F', 'league', 'B', '', 'T005', 'T006', '4', '4', 'completed', '2025-11-19', '10:30', '10:35', '11:40', '1', '高橋先生', '渡辺'],
    ['G004', 'T2025F', 'league', 'B', '', 'T007', 'T008', '', '', 'in_progress', '2025-11-19', '10:30', '10:40', '', '2', '伊藤先生', '中村'],
    ['G005', 'T2025F', 'league', 'A', '', 'T001', 'T003', '', '', 'scheduled', '2025-11-19', '12:00', '', '', '1', '加藤先生', ''],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Games サンプルデータ追加');
}

/**
 * Inningsのサンプルデータ
 */
function addSampleInnings(ss) {
  const sheet = ss.getSheetByName('Innings');
  const data = [
    ['G001', '1', '0', '1'],
    ['G001', '2', '2', '0'],
    ['G001', '3', '1', '2'],
    ['G001', '4', '0', '0'],
    ['G001', '5', '2', '0'],
    ['G001', '6', '0', '0'],
    ['G001', '7', '0', '0'],
    ['G002', '1', '3', '0'],
    ['G002', '2', '1', '1'],
    ['G002', '3', '2', '0'],
    ['G002', '4', '1', '1'],
    ['G002', '5', '0', '0'],
    ['G002', '6', '0', '0'],
    ['G002', '7', '0', '0'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ Innings サンプルデータ追加');
}

/**
 * AtBatsのサンプルデータ
 */
function addSampleAtBats(ss) {
  const sheet = ss.getSheetByName('AtBats');
  const data = [
    ['G001', '1', 'T001', 'P001', '1', 'hit', '1', 'FALSE', '0', '左前打'],
    ['G001', '1', 'T001', 'P002', '2', 'homerun', '4', 'TRUE', '2', '右中間'],
    ['G001', '1', 'T001', 'P003', '3', 'strikeout', '0', 'FALSE', '0', '見逃し三振'],
    ['G001', '2', 'T002', 'P005', '1', 'hit', '2', 'FALSE', '1', '左線二塁打'],
    ['G001', '2', 'T002', 'P006', '2', 'out', '0', 'FALSE', '0', '三塁ゴロ'],
    ['G002', '1', 'T003', 'P007', '1', 'homerun', '4', 'TRUE', '3', 'レフトスタンド'],
    ['G002', '1', 'T003', 'P008', '2', 'walk', '0', 'FALSE', '0', '四球'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ AtBats サンプルデータ追加');
}

/**
 * LeagueStandingsのサンプルデータ
 */
function addSampleLeagueStandings(ss) {
  const sheet = ss.getSheetByName('LeagueStandings');
  const data = [
    ['T2025F', 'A', 'T001', '2', '2', '0', '0', '1.000', '12', '5', '1'],
    ['T2025F', 'A', 'T002', '2', '1', '1', '0', '0.500', '8', '10', '2'],
    ['T2025F', 'A', 'T003', '2', '1', '1', '0', '0.500', '9', '9', '3'],
    ['T2025F', 'A', 'T004', '1', '0', '1', '0', '0.000', '2', '7', '4'],
    ['T2025F', 'B', 'T005', '1', '0', '0', '1', '0.500', '4', '4', '1'],
    ['T2025F', 'B', 'T006', '1', '0', '0', '1', '0.500', '4', '4', '2'],
    ['T2025F', 'B', 'T007', '0', '0', '0', '0', '0.000', '0', '0', '3'],
    ['T2025F', 'B', 'T008', '0', '0', '0', '0', '0.000', '0', '0', '4'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ LeagueStandings サンプルデータ追加');
}

/**
 * PlayerStatsのサンプルデータ
 */
function addSamplePlayerStats(ss) {
  const sheet = ss.getSheetByName('PlayerStats');
  const data = [
    ['T2025F', 'P001', '山田太郎', 'T001', '8', '3', '0', '1', '2', '0.375'],
    ['T2025F', 'P002', '鈴木花子', 'T001', '10', '5', '2', '6', '1', '0.500'],
    ['T2025F', 'P003', '高橋次郎', 'T001', '9', '2', '0', '0', '3', '0.222'],
    ['T2025F', 'P005', '佐藤太郎', 'T002', '7', '2', '0', '1', '1', '0.286'],
    ['T2025F', 'P006', '渡辺花子', 'T002', '8', '1', '0', '0', '2', '0.125'],
    ['T2025F', 'P007', '伊藤次郎', 'T003', '6', '3', '1', '3', '0', '0.500'],
    ['T2025F', 'P008', '中村三郎', 'T003', '7', '2', '0', '1', '1', '0.286'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ PlayerStats サンプルデータ追加');
}

/**
 * PaymentSummaryのサンプルデータ
 */
function addSamplePaymentSummary(ss) {
  const sheet = ss.getSheetByName('PaymentSummary');
  const data = [
    ['T2025F', '8', '6', '2', '18000', '24000', '0.750'],
  ];

  sheet.getRange(sheet.getLastRow() + 1, 1, data.length, data[0].length).setValues(data);
  Logger.log('✓ PaymentSummary サンプルデータ追加');
}

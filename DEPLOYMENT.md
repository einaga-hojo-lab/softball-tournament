# デプロイ手順

このドキュメントでは、ソフトボール大会管理システムをGitHubとVercelにデプロイする手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubアカウントでサインアップ可能）
- Google Cloud Platformアカウント
- Google Sheetsの準備

## 1. Google Sheets の設定

### 1.1. Google Sheetsの作成

新しいGoogle Sheetsを作成し、以下のシートを追加してください:

1. **Tournaments** - 大会管理
   - 列: tournament_id, tournament_name, tournament_date, status, created_at, archived, season, year, previous_tournament_id

2. **TournamentConfig** - 大会設定
   - 列: tournament_id, config_key, config_value, description

3. **Participants** - 参加者
   - 列: participant_id, tournament_id, team_name, player_name, email, phone, payment_status, payment_method, payment_date, payment_amount, registration_date, notes

4. **Teams** - チーム
   - 列: team_id, tournament_id, team_name, block, combined_team, seed_rank, previous_rank, auto_assigned, captain_name, captain_email, member_count, notes

5. **Players** - 選手
   - 列: player_id, tournament_id, team_id, player_name, uniform_number, position, participant_id

6. **Games** - 試合
   - 列: game_id, tournament_id, game_type, block, round, team_home_id, team_away_id, score_home, score_away, status, scheduled_date, scheduled_time, actual_start_time, actual_end_time, ground_number, referee, recorder

7. **Innings** - イニング別得点
   - 列: game_id, inning, home_score, away_score

8. **AtBats** - 打席記録
   - 列: game_id, inning, team_id, player_id, batting_order, result, bases, is_homerun, rbi, notes

9. **LeagueStandings** - リーグ順位表
   - 列: tournament_id, block, team_id, games, wins, losses, draws, win_rate, points_for, points_against, rank

10. **TournamentBracket** - トーナメント表
    - 列: tournament_id, round, match_number, team1_id, team2_id, winner_id, score1, score2, game_id

11. **PlayerStats** - 個人成績
    - 列: tournament_id, player_id, player_name, team_id, at_bats, hits, homeruns, rbis, strikeouts, batting_average

12. **PaymentSummary** - 集金サマリー
    - 列: tournament_id, total_participants, paid_count, unpaid_count, total_collected, total_expected, collection_rate

### 1.2. Google Cloud Platformの設定

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」から「Google Sheets API」を検索して有効化
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「サービスアカウント」
5. サービスアカウント名を入力（例: softball-tournament）
6. 「作成して続行」をクリック
7. 役割は選択不要（スキップ）
8. 「完了」をクリック
9. 作成したサービスアカウントをクリック
10. 「キー」タブ→「鍵を追加」→「新しい鍵を作成」→「JSON」を選択してダウンロード

### 1.3. Sheetsへの共有

1. Google Sheetsを開く
2. 「共有」ボタンをクリック
3. ダウンロードしたJSONファイルから `client_email` の値をコピー
4. 共有先にペーストして「編集者」権限で共有

## 2. GitHubリポジトリの作成とプッシュ

### 2.1. GitHubで新しいリポジトリを作成

1. [GitHub](https://github.com/)にログイン
2. 右上の「+」→「New repository」
3. リポジトリ名: `softball-tournament` (任意)
4. 説明: 「ソフトボール大会管理システム」
5. Public または Private を選択
6. 「Create repository」をクリック

### 2.2. リモートリポジトリの追加とプッシュ

```bash
cd softball-tournament
git remote add origin https://github.com/YOUR_USERNAME/softball-tournament.git
git branch -M main
git push -u origin main
```

`YOUR_USERNAME` を自分のGitHubユーザー名に置き換えてください。

## 3. Vercelへのデプロイ

### 3.1. Vercelアカウントの作成

1. [Vercel](https://vercel.com/)にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでサインアップ

### 3.2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. GitHubリポジトリ一覧から `softball-tournament` を選択
3. 「Import」をクリック

### 3.3. 環境変数の設定

「Environment Variables」セクションで以下を設定:

#### GOOGLE_SERVICE_ACCOUNT_EMAIL
- ダウンロードしたJSONファイルの `client_email` の値

#### GOOGLE_PRIVATE_KEY
- ダウンロードしたJSONファイルの `private_key` の値
- **重要**: 値全体を引用符で囲む（例: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`）

#### GOOGLE_SHEET_ID
- Google SheetsのURLから抽出: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
- `SHEET_ID` の部分をコピー

#### NEXT_PUBLIC_APP_URL
- デプロイ後のURL（例: `https://softball-tournament.vercel.app`）
- 最初は空欄でOK、デプロイ後に更新

### 3.4. デプロイ

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待機（通常1-2分）
3. デプロイが成功すると、URLが表示されます

### 3.5. 環境変数の更新（オプション）

デプロイ後、`NEXT_PUBLIC_APP_URL` を実際のURLに更新:

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Environment Variables」
3. `NEXT_PUBLIC_APP_URL` を編集して保存
4. 「Deployments」タブから再デプロイ

## 4. 動作確認

1. デプロイされたURLにアクセス
2. ホーム画面が表示されることを確認
3. Google Sheetsにテストデータを追加して、正しく表示されるか確認

## 5. 継続的デプロイ

GitHubリポジトリにプッシュすると、Vercelが自動的に再デプロイします:

```bash
# 変更をコミット
git add .
git commit -m "機能追加"
git push
```

Vercelが自動的にビルド・デプロイを開始します。

## トラブルシューティング

### ビルドエラー

- `npm run build` をローカルで実行してエラーを確認
- TypeScriptのエラーがないか確認

### Google Sheets接続エラー

- 環境変数が正しく設定されているか確認
- サービスアカウントがSheetsに共有されているか確認
- `GOOGLE_PRIVATE_KEY` が正しく引用符で囲まれているか確認

### ページが表示されない

- Vercelのログを確認（Deployments → 該当デプロイ → Logs）
- ブラウザのコンソールエラーを確認

## カスタムドメインの設定（オプション）

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」→「Domains」
3. 「Add Domain」で独自ドメインを追加
4. DNSレコードを設定（Vercelが指示を表示）

## セキュリティ注意事項

- **環境変数は絶対にGitHubにコミットしない**
- `.env.local` は `.gitignore` に含まれています
- サービスアカウントの秘密鍵は厳重に管理
- 定期的にアクセスログを確認

## サポート

問題が発生した場合:

1. [Vercelドキュメント](https://vercel.com/docs)を確認
2. [Next.jsドキュメント](https://nextjs.org/docs)を確認
3. GitHubリポジトリのIssuesで質問

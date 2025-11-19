# Google Apps Script セットアップガイド

このディレクトリには、Google Sheetsを自動的にセットアップするためのGoogle Apps Scriptが含まれています。

## 📋 スクリプト一覧

1. **setup-sheets.js** - シートの自動作成とヘッダー設定
2. **sample-data.js** - サンプルデータの投入

## 🚀 使い方

### Step 1: Google Sheetsを開く

Google SheetsのIDは `1hE4zyNoE4kesA7Ysb5eV9U-RI8nmw4Uwj-A3WbThJPM` です。

以下のURLで開けます：
```
https://docs.google.com/spreadsheets/d/1hE4zyNoE4kesA7Ysb5eV9U-RI8nmw4Uwj-A3WbThJPM/edit
```

### Step 2: Apps Scriptエディタを開く

1. Google Sheetsを開く
2. メニューバーから **拡張機能** → **Apps Script** をクリック
3. 新しいタブでApps Scriptエディタが開きます

### Step 3: スクリプトをコピー&ペースト

#### 3-1. setup-sheets.js をコピー

1. Apps Scriptエディタで、デフォルトの `コード.gs` を開く
2. `setup-sheets.js` の内容を**すべて**コピー
3. Apps Scriptエディタにペースト（既存のコードは削除）
4. 左上の「💾 保存」アイコンをクリック
5. プロジェクト名を「ソフトボール大会管理システム」などに変更

#### 3-2. sample-data.js を追加

1. 左側のファイル一覧で「**+**」ボタン → 「スクリプト」をクリック
2. ファイル名を `sample-data` にする
3. `sample-data.js` の内容を**すべて**コピー
4. 新しく作成したファイルにペースト
5. 「💾 保存」をクリック

### Step 4: スクリプトを実行

#### 4-1. シートのセットアップ

1. エディタ上部の関数選択ドロップダウンから **setupAllSheets** を選択
2. 「▶ 実行」ボタンをクリック
3. **初回のみ** 権限の確認ダイアログが表示されます：
   - 「権限を確認」をクリック
   - Googleアカウントを選択
   - 「詳細」→「（プロジェクト名）に移動」をクリック
   - 「許可」をクリック
4. 実行が完了すると、「✅ セットアップ完了！」のアラートが表示されます

#### 4-2. サンプルデータの投入（オプション）

1. 関数選択ドロップダウンから **addSampleData** を選択
2. 「▶ 実行」ボタンをクリック
3. 確認ダイアログで「はい」を選択
4. サンプルデータが各シートに追加されます

### Step 5: Google Sheetsで確認

1. Google Sheetsのタブに戻る
2. 以下の12個のシートが作成されているか確認：
   - ✅ Tournaments
   - ✅ TournamentConfig
   - ✅ Participants
   - ✅ Teams
   - ✅ Players
   - ✅ Games
   - ✅ Innings
   - ✅ AtBats
   - ✅ LeagueStandings
   - ✅ TournamentBracket
   - ✅ PlayerStats
   - ✅ PaymentSummary

3. サンプルデータを追加した場合、各シートにデータが入っているか確認

## 🎯 カスタムメニュー

スクリプトをセットアップすると、Google Sheetsに「⚾ 大会管理」というカスタムメニューが追加されます。

このメニューから以下の操作が簡単に実行できます：

- 🔧 **シートをセットアップ** - すべてのシートを再作成
- 📝 **サンプルデータを追加** - サンプルデータを投入
- 🗑️ **全データをクリア** - すべてのデータを削除（ヘッダー行は残す）

## 📊 作成されるシート詳細

### 1. Tournaments（大会管理）
大会の基本情報を管理
- tournament_id, tournament_name, tournament_date, status, etc.

### 2. TournamentConfig（大会設定）
大会ごとの詳細設定
- リーグブロック数、参加費、締切日など

### 3. Participants（参加者）
参加者情報と集金ステータス
- 氏名、メール、電話、支払い状況など

### 4. Teams（チーム）
チーム情報
- チーム名、ブロック、シード順位など

### 5. Players（選手）
選手情報
- 氏名、背番号、ポジションなど

### 6. Games（試合）
試合の基本情報
- 対戦カード、スコア、日時、会場など

### 7. Innings（イニング別得点）
イニングごとの得点記録

### 8. AtBats（打席記録）
選手ごとの打席結果

### 9. LeagueStandings（リーグ順位表）
リーグ戦の順位表（自動計算用）

### 10. TournamentBracket（トーナメント表）
トーナメント戦の組み合わせ

### 11. PlayerStats（個人成績）
選手個人の成績サマリー（自動計算用）

### 12. PaymentSummary（集金サマリー）
大会ごとの集金状況（自動計算用）

## 🔧 トラブルシューティング

### 権限エラーが出る場合

「このアプリは確認されていません」と表示される場合：
1. 「詳細」をクリック
2. 「（プロジェクト名）に移動」をクリック
3. 「許可」をクリック

### スクリプトが実行されない場合

1. Apps Scriptエディタで「ログを表示」（Ctrl+Enter）を確認
2. エラーメッセージを確認
3. SPREADSHEET_IDが正しいか確認

### シートが作成されない場合

1. Google Sheetsの編集権限があるか確認
2. ブラウザのキャッシュをクリアして再試行

## 📝 補足

### データのバックアップ

重要なデータは定期的にバックアップを取ることをお勧めします：
1. ファイル → コピーを作成
2. または、カスタムメニューの「全データをエクスポート」（今後実装予定）

### スクリプトのカスタマイズ

- SPREADSHEET_IDを変更すれば、別のSheetsでも使用可能
- サンプルデータは自由に変更・追加できます

## 🤝 次のステップ

1. ✅ Google Sheetsのセットアップ完了
2. ⏩ サービスアカウントの作成（DEPLOYMENT.md参照）
3. ⏩ Next.jsアプリとの連携
4. ⏩ Vercelへのデプロイ

---

**Happy Coding! ⚾**

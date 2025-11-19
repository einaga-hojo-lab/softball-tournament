# ソフトボール大会管理システム

研究室対抗ソフトボール大会の運営を効率化する、包括的な大会管理システムです。

## 主な特徴

- 📊 Google Sheetsをデータベースとして活用
- 📱 スマートフォン最適化されたモダンなUI
- 📝 Google Formによる参加者登録・試合記録入力
- 💰 PayPay等での集金管理
- 📅 試合スケジュール自動生成・表示
- 🏆 リーグ戦・トーナメント戦の柔軟な組み合わせ設定
- 📈 個人成績のリアルタイム表示
- 🔄 毎年・毎回再利用可能な柔軟な設計

## 技術スタック

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Google Sheets API**
- **Vercel** (ホスティング)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`をコピーして`.env.local`を作成し、必要な環境変数を設定してください。

```bash
cp .env.local.example .env.local
```

必要な環境変数:
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google Cloud Platformのサービスアカウントメールアドレス
- `GOOGLE_PRIVATE_KEY`: サービスアカウントの秘密鍵
- `GOOGLE_SHEET_ID`: Google SheetsのID

### 3. Google Sheets の準備

1. 新しいGoogle Sheetsを作成
2. 以下のシートを作成:
   - Tournaments (大会管理)
   - TournamentConfig (大会設定)
   - Participants (参加者)
   - Teams (チーム)
   - Players (選手)
   - Games (試合)
   - Innings (イニング別得点)
   - AtBats (打席記録)
   - LeagueStandings (リーグ順位表)
   - TournamentBracket (トーナメント表)
   - PlayerStats (個人成績)
   - PaymentSummary (集金サマリー)

3. Google Cloud Platformでプロジェクトを作成
4. Google Sheets APIを有効化
5. サービスアカウントを作成し、JSONキーをダウンロード
6. Sheetsにサービスアカウントのメールアドレスを編集者として共有

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## ビルド

```bash
npm run build
npm run start
```

## Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. Vercelアカウントでリポジトリをインポート
3. 環境変数を設定
4. デプロイ

## ディレクトリ構造

```
softball-tournament/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム画面
│   ├── layout.tsx         # ルートレイアウト
│   ├── globals.css        # グローバルCSS
│   └── api/               # API Routes
├── components/            # Reactコンポーネント
│   └── ui/               # UIコンポーネント
├── lib/                  # ユーティリティ・ライブラリ
│   ├── types.ts         # 型定義
│   ├── googleSheets.ts  # Google Sheets連携
│   └── utils.ts         # ユーティリティ関数
└── public/              # 静的ファイル
```

## ライセンス

ISC

## 作成者

研究室対抗ソフトボール大会運営チーム

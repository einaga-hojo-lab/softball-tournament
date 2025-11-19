# セットアップガイド

このガイドでは、ローカル環境での開発セットアップ方法を説明します。

## 📋 必要なもの

- Node.js 18.x 以降
- npm または yarn
- Git
- Googleアカウント

## 🚀 クイックスタート

### 1. リポジトリのクローン

```bash
git clone https://github.com/YOUR_USERNAME/softball-tournament.git
cd softball-tournament
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成:

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して、以下の環境変数を設定:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your-spreadsheet-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

詳細な取得方法は `DEPLOYMENT.md` を参照してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションが起動します。

## 📁 プロジェクト構造

```
softball-tournament/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ホーム画面
│   ├── layout.tsx         # ルートレイアウト
│   ├── globals.css        # グローバルCSS
│   └── api/               # API Routes（今後追加）
├── components/            # Reactコンポーネント
│   └── ui/               # UIコンポーネント（今後追加）
├── lib/                  # ユーティリティ・ライブラリ
│   ├── types.ts         # 型定義
│   ├── googleSheets.ts  # Google Sheets連携
│   └── utils.ts         # ユーティリティ関数
├── public/              # 静的ファイル
├── .env.local          # 環境変数（Gitに含めない）
├── .env.local.example  # 環境変数のテンプレート
├── .gitignore          # Git除外設定
├── next.config.ts      # Next.js設定
├── tailwind.config.ts  # Tailwind CSS設定
├── tsconfig.json       # TypeScript設定
├── package.json        # 依存関係
└── README.md           # プロジェクト概要
```

## 🛠️ 開発ワークフロー

### 新機能の追加

1. 新しいブランチを作成
```bash
git checkout -b feature/new-feature
```

2. コードを変更・テスト

3. コミット
```bash
git add .
git commit -m "機能追加: 〇〇"
```

4. プッシュ
```bash
git push origin feature/new-feature
```

5. GitHubでプルリクエストを作成

### コードのフォーマット

```bash
npm run lint
```

### ビルドテスト

```bash
npm run build
```

## 📚 次のステップ

### Phase 1: 基本機能の実装

現在のプロジェクトは基本的なセットアップのみ完了しています。
以下の機能を順次実装していきます:

1. **API Routes の実装**
   - `/api/tournaments` - 大会一覧・詳細
   - `/api/games` - 試合一覧・詳細
   - `/api/teams` - チーム一覧
   - `/api/stats` - 個人成績

2. **ページの実装**
   - `/league` - リーグ戦順位表
   - `/tournament` - トーナメント表
   - `/games` - 試合一覧
   - `/games/[id]` - 試合詳細
   - `/stats` - 個人成績
   - `/schedule` - スケジュール

3. **UIコンポーネントの追加**
   - GameCard - 試合カード
   - LeagueTable - リーグ順位表
   - TournamentBracket - トーナメント表
   - PlayerStatsTable - 個人成績表

4. **管理画面**
   - `/admin` - ダッシュボード
   - `/admin/tournaments` - 大会管理
   - `/admin/participants` - 参加者管理
   - `/admin/payments` - 集金管理

### 実装の優先順位

詳細な実装優先順位は `SOFTBALL_TOURNAMENT_README.md` を参照してください。

## 🐛 トラブルシューティング

### ポート3000が使用中

別のポートで起動:
```bash
PORT=3001 npm run dev
```

### Google Sheets 接続エラー

1. 環境変数が正しく設定されているか確認
2. サービスアカウントがSheetsに共有されているか確認
3. シート名が正確に一致しているか確認

### TypeScript エラー

```bash
npm run build
```
でエラー詳細を確認してください。

## 📖 参考リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Vercel デプロイガイド](https://vercel.com/docs)

## 💡 ヒント

### 開発中のリロード

ファイルを保存すると自動的にページがリロードされます（Hot Reload）。

### Tailwind CSS のクラス

Tailwind CSSのユーティリティクラスを使用してスタイリング:
```tsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  コンテンツ
</div>
```

### コンポーネントの再利用

共通のUIコンポーネントは `components/` ディレクトリに配置して再利用します。

## 🤝 コントリビューション

1. Issuesで改善提案・バグ報告
2. プルリクエストでコード貢献
3. ドキュメントの改善

## 📝 ライセンス

ISC

---

**Happy Coding! ⚾**

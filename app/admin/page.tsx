import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline">
            ← ホームに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-accent">
          管理ダッシュボード
        </h1>
        <p className="text-gray-600 mb-8">
          大会運営・管理機能（運営者専用）
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              大会管理
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📅 大会作成・設定</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📋 大会一覧</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📊 大会ステータス</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              参加者・集金管理
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">👥 参加者一覧</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">💰 集金状況</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📧 リマインダー送信</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              チーム・リーグ編成
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🎯 チーム管理</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🔀 リーグ自動振り分け</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">⭐ シード設定</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              スケジュール管理
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📅 スケジュール自動生成</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">✏️ スケジュール調整</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🏟️ グラウンド割り当て</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              試合記録
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">⚾ 試合結果入力</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📝 スコア修正</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🏆 トーナメント管理</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-primary">
              データ管理
            </h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📥 データエクスポート</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">💾 バックアップ</li>
              <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🗃️ アーカイブ</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>📝 注意:</strong> この管理画面は運営者専用です。URLを関係者以外に共有しないでください。
          </p>
        </div>
      </div>
    </main>
  );
}

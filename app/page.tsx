import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          ソフトボール大会管理システム
        </h1>
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <p className="text-lg text-gray-700 mb-4">
            研究室対抗ソフトボール大会の運営を効率化する管理システムです。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Link href="/schedule">
              <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer hover:border-secondary">
                <h2 className="text-xl font-semibold mb-2 text-secondary">
                  参加者機能
                </h2>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 参加登録</li>
                  <li>• 試合スケジュール確認</li>
                  <li>• 試合結果閲覧</li>
                  <li>• 個人成績確認</li>
                </ul>
              </div>
            </Link>
            <Link href="/admin">
              <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer hover:border-accent">
                <h2 className="text-xl font-semibold mb-2 text-accent">
                  運営機能
                </h2>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 大会作成・設定</li>
                  <li>• リーグ編成</li>
                  <li>• スケジュール管理</li>
                  <li>• 集金管理</li>
                </ul>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

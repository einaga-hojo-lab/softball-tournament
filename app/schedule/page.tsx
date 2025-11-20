import Link from "next/link";

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline">
            ← ホームに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">
          試合スケジュール
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">
            試合スケジュール機能は現在開発中です。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link href="/league">
              <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">リーグ戦順位</h3>
                <p className="text-sm text-gray-600">各ブロックの順位を確認</p>
              </div>
            </Link>

            <Link href="/games">
              <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">試合結果</h3>
                <p className="text-sm text-gray-600">試合の詳細を確認</p>
              </div>
            </Link>

            <Link href="/stats">
              <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
                <h3 className="font-semibold text-lg mb-2">個人成績</h3>
                <p className="text-sm text-gray-600">選手の成績を確認</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

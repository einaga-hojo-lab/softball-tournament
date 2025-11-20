import Link from "next/link";

export default function StatsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/schedule" className="text-primary hover:underline">
            ← スケジュールに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">
          個人成績ランキング
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            個人成績ランキングは現在開発中です。
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Google Sheetsにデータを追加すると、ここに選手の成績が表示されます。
          </p>
        </div>
      </div>
    </main>
  );
}

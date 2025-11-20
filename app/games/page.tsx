"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Game } from "@/lib/types";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<{ [teamId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'league' | 'tournament'>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // 試合情報を取得
        const gamesRes = await fetch('/api/games');
        if (!gamesRes.ok) throw new Error('試合情報の取得に失敗しました');
        const gamesData = await gamesRes.json();

        // チーム情報を取得
        const teamsRes = await fetch('/api/teams');
        if (!teamsRes.ok) throw new Error('チーム情報の取得に失敗しました');
        const teamsData = await teamsRes.json();

        // チームIDとチーム名のマッピングを作成
        const teamMap: { [teamId: string]: string } = {};
        teamsData.forEach((team: any) => {
          teamMap[team.teamId] = team.teamName;
        });

        setGames(gamesData);
        setTeams(teamMap);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/schedule" className="text-primary hover:underline">
              ← スケジュールに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">試合結果</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/schedule" className="text-primary hover:underline">
              ← スケジュールに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">試合結果</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">
              Google Sheetsにサンプルデータを追加してください。
            </p>
          </div>
        </div>
      </main>
    );
  }

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.gameType === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">完了</span>;
      case 'in_progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">進行中</span>;
      case 'scheduled':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">予定</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">中止</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{status}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/schedule" className="text-primary hover:underline">
            ← スケジュールに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">試合結果</h1>

        {/* フィルター */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('league')}
            className={`px-4 py-2 rounded ${
              filter === 'league'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            リーグ戦
          </button>
          <button
            onClick={() => setFilter('tournament')}
            className={`px-4 py-2 rounded ${
              filter === 'tournament'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            トーナメント
          </button>
        </div>

        {filteredGames.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">試合データがありません。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map(game => (
              <div key={game.gameId} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {game.gameType === 'league' ? 'リーグ戦' : 'トーナメント'}
                      {game.block && ` - ブロック${game.block}`}
                      {game.round && ` - ${game.round}`}
                    </span>
                  </div>
                  {getStatusBadge(game.status)}
                </div>

                <div className="grid grid-cols-7 items-center gap-4">
                  {/* ホームチーム */}
                  <div className="col-span-3 text-right">
                    <div className="font-semibold text-lg">{teams[game.teamHomeId] || game.teamHomeId}</div>
                  </div>

                  {/* スコア */}
                  <div className="col-span-1 text-center">
                    {game.status === 'completed' ? (
                      <div className="text-2xl font-bold">
                        {game.scoreHome} - {game.scoreAway}
                      </div>
                    ) : (
                      <div className="text-gray-400">vs</div>
                    )}
                  </div>

                  {/* アウェイチーム */}
                  <div className="col-span-3 text-left">
                    <div className="font-semibold text-lg">{teams[game.teamAwayId] || game.teamAwayId}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                  <div>
                    {game.scheduledDate} {game.scheduledTime}
                    {game.groundNumber && ` - グラウンド${game.groundNumber}`}
                  </div>
                  {game.recorder && <div>記録: {game.recorder}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

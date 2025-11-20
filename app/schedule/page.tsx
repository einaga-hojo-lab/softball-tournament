"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Game } from "@/lib/types";

export default function SchedulePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<{ [teamId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // URLパラメータを取得
        const searchParams = new URLSearchParams(window.location.search);
        const tid = searchParams.get('tournamentId');
        setTournamentId(tid);
        const params = tid ? `?tournamentId=${tid}` : '';

        // 試合情報を取得
        const gamesRes = await fetch(`/api/games${params}`);
        if (!gamesRes.ok) throw new Error('試合情報の取得に失敗しました');
        const gamesData = await gamesRes.json();

        // チーム情報を取得
        const teamsRes = await fetch(`/api/teams${params}`);
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

  const backLink = tournamentId ? `/admin/tournament/${tournamentId}` : '/';
  const backText = tournamentId ? '← ダッシュボードに戻る' : '← ホームに戻る';

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={backLink} className="text-primary hover:underline">
              {backText}
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">試合スケジュール</h1>
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
            <Link href={backLink} className="text-primary hover:underline">
              {backText}
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">試合スケジュール</h1>
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

  // フィルター適用
  const filteredGames = games.filter(game => {
    if (statusFilter !== "all" && game.status !== statusFilter) return false;
    if (typeFilter !== "all" && game.gameType !== typeFilter) return false;
    return true;
  });

  // 日付でグループ化
  const gamesByDate: { [date: string]: Game[] } = {};
  filteredGames.forEach(game => {
    if (!gamesByDate[game.scheduledDate]) {
      gamesByDate[game.scheduledDate] = [];
    }
    gamesByDate[game.scheduledDate].push(game);
  });

  // 日付でソート
  const sortedDates = Object.keys(gamesByDate).sort();

  // 各日付内で時間順にソート
  sortedDates.forEach(date => {
    gamesByDate[date].sort((a, b) => {
      const timeA = a.scheduledTime || "99:99";
      const timeB = b.scheduledTime || "99:99";
      return timeA.localeCompare(timeB);
    });
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
          <Link href={backLink} className="text-primary hover:underline">
            {backText}
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">
          試合スケジュール
        </h1>

        {/* フィルター */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">試合タイプ</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-4 py-2 rounded ${
                    typeFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setTypeFilter('league')}
                  className={`px-4 py-2 rounded ${
                    typeFilter === 'league'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  リーグ戦
                </button>
                <button
                  onClick={() => setTypeFilter('tournament')}
                  className={`px-4 py-2 rounded ${
                    typeFilter === 'tournament'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  トーナメント
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">状態</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded ${
                    statusFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  すべて
                </button>
                <button
                  onClick={() => setStatusFilter('scheduled')}
                  className={`px-4 py-2 rounded ${
                    statusFilter === 'scheduled'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  予定
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-4 py-2 rounded ${
                    statusFilter === 'completed'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  完了
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href={tournamentId ? `/league?tournamentId=${tournamentId}` : '/league'}>
            <div className="p-4 bg-white border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">リーグ戦順位</h3>
              <p className="text-sm text-gray-600">各ブロックの順位を確認</p>
            </div>
          </Link>

          <Link href={tournamentId ? `/games?tournamentId=${tournamentId}` : '/games'}>
            <div className="p-4 bg-white border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">試合結果</h3>
              <p className="text-sm text-gray-600">試合の詳細を確認</p>
            </div>
          </Link>

          <Link href={tournamentId ? `/stats?tournamentId=${tournamentId}` : '/stats'}>
            <div className="p-4 bg-white border rounded-lg hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-lg mb-2">個人成績</h3>
              <p className="text-sm text-gray-600">選手の成績を確認</p>
            </div>
          </Link>
        </div>

        {/* スケジュールタイムライン */}
        {sortedDates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">該当する試合がありません。</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary text-white px-6 py-3">
                  <h2 className="text-xl font-bold">{date}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {gamesByDate[date].map(game => (
                    <div key={game.gameId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary">
                            {game.scheduledTime || "未定"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {game.gameType === 'league' ? 'リーグ戦' : 'トーナメント'}
                              {game.block && ` - ブロック${game.block}`}
                              {game.round && ` - ${game.round}`}
                            </span>
                            {game.groundNumber && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                グラウンド{game.groundNumber}
                              </span>
                            )}
                          </div>
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
                            <div className="text-gray-400 font-semibold">vs</div>
                          )}
                        </div>

                        {/* アウェイチーム */}
                        <div className="col-span-3 text-left">
                          <div className="font-semibold text-lg">{teams[game.teamAwayId] || game.teamAwayId}</div>
                        </div>
                      </div>

                      {game.recorder && (
                        <div className="mt-3 text-sm text-gray-500">
                          記録: {game.recorder}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

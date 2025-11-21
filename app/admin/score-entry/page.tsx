"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { Game, Team } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function ScoreEntryContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress'>('scheduled');

  useEffect(() => {
    async function fetchData() {
      try {
        const params = tournamentId ? `?tournamentId=${tournamentId}` : '';

        const gamesRes = await fetch(`/api/games${params}`);
        if (!gamesRes.ok) throw new Error('試合情報の取得に失敗しました');
        const gamesData = await gamesRes.json();

        const teamsRes = await fetch(`/api/teams${params}`);
        if (!teamsRes.ok) throw new Error('チーム情報の取得に失敗しました');
        const teamsData = await teamsRes.json();

        setGames(gamesData);
        setTeams(teamsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
        setLoading(false);
      }
    }

    fetchData();
  }, [tournamentId]);

  async function handleScoreUpdate(gameId: string, scoreHome: number, scoreAway: number, status: string) {
    try {
      const res = await fetch(`/api/admin/games/${gameId}/score`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, scoreHome, scoreAway, status }),
      });

      if (!res.ok) throw new Error('スコアの更新に失敗しました');

      // ゲームリストを更新
      setGames(games.map(g =>
        g.gameId === gameId
          ? { ...g, scoreHome, scoreAway, status: status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' }
          : g
      ));

      alert('スコアを更新しました');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'スコアの更新に失敗しました');
    }
  }

  const backLink = tournamentId ? `/admin/tournament/${tournamentId}` : '/admin';

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={backLink} className="text-primary hover:underline">
              ← ダッシュボードに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-accent">スコア入力</h1>
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
              ← ダッシュボードに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-accent">スコア入力</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.status === filter;
  }).sort((a, b) => `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime}`));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={backLink} className="text-primary hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-accent">スコア入力</h1>

        {/* フィルター */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`px-4 py-2 rounded ${
              filter === 'scheduled'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            予定
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded ${
              filter === 'in_progress'
                ? 'bg-accent text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            進行中
          </button>
        </div>

        {/* 試合一覧 */}
        {filteredGames.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">該当する試合がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game) => (
              <ScoreCard
                key={game.gameId}
                game={game}
                teams={teams}
                onScoreUpdate={handleScoreUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ScoreCard({
  game,
  teams,
  onScoreUpdate,
}: {
  game: Game;
  teams: Team[];
  onScoreUpdate: (gameId: string, scoreHome: number, scoreAway: number, status: string) => void;
}) {
  const [scoreHome, setScoreHome] = useState(game.scoreHome);
  const [scoreAway, setScoreAway] = useState(game.scoreAway);
  const [status, setStatus] = useState(game.status);

  const homeTeam = teams.find(t => t.teamId === game.teamHomeId);
  const awayTeam = teams.find(t => t.teamId === game.teamAwayId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onScoreUpdate(game.gameId, scoreHome, scoreAway, status);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-gray-500">
            {game.scheduledDate} {game.scheduledTime}
          </span>
          <span className="text-sm text-gray-500">
            {game.gameType === 'league' ? 'リーグ戦' : 'トーナメント'}
            {game.block && ` - ブロック${game.block}`}
            {game.round && ` - ${game.round}`}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-4">
          {/* ホームチーム */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              {homeTeam?.teamName || game.teamHomeId}
            </div>
            <input
              type="number"
              min="0"
              value={scoreHome}
              onChange={(e) => setScoreHome(parseInt(e.target.value) || 0)}
              className="w-24 px-4 py-2 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-primary"
            />
          </div>

          {/* VS */}
          <div className="text-center text-2xl font-bold text-gray-400">
            VS
          </div>

          {/* アウェイチーム */}
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              {awayTeam?.teamName || game.teamAwayId}
            </div>
            <input
              type="number"
              min="0"
              value={scoreAway}
              onChange={(e) => setScoreAway(parseInt(e.target.value) || 0)}
              className="w-24 px-4 py-2 text-2xl font-bold text-center border-2 border-gray-300 rounded-lg focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="scheduled">予定</option>
            <option value="in_progress">進行中</option>
            <option value="completed">完了</option>
            <option value="cancelled">中止</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
          >
            スコア更新
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ScoreEntryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-accent">スコア入力</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    }>
      <ScoreEntryContent />
    </Suspense>
  );
}

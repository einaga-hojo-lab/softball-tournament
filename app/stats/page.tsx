"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlayerStats, TeamStats } from "@/lib/types";

export default function StatsPage() {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [teams, setTeams] = useState<{ [teamId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'team' | 'player'>('team');
  const [category, setCategory] = useState<'average' | 'homeruns' | 'rbis'>('average');
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const tid = searchParams.get('tournamentId');
        setTournamentId(tid);
        const params = tid ? `?tournamentId=${tid}` : '';

        // 並列で全データを取得
        const [playerStatsRes, teamStatsRes, teamsRes] = await Promise.all([
          fetch(`/api/stats${params}`),
          fetch(`/api/stats/team${params}`),
          fetch(`/api/teams${params}`)
        ]);

        if (!playerStatsRes.ok) throw new Error('個人成績の取得に失敗しました');
        if (!teamStatsRes.ok) throw new Error('チーム統計の取得に失敗しました');
        if (!teamsRes.ok) throw new Error('チーム情報の取得に失敗しました');

        const [playerStatsData, teamStatsData, teamsData] = await Promise.all([
          playerStatsRes.json(),
          teamStatsRes.json(),
          teamsRes.json()
        ]);

        // チームIDとチーム名のマッピングを作成
        const teamMap: { [teamId: string]: string } = {};
        teamsData.forEach((team: any) => {
          teamMap[team.teamId] = team.teamName;
        });

        setPlayerStats(playerStatsData);
        setTeamStats(teamStatsData);
        setTeams(teamMap);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const backLink = tournamentId ? `/admin/tournament/${tournamentId}` : '/schedule';
  const backText = tournamentId ? '← ダッシュボードに戻る' : '← スケジュールに戻る';

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={backLink} className="text-primary hover:underline">
              {backText}
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">統計情報</h1>
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
          <h1 className="text-4xl font-bold mb-8 text-primary">統計情報</h1>
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

  // カテゴリー別にソート（個人成績）
  const sortedPlayerStats = [...playerStats].sort((a, b) => {
    switch (category) {
      case 'average':
        return b.battingAverage - a.battingAverage;
      case 'homeruns':
        return b.homeruns - a.homeruns;
      case 'rbis':
        return b.rbis - a.rbis;
      default:
        return 0;
    }
  });

  const getRankBadge = (rank: number) => {
    if (rank === 0) return <span className="text-3xl">🥇</span>;
    if (rank === 1) return <span className="text-3xl">🥈</span>;
    if (rank === 2) return <span className="text-3xl">🥉</span>;
    return <span className="text-gray-600 font-bold">{rank + 1}</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={backLink} className="text-primary hover:underline">
            {backText}
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">統計情報</h1>

        {/* ビューモード切り替え */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setViewMode('team')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              viewMode === 'team'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            チーム統計
          </button>
          <button
            onClick={() => setViewMode('player')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              viewMode === 'player'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            個人成績
          </button>
        </div>

        {viewMode === 'team' ? (
          /* チーム統計表示 */
          teamStats.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">チーム統計データがありません。完了した試合がある場合に表示されます。</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">順位</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム名</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">試合数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">勝</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">敗</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">分</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">勝率</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">得点</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">失点</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">得失点差</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teamStats.map((stat, index) => (
                      <tr key={stat.teamId} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3 text-center">
                          {getRankBadge(index)}
                        </td>
                        <td className="px-4 py-3 font-medium">{stat.teamName}</td>
                        <td className="px-4 py-3 text-center">{stat.gamesPlayed}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{stat.wins}</td>
                        <td className="px-4 py-3 text-center font-semibold text-red-600">{stat.losses}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{stat.draws}</td>
                        <td className="px-4 py-3 text-center font-bold text-primary">{stat.winRate.toFixed(3)}</td>
                        <td className="px-4 py-3 text-center">{stat.runsScored}</td>
                        <td className="px-4 py-3 text-center">{stat.runsAllowed}</td>
                        <td className={`px-4 py-3 text-center font-semibold ${
                          stat.runDifferential > 0 ? 'text-green-600' :
                          stat.runDifferential < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {stat.runDifferential > 0 ? '+' : ''}{stat.runDifferential}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* 個人成績表示 */
          <>
            {/* カテゴリー選択 */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setCategory('average')}
                className={`px-4 py-2 rounded ${
                  category === 'average'
                    ? 'bg-accent text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                打率
              </button>
              <button
                onClick={() => setCategory('homeruns')}
                className={`px-4 py-2 rounded ${
                  category === 'homeruns'
                    ? 'bg-accent text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ホームラン
              </button>
              <button
                onClick={() => setCategory('rbis')}
                className={`px-4 py-2 rounded ${
                  category === 'rbis'
                    ? 'bg-accent text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                打点
              </button>
            </div>

            {sortedPlayerStats.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">個人成績データがありません。</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">順位</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">選手名</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">打席</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">安打</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">HR</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">打点</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">三振</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">打率</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedPlayerStats.map((stat, index) => (
                        <tr key={stat.playerId} className={`hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            {getRankBadge(index)}
                          </td>
                          <td className="px-4 py-3 font-medium">{stat.playerName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{teams[stat.teamId] || stat.teamId}</td>
                          <td className="px-4 py-3 text-center">{stat.atBats}</td>
                          <td className="px-4 py-3 text-center">{stat.hits}</td>
                          <td className="px-4 py-3 text-center font-semibold text-orange-600">{stat.homeruns}</td>
                          <td className="px-4 py-3 text-center font-semibold text-green-600">{stat.rbis}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{stat.strikeouts}</td>
                          <td className="px-4 py-3 text-center font-bold text-primary">{stat.battingAverage.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

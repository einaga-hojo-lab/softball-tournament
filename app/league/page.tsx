"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LeagueStanding } from "@/lib/types";

export default function LeaguePage() {
  const [standings, setStandings] = useState<{ [block: string]: LeagueStanding[] }>({});
  const [teams, setTeams] = useState<{ [teamId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const tid = searchParams.get('tournamentId');
        setTournamentId(tid);
        const params = tid ? `?tournamentId=${tid}` : '';

        // リーグ順位表を取得
        const standingsRes = await fetch(`/api/league${params}`);
        if (!standingsRes.ok) throw new Error('リーグ順位表の取得に失敗しました');
        const standingsData = await standingsRes.json();

        // チーム情報を取得
        const teamsRes = await fetch(`/api/teams${params}`);
        if (!teamsRes.ok) throw new Error('チーム情報の取得に失敗しました');
        const teamsData = await teamsRes.json();

        // チームIDとチーム名のマッピングを作成
        const teamMap: { [teamId: string]: string } = {};
        teamsData.forEach((team: any) => {
          teamMap[team.teamId] = team.teamName;
        });

        setStandings(standingsData);
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
          <h1 className="text-4xl font-bold mb-8 text-primary">
            リーグ戦順位表
          </h1>
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
          <h1 className="text-4xl font-bold mb-8 text-primary">
            リーグ戦順位表
          </h1>
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

  const blocks = Object.keys(standings).sort();

  if (blocks.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/schedule" className="text-primary hover:underline">
              ← スケジュールに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">
            リーグ戦順位表
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">リーグ戦のデータがありません。</p>
            <p className="text-sm text-gray-500 mt-2">
              Google Sheetsにサンプルデータを追加してください。
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={backLink} className="text-primary hover:underline">
            {backText}
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">
          リーグ戦順位表
        </h1>

        <div className="space-y-8">
          {blocks.map(block => (
            <div key={block} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-primary text-white px-6 py-3">
                <h2 className="text-2xl font-bold">ブロック {block}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">順位</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム名</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">試合数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">勝</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">敗</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">分</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">勝率</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">得点</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">失点</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {standings[block].map(standing => (
                      <tr key={standing.teamId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-center font-bold text-lg">
                          {standing.rank === 1 && <span className="text-yellow-500">🥇</span>}
                          {standing.rank === 2 && <span className="text-gray-400">🥈</span>}
                          {standing.rank === 3 && <span className="text-orange-600">🥉</span>}
                          {standing.rank > 3 && <span className="text-gray-600">{standing.rank}</span>}
                        </td>
                        <td className="px-4 py-3 font-medium">{teams[standing.teamId] || standing.teamId}</td>
                        <td className="px-4 py-3 text-center">{standing.games}</td>
                        <td className="px-4 py-3 text-center font-semibold text-green-600">{standing.wins}</td>
                        <td className="px-4 py-3 text-center font-semibold text-red-600">{standing.losses}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{standing.draws}</td>
                        <td className="px-4 py-3 text-center font-semibold">{standing.winRate.toFixed(3)}</td>
                        <td className="px-4 py-3 text-center">{standing.pointsFor}</td>
                        <td className="px-4 py-3 text-center">{standing.pointsAgainst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

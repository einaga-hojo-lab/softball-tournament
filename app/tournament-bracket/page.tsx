"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { TournamentBracket } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function TournamentBracketContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const [bracket, setBracket] = useState<TournamentBracket[]>([]);
  const [teams, setTeams] = useState<{ [teamId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  async function fetchData() {
    try {
      if (!tournamentId) {
        throw new Error('大会IDが指定されていません');
      }

      const params = `?tournamentId=${tournamentId}`;

      const [bracketRes, teamsRes] = await Promise.all([
        fetch(`/api/tournament-bracket${params}`),
        fetch(`/api/teams${params}`)
      ]);

      if (!bracketRes.ok) throw new Error('トーナメント表の取得に失敗しました');
      if (!teamsRes.ok) throw new Error('チーム情報の取得に失敗しました');

      const [bracketData, teamsData] = await Promise.all([
        bracketRes.json(),
        teamsRes.json()
      ]);

      // チームIDとチーム名のマッピングを作成
      const teamMap: { [teamId: string]: string } = {};
      teamsData.forEach((team: any) => {
        teamMap[team.teamId] = team.teamName;
      });

      setBracket(bracketData);
      setTeams(teamMap);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
      setLoading(false);
    }
  }

  async function advanceWinner(gameId: string, winnerId: string) {
    if (!confirm('この勝者を次のラウンドに進めますか？')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/tournament-bracket/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          gameId,
          winnerId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '勝者の進行に失敗しました');
      }

      alert('勝者を次のラウンドに進めました');
      fetchData(); // データを再取得
    } catch (err) {
      alert(err instanceof Error ? err.message : '不明なエラー');
    }
  }

  const backLink = tournamentId ? `/admin/tournament/${tournamentId}` : '/';

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href={backLink} className="text-primary hover:underline">
              ← ダッシュボードに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-8 text-primary">トーナメント表</h1>
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
          <h1 className="text-4xl font-bold mb-8 text-primary">トーナメント表</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  // ラウンド別にグループ化
  const rounds: { [round: string]: TournamentBracket[] } = {};
  bracket.forEach(match => {
    if (!rounds[match.round]) {
      rounds[match.round] = [];
    }
    rounds[match.round].push(match);
  });

  const roundOrder = ['1回戦', '2回戦', '準々決勝', '準決勝', '3位決定戦', '決勝'];
  const orderedRounds = roundOrder.filter(round => rounds[round]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={backLink} className="text-primary hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-primary">トーナメント表</h1>

        {bracket.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">トーナメント表が生成されていません。</p>
            <p className="text-sm text-gray-500 mt-2">
              ダッシュボードからトーナメント表を生成してください。
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedRounds.map(round => (
              <div key={round} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-primary text-white px-6 py-3">
                  <h2 className="text-2xl font-bold">{round}</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rounds[round].map((match, index) => (
                      <div
                        key={match.gameId}
                        className={`border-2 rounded-lg p-4 ${
                          match.winnerId
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-300'
                        }`}
                      >
                        <div className="text-sm text-gray-500 mb-2">
                          試合 {index + 1}
                        </div>
                        <div className="space-y-2">
                          <div
                            className={`flex justify-between items-center p-2 rounded ${
                              match.winnerId === match.team1Id
                                ? 'bg-green-100 font-bold'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span>{teams[match.team1Id] || match.team1Id}</span>
                            {match.score1 !== undefined && (
                              <span className="text-lg font-bold">{match.score1}</span>
                            )}
                          </div>
                          <div className="text-center text-sm text-gray-500">VS</div>
                          <div
                            className={`flex justify-between items-center p-2 rounded ${
                              match.winnerId === match.team2Id
                                ? 'bg-green-100 font-bold'
                                : 'bg-gray-50'
                            }`}
                          >
                            <span>{teams[match.team2Id] || match.team2Id}</span>
                            {match.score2 !== undefined && (
                              <span className="text-lg font-bold">{match.score2}</span>
                            )}
                          </div>
                        </div>
                        {match.winnerId && (
                          <div className="mt-3 text-center text-sm">
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full">
                              勝者: {teams[match.winnerId]}
                            </span>
                          </div>
                        )}
                        {match.winnerId && round !== '決勝' && (
                          <div className="mt-3">
                            <button
                              onClick={() => advanceWinner(match.gameId, match.winnerId!)}
                              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            >
                              次ラウンドに進める
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TournamentBracketPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-primary">トーナメント表</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    }>
      <TournamentBracketContent />
    </Suspense>
  );
}

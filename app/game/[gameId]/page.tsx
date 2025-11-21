"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Game, Team, Inning, AtBat, Player } from "@/lib/types";

export default function GameDetailPage({ params }: { params: { gameId: string } }) {
  const { gameId } = params;

  const [game, setGame] = useState<Game | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [innings, setInnings] = useState<Inning[]>([]);
  const [atBats, setAtBats] = useState<AtBat[]>([]);
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // イニング入力フォーム
  const [showInningForm, setShowInningForm] = useState(false);
  const [inningNumber, setInningNumber] = useState(1);
  const [homeInningScore, setHomeInningScore] = useState(0);
  const [awayInningScore, setAwayInningScore] = useState(0);

  // 打席記録入力フォーム
  const [showAtBatForm, setShowAtBatForm] = useState(false);
  const [atBatInning, setAtBatInning] = useState(1);
  const [atBatTeam, setAtBatTeam] = useState<'home' | 'away'>('home');
  const [atBatPlayer, setAtBatPlayer] = useState('');
  const [atBatOrder, setAtBatOrder] = useState(1);
  const [atBatResult, setAtBatResult] = useState<string>('hit');
  const [atBatBases, setAtBatBases] = useState(1);
  const [atBatRbi, setAtBatRbi] = useState(0);
  const [atBatIsHomerun, setAtBatIsHomerun] = useState(false);

  useEffect(() => {
    fetchData();
  }, [gameId]);

  async function fetchData() {
    try {
      const [gameRes, inningsRes, atBatsRes] = await Promise.all([
        fetch(`/api/games?gameId=${gameId}`),
        fetch(`/api/admin/innings?gameId=${gameId}`),
        fetch(`/api/admin/at-bats?gameId=${gameId}`),
      ]);

      if (!gameRes.ok) throw new Error('試合情報の取得に失敗しました');

      const gamesData = await gameRes.json();
      const gameData = Array.isArray(gamesData) ? gamesData[0] : gamesData;

      if (!gameData) throw new Error('試合が見つかりません');

      setGame(gameData);

      // チーム情報を取得
      const [homeTeamRes, awayTeamRes] = await Promise.all([
        fetch(`/api/teams?teamId=${gameData.teamHomeId}`),
        fetch(`/api/teams?teamId=${gameData.teamAwayId}`),
      ]);

      if (homeTeamRes.ok) {
        const homeTeamData = await homeTeamRes.json();
        setHomeTeam(Array.isArray(homeTeamData) ? homeTeamData[0] : homeTeamData);
      }

      if (awayTeamRes.ok) {
        const awayTeamData = await awayTeamRes.json();
        setAwayTeam(Array.isArray(awayTeamData) ? awayTeamData[0] : awayTeamData);
      }

      // プレイヤー情報を取得
      const [homePlayersRes, awayPlayersRes] = await Promise.all([
        fetch(`/api/players?teamId=${gameData.teamHomeId}`),
        fetch(`/api/players?teamId=${gameData.teamAwayId}`),
      ]);

      if (homePlayersRes.ok) {
        setHomePlayers(await homePlayersRes.json());
      }

      if (awayPlayersRes.ok) {
        setAwayPlayers(await awayPlayersRes.json());
      }

      if (inningsRes.ok) {
        setInnings(await inningsRes.json());
      }

      if (atBatsRes.ok) {
        setAtBats(await atBatsRes.json());
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
      setLoading(false);
    }
  }

  async function handleSaveInning() {
    try {
      const res = await fetch('/api/admin/innings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          inning: inningNumber,
          homeScore: homeInningScore,
          awayScore: awayInningScore,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'イニングスコアの保存に失敗しました');
      }

      alert('イニングスコアを保存しました');
      setShowInningForm(false);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '不明なエラー');
    }
  }

  async function handleSaveAtBat() {
    try {
      const teamId = atBatTeam === 'home' ? game?.teamHomeId : game?.teamAwayId;

      const res = await fetch('/api/admin/at-bats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          inning: atBatInning,
          teamId,
          playerId: atBatPlayer,
          battingOrder: atBatOrder,
          result: atBatResult,
          bases: atBatBases,
          isHomerun: atBatIsHomerun,
          rbi: atBatRbi,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '打席記録の保存に失敗しました');
      }

      alert('打席記録を保存しました');
      setShowAtBatForm(false);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : '不明なエラー');
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-red-600">{error || '試合が見つかりません'}</p>
        </div>
      </main>
    );
  }

  // イニング別スコアボード
  const totalHomeScore = innings.reduce((sum, inn) => sum + inn.homeScore, 0);
  const totalAwayScore = innings.reduce((sum, inn) => sum + inn.awayScore, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/games" className="text-primary hover:underline">
            ← 試合一覧に戻る
          </Link>
        </div>

        {/* 試合情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">試合詳細</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">試合ID</p>
              <p className="font-semibold">{game.gameId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ステータス</p>
              <p className="font-semibold">
                {game.status === 'scheduled'
                  ? '予定'
                  : game.status === 'in_progress'
                  ? '進行中'
                  : game.status === 'completed'
                  ? '完了'
                  : game.status === 'cancelled'
                  ? '中止'
                  : '延期'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">日時</p>
              <p className="font-semibold">
                {game.scheduledDate} {game.scheduledTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">会場</p>
              <p className="font-semibold">
                {game.groundNumber ? `${game.groundNumber}番グラウンド` : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* スコアボード */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">スコアボード</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">チーム</th>
                  {innings.map((inn) => (
                    <th key={inn.inning} className="border px-4 py-2 text-center">
                      {inn.inning}
                    </th>
                  ))}
                  <th className="border px-4 py-2 text-center font-bold">合計</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 font-semibold">
                    {homeTeam?.teamName || game.teamHomeId}
                  </td>
                  {innings.map((inn) => (
                    <td key={inn.inning} className="border px-4 py-2 text-center">
                      {inn.homeScore}
                    </td>
                  ))}
                  <td className="border px-4 py-2 text-center font-bold text-lg">
                    {totalHomeScore}
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 font-semibold">
                    {awayTeam?.teamName || game.teamAwayId}
                  </td>
                  {innings.map((inn) => (
                    <td key={inn.inning} className="border px-4 py-2 text-center">
                      {inn.awayScore}
                    </td>
                  ))}
                  <td className="border px-4 py-2 text-center font-bold text-lg">
                    {totalAwayScore}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setShowInningForm(!showInningForm)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              {showInningForm ? 'フォームを閉じる' : 'イニングスコアを入力'}
            </button>
          </div>

          {/* イニング入力フォーム */}
          {showInningForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3">イニングスコア入力</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">イニング</label>
                  <input
                    type="number"
                    min="1"
                    value={inningNumber}
                    onChange={(e) => setInningNumber(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {homeTeam?.teamName || 'ホーム'}得点
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={homeInningScore}
                    onChange={(e) => setHomeInningScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {awayTeam?.teamName || 'アウェイ'}得点
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={awayInningScore}
                    onChange={(e) => setAwayInningScore(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSaveInning}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 打席記録 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">打席記録</h2>
          <div className="mb-4">
            <button
              onClick={() => setShowAtBatForm(!showAtBatForm)}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90"
            >
              {showAtBatForm ? 'フォームを閉じる' : '打席記録を追加'}
            </button>
          </div>

          {/* 打席入力フォーム */}
          {showAtBatForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3">打席記録入力</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">イニング</label>
                  <input
                    type="number"
                    min="1"
                    value={atBatInning}
                    onChange={(e) => setAtBatInning(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">チーム</label>
                  <select
                    value={atBatTeam}
                    onChange={(e) => setAtBatTeam(e.target.value as 'home' | 'away')}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="home">{homeTeam?.teamName || 'ホーム'}</option>
                    <option value="away">{awayTeam?.teamName || 'アウェイ'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">選手</label>
                  <select
                    value={atBatPlayer}
                    onChange={(e) => setAtBatPlayer(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="">選手を選択</option>
                    {(atBatTeam === 'home' ? homePlayers : awayPlayers).map((player) => (
                      <option key={player.playerId} value={player.playerId}>
                        {player.playerName} (#{player.uniformNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">打順</label>
                  <input
                    type="number"
                    min="1"
                    value={atBatOrder}
                    onChange={(e) => setAtBatOrder(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">結果</label>
                  <select
                    value={atBatResult}
                    onChange={(e) => setAtBatResult(e.target.value)}
                    className="w-full px-3 py-2 border rounded"
                  >
                    <option value="hit">ヒット</option>
                    <option value="homerun">ホームラン</option>
                    <option value="out">アウト</option>
                    <option value="strikeout">三振</option>
                    <option value="walk">四球</option>
                    <option value="error">エラー</option>
                    <option value="sacrifice">犠打</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">塁打数</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={atBatBases}
                    onChange={(e) => setAtBatBases(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">打点</label>
                  <input
                    type="number"
                    min="0"
                    value={atBatRbi}
                    onChange={(e) => setAtBatRbi(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={atBatIsHomerun}
                      onChange={(e) => setAtBatIsHomerun(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">ホームラン</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleSaveAtBat}
                    disabled={!atBatPlayer}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 打席記録リスト */}
          {atBats.length === 0 ? (
            <p className="text-gray-500">打席記録がありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">イニング</th>
                    <th className="px-4 py-2 text-left">打順</th>
                    <th className="px-4 py-2 text-left">選手</th>
                    <th className="px-4 py-2 text-left">結果</th>
                    <th className="px-4 py-2 text-center">塁打</th>
                    <th className="px-4 py-2 text-center">打点</th>
                  </tr>
                </thead>
                <tbody>
                  {atBats.map((atBat, index) => {
                    const player = [...homePlayers, ...awayPlayers].find(
                      (p) => p.playerId === atBat.playerId
                    );
                    return (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2">{atBat.inning}回</td>
                        <td className="px-4 py-2">{atBat.battingOrder}</td>
                        <td className="px-4 py-2">
                          {player?.playerName || atBat.playerId}
                        </td>
                        <td className="px-4 py-2">
                          {atBat.result === 'hit'
                            ? 'ヒット'
                            : atBat.result === 'homerun'
                            ? 'ホームラン'
                            : atBat.result === 'out'
                            ? 'アウト'
                            : atBat.result === 'strikeout'
                            ? '三振'
                            : atBat.result === 'walk'
                            ? '四球'
                            : atBat.result === 'error'
                            ? 'エラー'
                            : '犠打'}
                          {atBat.isHomerun && ' ⚾'}
                        </td>
                        <td className="px-4 py-2 text-center">{atBat.bases}</td>
                        <td className="px-4 py-2 text-center">{atBat.rbi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

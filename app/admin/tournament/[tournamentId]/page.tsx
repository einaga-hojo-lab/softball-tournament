"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Team, Game, Player } from "@/lib/types";

interface DashboardStats {
  tournament: any;
  participantsCount: number;
  teamsCount: number;
  gamesTotal: number;
  gamesCompleted: number;
  gamesScheduled: number;
  leagueGames: number;
  tournamentGames: number;
}

export default function TournamentDashboardPage() {
  const params = useParams();
  const tournamentId = params.tournamentId as string;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // チーム管理関連のステート
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamFormData, setTeamFormData] = useState({
    teamName: "",
    block: "",
    combinedTeam: false,
    captainName: "",
    captainEmail: "",
    memberCount: 0,
    notes: "",
  });

  // 試合管理関連のステート
  const [games, setGames] = useState<Game[]>([]);
  const [showGameForm, setShowGameForm] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameFormData, setGameFormData] = useState({
    gameType: "league" as "league" | "tournament",
    block: "",
    round: "",
    teamHomeId: "",
    teamAwayId: "",
    scoreHome: 0,
    scoreAway: 0,
    status: "scheduled" as "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed",
    scheduledDate: "",
    scheduledTime: "",
    groundNumber: 1,
    referee: "",
    recorder: "",
  });

  // 選手管理関連のステート
  const [players, setPlayers] = useState<Player[]>([]);
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerFormData, setPlayerFormData] = useState({
    teamId: "",
    playerName: "",
    uniformNumber: 0,
    position: "",
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 大会情報を取得
        const tournamentRes = await fetch(`/api/admin/tournaments/${tournamentId}`);
        if (!tournamentRes.ok) throw new Error('大会情報の取得に失敗しました');
        const tournament = await tournamentRes.json();

        // チーム情報を取得
        const teamsRes = await fetch(`/api/teams?tournamentId=${tournamentId}`);
        const teams = await teamsRes.json();

        // 試合情報を取得
        const gamesRes = await fetch(`/api/games?tournamentId=${tournamentId}`);
        const games = await gamesRes.json();

        // 選手情報を取得
        const playersRes = await fetch(`/api/players?tournamentId=${tournamentId}`);
        const players = await playersRes.json();

        // 個人成績を取得（参加者数のカウント用）
        const statsRes = await fetch(`/api/stats?tournamentId=${tournamentId}`);
        const playerStats = await statsRes.json();

        // 統計情報を計算
        const dashboardStats: DashboardStats = {
          tournament,
          participantsCount: playerStats.length,
          teamsCount: teams.length,
          gamesTotal: games.length,
          gamesCompleted: games.filter((g: any) => g.status === 'completed').length,
          gamesScheduled: games.filter((g: any) => g.status === 'scheduled').length,
          leagueGames: games.filter((g: any) => g.gameType === 'league').length,
          tournamentGames: games.filter((g: any) => g.gameType === 'tournament').length,
        };

        setStats(dashboardStats);
        setTeams(teams);
        setGames(games);
        setPlayers(players);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [tournamentId]);

  // チーム管理関数
  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...teamFormData }),
      });

      if (!res.ok) throw new Error('チームの作成に失敗しました');

      const newTeam = await res.json();
      setTeams([...teams, newTeam]);
      setShowTeamForm(false);
      resetTeamForm();

      // 統計を更新
      if (stats) {
        setStats({ ...stats, teamsCount: stats.teamsCount + 1 });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'チームの作成に失敗しました');
    }
  }

  async function handleUpdateTeam(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      const res = await fetch(`/api/admin/teams/${editingTeam.teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...teamFormData }),
      });

      if (!res.ok) throw new Error('チームの更新に失敗しました');

      setTeams(teams.map(t =>
        t.teamId === editingTeam.teamId
          ? { ...t, ...teamFormData }
          : t
      ));
      setEditingTeam(null);
      setShowTeamForm(false);
      resetTeamForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'チームの更新に失敗しました');
    }
  }

  async function handleDeleteTeam(teamId: string, teamName: string) {
    if (!confirm(`本当に「${teamName}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/teams/${teamId}?tournamentId=${tournamentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('チームの削除に失敗しました');

      setTeams(teams.filter(t => t.teamId !== teamId));

      // 統計を更新
      if (stats) {
        setStats({ ...stats, teamsCount: stats.teamsCount - 1 });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'チームの削除に失敗しました');
    }
  }

  function openEditForm(team: Team) {
    setEditingTeam(team);
    setTeamFormData({
      teamName: team.teamName,
      block: team.block || "",
      combinedTeam: team.combinedTeam || false,
      captainName: team.captainName || "",
      captainEmail: team.captainEmail || "",
      memberCount: team.memberCount || 0,
      notes: team.notes || "",
    });
    setShowTeamForm(true);
  }

  function resetTeamForm() {
    setTeamFormData({
      teamName: "",
      block: "",
      combinedTeam: false,
      captainName: "",
      captainEmail: "",
      memberCount: 0,
      notes: "",
    });
    setEditingTeam(null);
  }

  // 試合管理関数
  async function handleCreateGame(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...gameFormData }),
      });

      if (!res.ok) throw new Error('試合の作成に失敗しました');

      const newGame = await res.json();
      setGames([...games, newGame]);
      setShowGameForm(false);
      resetGameForm();

      // 統計を更新
      if (stats) {
        setStats({
          ...stats,
          gamesTotal: stats.gamesTotal + 1,
          gamesScheduled: stats.gamesScheduled + 1,
          leagueGames: newGame.gameType === 'league' ? stats.leagueGames + 1 : stats.leagueGames,
          tournamentGames: newGame.gameType === 'tournament' ? stats.tournamentGames + 1 : stats.tournamentGames,
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '試合の作成に失敗しました');
    }
  }

  async function handleUpdateGame(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGame) return;

    try {
      const res = await fetch(`/api/admin/games/${editingGame.gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...gameFormData }),
      });

      if (!res.ok) throw new Error('試合の更新に失敗しました');

      setGames(games.map(g =>
        g.gameId === editingGame.gameId
          ? { ...g, ...gameFormData }
          : g
      ));
      setEditingGame(null);
      setShowGameForm(false);
      resetGameForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : '試合の更新に失敗しました');
    }
  }

  async function handleDeleteGame(gameId: string) {
    if (!confirm('本当にこの試合を削除しますか？\n\nこの操作は取り消せません。')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/games/${gameId}?tournamentId=${tournamentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('試合の削除に失敗しました');

      const deletedGame = games.find(g => g.gameId === gameId);
      setGames(games.filter(g => g.gameId !== gameId));

      // 統計を更新
      if (stats && deletedGame) {
        setStats({
          ...stats,
          gamesTotal: stats.gamesTotal - 1,
          gamesScheduled: deletedGame.status === 'scheduled' ? stats.gamesScheduled - 1 : stats.gamesScheduled,
          gamesCompleted: deletedGame.status === 'completed' ? stats.gamesCompleted - 1 : stats.gamesCompleted,
          leagueGames: deletedGame.gameType === 'league' ? stats.leagueGames - 1 : stats.leagueGames,
          tournamentGames: deletedGame.gameType === 'tournament' ? stats.tournamentGames - 1 : stats.tournamentGames,
        });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '試合の削除に失敗しました');
    }
  }

  function openEditGameForm(game: Game) {
    setEditingGame(game);
    setGameFormData({
      gameType: game.gameType,
      block: game.block || "",
      round: game.round || "",
      teamHomeId: game.teamHomeId,
      teamAwayId: game.teamAwayId,
      scoreHome: game.scoreHome,
      scoreAway: game.scoreAway,
      status: game.status,
      scheduledDate: game.scheduledDate,
      scheduledTime: game.scheduledTime,
      groundNumber: game.groundNumber,
      referee: game.referee || "",
      recorder: game.recorder || "",
    });
    setShowGameForm(true);
  }

  function resetGameForm() {
    setGameFormData({
      gameType: "league" as "league" | "tournament",
      block: "",
      round: "",
      teamHomeId: "",
      teamAwayId: "",
      scoreHome: 0,
      scoreAway: 0,
      status: "scheduled" as "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed",
      scheduledDate: "",
      scheduledTime: "",
      groundNumber: 1,
      referee: "",
      recorder: "",
    });
    setEditingGame(null);
  }

  // 選手管理関数
  async function handleCreatePlayer(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...playerFormData }),
      });

      if (!res.ok) throw new Error('選手の作成に失敗しました');

      const newPlayer = await res.json();
      setPlayers([...players, newPlayer]);
      setShowPlayerForm(false);
      resetPlayerForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : '選手の作成に失敗しました');
    }
  }

  async function handleUpdatePlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const res = await fetch(`/api/admin/players/${editingPlayer.playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, ...playerFormData }),
      });

      if (!res.ok) throw new Error('選手の更新に失敗しました');

      setPlayers(players.map(p =>
        p.playerId === editingPlayer.playerId
          ? { ...p, ...playerFormData }
          : p
      ));
      setEditingPlayer(null);
      setShowPlayerForm(false);
      resetPlayerForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : '選手の更新に失敗しました');
    }
  }

  async function handleDeletePlayer(playerId: string, playerName: string) {
    if (!confirm(`本当に「${playerName}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/players/${playerId}?tournamentId=${tournamentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('選手の削除に失敗しました');

      setPlayers(players.filter(p => p.playerId !== playerId));
    } catch (err) {
      alert(err instanceof Error ? err.message : '選手の削除に失敗しました');
    }
  }

  function openEditPlayerForm(player: Player) {
    setEditingPlayer(player);
    setPlayerFormData({
      teamId: player.teamId,
      playerName: player.playerName,
      uniformNumber: player.uniformNumber,
      position: player.position || "",
    });
    setShowPlayerForm(true);
  }

  function resetPlayerForm() {
    setPlayerFormData({
      teamId: "",
      playerName: "",
      uniformNumber: 0,
      position: "",
    });
    setEditingPlayer(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin" className="text-primary hover:underline">
              ← 大会一覧に戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-accent">大会ダッシュボード</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin" className="text-primary hover:underline">
              ← 大会一覧に戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-accent">大会ダッシュボード</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <p className="text-red-600">{error || 'データの取得に失敗しました'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin" className="text-primary hover:underline">
            ← 大会一覧に戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-accent">
          大会ダッシュボード
        </h1>
        <p className="text-gray-600 mb-8">
          {stats.tournament.tournamentName} - 大会運営・管理機能
        </p>

        {/* 概要統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">参加者数</p>
                <p className="text-3xl font-bold text-primary">{stats.participantsCount}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">チーム数</p>
                <p className="text-3xl font-bold text-primary">{stats.teamsCount}</p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総試合数</p>
                <p className="text-3xl font-bold text-primary">{stats.gamesTotal}</p>
                <p className="text-xs text-gray-500 mt-1">
                  完了: {stats.gamesCompleted} / 予定: {stats.gamesScheduled}
                </p>
              </div>
              <div className="text-4xl">⚾</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">大会進行率</p>
                <p className="text-3xl font-bold text-primary">
                  {stats.gamesTotal > 0
                    ? Math.round((stats.gamesCompleted / stats.gamesTotal) * 100)
                    : 0}%
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">クイックアクション</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/schedule?tournamentId=${tournamentId}`}>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-blue-500">
                <h3 className="font-semibold text-lg mb-2">📅 スケジュール確認</h3>
                <p className="text-sm text-gray-600">試合スケジュールを表示</p>
              </div>
            </Link>

            <Link href={`/games?tournamentId=${tournamentId}`}>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-green-500">
                <h3 className="font-semibold text-lg mb-2">⚾ 試合結果</h3>
                <p className="text-sm text-gray-600">試合結果の確認・編集</p>
              </div>
            </Link>

            <Link href={`/league?tournamentId=${tournamentId}`}>
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-yellow-500">
                <h3 className="font-semibold text-lg mb-2">🏆 リーグ順位表</h3>
                <p className="text-sm text-gray-600">順位表を確認</p>
              </div>
            </Link>
          </div>
        </div>

        {/* 管理機能メニュー */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">管理機能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                参加者・集金管理
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">👥 参加者一覧</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">💰 集金状況</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📧 リマインダー送信</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                チーム・リーグ編成
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🎯 チーム管理</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🔀 リーグ自動振り分け</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">⭐ シード設定</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                スケジュール管理
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📅 スケジュール自動生成</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">✏️ スケジュール調整</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🏟️ グラウンド割り当て</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                試合記録
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <Link href={`/admin/score-entry?tournamentId=${tournamentId}`}>
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer text-primary font-semibold">⚾ スコア入力 →</li>
                </Link>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📝 詳細記録</li>
                <Link href={`/tournament-bracket?tournamentId=${tournamentId}`}>
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer text-primary font-semibold">🏆 トーナメント表 →</li>
                </Link>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                データ管理
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <Link href={`/admin/participants?tournamentId=${tournamentId}`}>
                  <li className="p-2 hover:bg-gray-50 rounded cursor-pointer text-primary font-semibold">💰 参加費管理 →</li>
                </Link>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📥 データエクスポート</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">💾 バックアップ</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🗃️ アーカイブ</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ データエクスポート以降は開発中</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                大会設定
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">⚙️ 基本設定</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📋 大会ルール</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🔒 アーカイブ</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
            </div>
          </div>
        </div>

        {/* チーム管理セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">チーム管理</h2>
            <button
              onClick={() => {
                resetTeamForm();
                setShowTeamForm(!showTeamForm);
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {showTeamForm ? 'キャンセル' : '+ 新規チーム追加'}
            </button>
          </div>

          {/* チーム追加/編集フォーム */}
          {showTeamForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">
                {editingTeam ? 'チーム編集' : '新規チーム追加'}
              </h3>
              <form onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      チーム名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={teamFormData.teamName}
                      onChange={(e) => setTeamFormData({ ...teamFormData, teamName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: チームA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ブロック
                    </label>
                    <select
                      value={teamFormData.block}
                      onChange={(e) => setTeamFormData({ ...teamFormData, block: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">未設定</option>
                      <option value="A">ブロックA</option>
                      <option value="B">ブロックB</option>
                      <option value="C">ブロックC</option>
                      <option value="D">ブロックD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      キャプテン名
                    </label>
                    <input
                      type="text"
                      value={teamFormData.captainName}
                      onChange={(e) => setTeamFormData({ ...teamFormData, captainName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: 山田太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      キャプテンメール
                    </label>
                    <input
                      type="email"
                      value={teamFormData.captainEmail}
                      onChange={(e) => setTeamFormData({ ...teamFormData, captainEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: yamada@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メンバー数
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={teamFormData.memberCount}
                      onChange={(e) => setTeamFormData({ ...teamFormData, memberCount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mt-8">
                      <input
                        type="checkbox"
                        checked={teamFormData.combinedTeam}
                        onChange={(e) => setTeamFormData({ ...teamFormData, combinedTeam: e.target.checked })}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm font-medium text-gray-700">混合チーム</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備考
                    </label>
                    <textarea
                      value={teamFormData.notes}
                      onChange={(e) => setTeamFormData({ ...teamFormData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="その他メモ"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTeamForm(false);
                      resetTeamForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                  >
                    {editingTeam ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* チーム一覧 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-primary">登録チーム一覧 ({teams.length}チーム)</h3>
            </div>

            {teams.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="mb-4">チームが登録されていません</p>
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                >
                  最初のチームを作成
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム名</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">ブロック</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">キャプテン</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">メンバー数</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">混合</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {teams.map((team) => (
                      <tr key={team.teamId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{team.teamName}</td>
                        <td className="px-4 py-3 text-center">
                          {team.block ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              ブロック{team.block}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">未設定</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div>{team.captainName || '-'}</div>
                          {team.captainEmail && (
                            <div className="text-xs text-gray-500">{team.captainEmail}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">{team.memberCount || 0}人</td>
                        <td className="px-4 py-3 text-center">
                          {team.combinedTeam && <span className="text-green-600">✓</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditForm(team)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteTeam(team.teamId, team.teamName)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* トーナメント生成セクション */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">トーナメント表生成</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600 mb-4">
              登録されているチームからトーナメント表を自動生成します（4, 8, 16, 32チームに対応）。
            </p>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  if (!confirm(`${teams.length}チームでトーナメント表を生成しますか？\n※既存のトーナメント試合は上書きされません`)) return;

                  try {
                    const teamIds = teams.map(t => t.teamId);
                    const res = await fetch('/api/admin/tournament-bracket/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tournamentId,
                        teamIds,
                        useSeedRanking: false,
                      }),
                    });

                    if (!res.ok) {
                      const error = await res.json();
                      throw new Error(error.error || 'トーナメント表の生成に失敗しました');
                    }

                    alert('トーナメント表を生成しました！');
                    window.location.reload();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'トーナメント表の生成に失敗しました');
                  }
                }}
                disabled={teams.length === 0 || ![4, 8, 16, 32].includes(teams.length)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ランダム生成 ({teams.length}チーム)
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`${teams.length}チームでトーナメント表を生成しますか？（シード順）\n※既存のトーナメント試合は上書きされません`)) return;

                  try {
                    const teamIds = teams.map(t => t.teamId);
                    const res = await fetch('/api/admin/tournament-bracket/generate', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        tournamentId,
                        teamIds,
                        useSeedRanking: true,
                      }),
                    });

                    if (!res.ok) {
                      const error = await res.json();
                      throw new Error(error.error || 'トーナメント表の生成に失敗しました');
                    }

                    alert('トーナメント表を生成しました！');
                    window.location.reload();
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'トーナメント表の生成に失敗しました');
                  }
                }}
                disabled={teams.length === 0 || ![4, 8, 16, 32].includes(teams.length)}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                シード順生成 ({teams.length}チーム)
              </button>
            </div>
            {teams.length > 0 && ![4, 8, 16, 32].includes(teams.length) && (
              <p className="text-red-600 text-sm mt-2">
                ※ トーナメント生成には4, 8, 16, 32チームが必要です（現在: {teams.length}チーム）
              </p>
            )}
          </div>
        </div>

        {/* 試合管理セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">試合スケジュール管理</h2>
            <button
              onClick={() => {
                resetGameForm();
                setShowGameForm(!showGameForm);
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {showGameForm ? 'キャンセル' : '+ 新規試合追加'}
            </button>
          </div>

          {/* 試合追加/編集フォーム */}
          {showGameForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">
                {editingGame ? '試合編集' : '新規試合追加'}
              </h3>
              <form onSubmit={editingGame ? handleUpdateGame : handleCreateGame} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      試合タイプ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={gameFormData.gameType}
                      onChange={(e) => setGameFormData({ ...gameFormData, gameType: e.target.value as "league" | "tournament" })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="league">リーグ戦</option>
                      <option value="tournament">トーナメント</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ブロック/ラウンド
                    </label>
                    <input
                      type="text"
                      value={gameFormData.gameType === 'league' ? gameFormData.block : gameFormData.round}
                      onChange={(e) => setGameFormData({
                        ...gameFormData,
                        ...(gameFormData.gameType === 'league' ? { block: e.target.value } : { round: e.target.value })
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={gameFormData.gameType === 'league' ? 'A, B, C...' : '準々決勝、準決勝...'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ホームチーム <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={gameFormData.teamHomeId}
                      onChange={(e) => setGameFormData({ ...gameFormData, teamHomeId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      {teams.map(team => (
                        <option key={team.teamId} value={team.teamId}>
                          {team.teamName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      アウェイチーム <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={gameFormData.teamAwayId}
                      onChange={(e) => setGameFormData({ ...gameFormData, teamAwayId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      {teams.map(team => (
                        <option key={team.teamId} value={team.teamId}>
                          {team.teamName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      試合日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={gameFormData.scheduledDate}
                      onChange={(e) => setGameFormData({ ...gameFormData, scheduledDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      試合時刻 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={gameFormData.scheduledTime}
                      onChange={(e) => setGameFormData({ ...gameFormData, scheduledTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      グラウンド番号
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={gameFormData.groundNumber}
                      onChange={(e) => setGameFormData({ ...gameFormData, groundNumber: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      審判
                    </label>
                    <input
                      type="text"
                      value={gameFormData.referee}
                      onChange={(e) => setGameFormData({ ...gameFormData, referee: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="審判名"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGameForm(false);
                      resetGameForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                  >
                    {editingGame ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 試合一覧 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-primary">登録試合一覧 ({games.length}試合)</h3>
            </div>

            {games.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="mb-4">試合が登録されていません</p>
                <button
                  onClick={() => setShowGameForm(true)}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                >
                  最初の試合を作成
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">日時</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">試合</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">タイプ</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">ステータス</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {games.sort((a, b) => `${a.scheduledDate} ${a.scheduledTime}`.localeCompare(`${b.scheduledDate} ${b.scheduledTime}`)).map((game) => (
                      <tr key={game.gameId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">
                          <div>{game.scheduledDate}</div>
                          <div className="text-gray-500">{game.scheduledTime}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {teams.find(t => t.teamId === game.teamHomeId)?.teamName || game.teamHomeId}
                            {' vs '}
                            {teams.find(t => t.teamId === game.teamAwayId)?.teamName || game.teamAwayId}
                          </div>
                          {(game.block || game.round) && (
                            <div className="text-xs text-gray-500">
                              {game.gameType === 'league' ? `ブロック${game.block}` : game.round}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <span className={`px-2 py-1 text-xs rounded ${
                            game.gameType === 'league' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {game.gameType === 'league' ? 'リーグ' : 'トーナメント'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <span className={`px-2 py-1 text-xs rounded ${
                            game.status === 'completed' ? 'bg-green-100 text-green-800' :
                            game.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {game.status === 'completed' ? '完了' :
                             game.status === 'in_progress' ? '進行中' : '予定'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditGameForm(game)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeleteGame(game.gameId)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 選手管理セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-primary">選手管理</h2>
            <button
              onClick={() => {
                resetPlayerForm();
                setShowPlayerForm(!showPlayerForm);
              }}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              {showPlayerForm ? 'キャンセル' : '+ 新規選手追加'}
            </button>
          </div>

          {/* 選手追加/編集フォーム */}
          {showPlayerForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 text-primary">
                {editingPlayer ? '選手編集' : '新規選手追加'}
              </h3>
              <form onSubmit={editingPlayer ? handleUpdatePlayer : handleCreatePlayer} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      チーム <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={playerFormData.teamId}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, teamId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      {teams.map(team => (
                        <option key={team.teamId} value={team.teamId}>
                          {team.teamName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      選手名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={playerFormData.playerName}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, playerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: 山田太郎"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      背番号
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={playerFormData.uniformNumber}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, uniformNumber: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ポジション
                    </label>
                    <input
                      type="text"
                      value={playerFormData.position}
                      onChange={(e) => setPlayerFormData({ ...playerFormData, position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="例: 投手、外野手"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlayerForm(false);
                      resetPlayerForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                  >
                    {editingPlayer ? '更新' : '作成'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 選手一覧 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-bold text-primary">登録選手一覧 ({players.length}人)</h3>
            </div>

            {players.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p className="mb-4">選手が登録されていません</p>
                <button
                  onClick={() => setShowPlayerForm(true)}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                >
                  最初の選手を作成
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">選手名</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">背番号</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">ポジション</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {players.sort((a, b) => {
                      const teamCompare = (teams.find(t => t.teamId === a.teamId)?.teamName || '').localeCompare(teams.find(t => t.teamId === b.teamId)?.teamName || '');
                      if (teamCompare !== 0) return teamCompare;
                      return a.uniformNumber - b.uniformNumber;
                    }).map((player) => (
                      <tr key={player.playerId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{player.playerName}</td>
                        <td className="px-4 py-3 text-sm">
                          {teams.find(t => t.teamId === player.teamId)?.teamName || player.teamId}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-primary text-white text-sm rounded font-bold">
                            {player.uniformNumber}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{player.position || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => openEditPlayerForm(player)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDeletePlayer(player.playerId, player.playerName)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              削除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>📝 注意:</strong> この管理画面は運営者専用です。URLを関係者以外に共有しないでください。
          </p>
        </div>
      </div>
    </main>
  );
}

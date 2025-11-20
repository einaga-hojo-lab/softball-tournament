"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : '不明なエラー');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [tournamentId]);

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
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">⚾ 試合結果入力</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📝 スコア修正</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🏆 トーナメント管理</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                データ管理
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">📥 データエクスポート</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">💾 バックアップ</li>
                <li className="p-2 hover:bg-gray-50 rounded cursor-pointer">🗃️ アーカイブ</li>
              </ul>
              <p className="text-xs text-gray-500 mt-4">※ 開発中</p>
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

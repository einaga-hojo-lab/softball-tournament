"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Tournament } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    tournamentName: "",
    tournamentDate: "",
    season: "S",
    year: new Date().getFullYear(),
    previousTournamentId: "",
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  async function fetchTournaments() {
    try {
      const res = await fetch('/api/admin/tournaments');
      if (!res.ok) throw new Error('大会一覧の取得に失敗しました');
      const data = await res.json();
      setTournaments(data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
      setLoading(false);
    }
  }

  async function handleCreateTournament(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('大会の作成に失敗しました');

      const newTournament = await res.json();
      setTournaments([newTournament, ...tournaments]);
      setShowCreateForm(false);
      setFormData({
        tournamentName: "",
        tournamentDate: "",
        season: "S",
        year: new Date().getFullYear(),
        previousTournamentId: "",
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : '大会の作成に失敗しました');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdateStatus(tournamentId: string, status: string, confirmMessage?: string) {
    if (confirmMessage && !confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('ステータスの更新に失敗しました');

      await fetchTournaments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'ステータスの更新に失敗しました');
    }
  }

  async function handleDeleteTournament(tournamentId: string, tournamentName: string) {
    if (!confirm(`本当に「${tournamentName}」を削除しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('大会の削除に失敗しました');

      await fetchTournaments();
    } catch (err) {
      alert(err instanceof Error ? err.message : '大会の削除に失敗しました');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-semibold">アクティブ</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">下書き</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">完了</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">{status}</span>;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/" className="text-primary hover:underline">
              ← ホームに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-accent">大会管理</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
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
            <Link href="/" className="text-primary hover:underline">
              ← ホームに戻る
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-accent">大会管理</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline">
            ← ホームに戻る
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-accent">大会管理</h1>
            <p className="text-gray-600 mt-2">大会の作成・管理</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
          >
            {showCreateForm ? 'キャンセル' : '+ 新規大会作成'}
          </button>
        </div>

        {/* 大会作成フォーム */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-primary">新規大会作成</h2>
            <form onSubmit={handleCreateTournament} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    大会名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tournamentName}
                    onChange={(e) => setFormData({ ...formData, tournamentName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="例: 2025年春季ソフトボール大会"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開催日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.tournamentDate}
                    onChange={(e) => setFormData({ ...formData, tournamentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    年度 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="2020"
                    max="2100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    シーズン <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="S">春季 (S)</option>
                    <option value="F">秋季 (F)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    前回大会ID（オプション）
                  </label>
                  <input
                    type="text"
                    value={formData.previousTournamentId}
                    onChange={(e) => setFormData({ ...formData, previousTournamentId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="例: T2024F"
                  />
                  <p className="text-sm text-gray-500 mt-1">前回大会のデータを引き継ぐ場合は指定してください</p>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={creating}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                  disabled={creating}
                >
                  {creating ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* アクティブな大会一覧 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">アクティブな大会</h2>
          </div>

          {tournaments.filter(t => !t.archived).length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              <p className="mb-4">大会が登録されていません</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
              >
                最初の大会を作成
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tournaments.filter(t => !t.archived).map((tournament) => (
                <div key={tournament.tournamentId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {tournament.tournamentName}
                        </h3>
                        {getStatusBadge(tournament.status)}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">ID:</span>
                          <span>{tournament.tournamentId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">開催日:</span>
                          <span>{tournament.tournamentDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">作成日:</span>
                          <span>{new Date(tournament.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/admin/tournament/${tournament.tournamentId}`)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          ダッシュボードを開く →
                        </button>

                        {tournament.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(tournament.tournamentId, 'active')}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-opacity-90"
                            >
                              アクティブにする
                            </button>
                            <button
                              onClick={() => handleDeleteTournament(tournament.tournamentId, tournament.tournamentName)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-opacity-90"
                            >
                              削除
                            </button>
                          </>
                        )}

                        {tournament.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(
                              tournament.tournamentId,
                              'completed',
                              '大会を完了状態にしますか？'
                            )}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-opacity-90"
                          >
                            完了にする
                          </button>
                        )}

                        {tournament.status === 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(
                              tournament.tournamentId,
                              'active',
                              '大会をアクティブ状態に戻しますか？'
                            )}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-opacity-90"
                          >
                            アクティブに戻す
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アーカイブ済み大会一覧 */}
        {tournaments.filter(t => t.archived).length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-600">アーカイブ済み大会</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {tournaments.filter(t => t.archived).map((tournament) => (
                <div key={tournament.tournamentId} className="p-6 hover:bg-gray-50 transition-colors bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {tournament.tournamentName}
                        </h3>
                        {getStatusBadge(tournament.status)}
                        <span className="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">アーカイブ済み</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">ID:</span>
                          <span>{tournament.tournamentId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">開催日:</span>
                          <span>{tournament.tournamentDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">作成日:</span>
                          <span>{new Date(tournament.createdAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push(`/admin/tournament/${tournament.tournamentId}`)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                          閲覧する →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 注意事項 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>📝 注意:</strong> この管理画面は運営者専用です。URLを関係者以外に共有しないでください。
          </p>
        </div>
      </div>
    </main>
  );
}

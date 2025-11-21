"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { Participant, PaymentSummary } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function ParticipantsContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournamentId');

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    teamName: '',
    playerName: '',
    email: '',
    phone: '',
    paymentStatus: 'unpaid' as 'unpaid' | 'paid' | 'refunded' | 'exempted',
    paymentMethod: 'paypay' as 'paypay' | 'bank_transfer' | 'cash' | 'other' | undefined,
    paymentDate: '',
    paymentAmount: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  async function fetchData() {
    try {
      const params = tournamentId ? `?tournamentId=${tournamentId}` : '';

      const [participantsRes, summaryRes] = await Promise.all([
        fetch(`/api/admin/participants${params}`),
        fetch(`/api/payment-summary${params}`)
      ]);

      if (!participantsRes.ok) throw new Error('参加者情報の取得に失敗しました');
      if (!summaryRes.ok) throw new Error('集金サマリーの取得に失敗しました');

      const participantsData = await participantsRes.json();
      const summaryData = await summaryRes.json();

      setParticipants(participantsData);
      setSummary(summaryData);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/admin/participants/${editingId}`
        : '/api/admin/participants';

      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          ...formData,
          registrationDate: editingId ? undefined : new Date().toISOString().split('T')[0],
        }),
      });

      if (!res.ok) throw new Error(editingId ? '更新に失敗しました' : '登録に失敗しました');

      await fetchData();
      resetForm();
      alert(editingId ? '更新しました' : '登録しました');
    } catch (err) {
      alert(err instanceof Error ? err.message : '操作に失敗しました');
    }
  }

  async function handleDelete(participantId: string) {
    if (!confirm('この参加者を削除してもよろしいですか?')) return;

    try {
      const res = await fetch(`/api/admin/participants/${participantId}?tournamentId=${tournamentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('削除に失敗しました');

      await fetchData();
      alert('削除しました');
    } catch (err) {
      alert(err instanceof Error ? err.message : '削除に失敗しました');
    }
  }

  function handleEdit(participant: Participant) {
    setEditingId(participant.participantId);
    setFormData({
      teamName: participant.teamName,
      playerName: participant.playerName,
      email: participant.email,
      phone: participant.phone,
      paymentStatus: participant.paymentStatus,
      paymentMethod: participant.paymentMethod as any,
      paymentDate: participant.paymentDate || '',
      paymentAmount: participant.paymentAmount,
      notes: participant.notes || '',
    });
    setShowAddForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setShowAddForm(false);
    setFormData({
      teamName: '',
      playerName: '',
      email: '',
      phone: '',
      paymentStatus: 'unpaid',
      paymentMethod: 'paypay',
      paymentDate: '',
      paymentAmount: 0,
      notes: '',
    });
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
          <h1 className="text-4xl font-bold mb-8 text-accent">参加費管理</h1>
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
          <h1 className="text-4xl font-bold mb-8 text-accent">参加費管理</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  const filteredParticipants = participants.filter(p => {
    if (filter === 'all') return true;
    return p.paymentStatus === filter;
  });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={backLink} className="text-primary hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-8 text-accent">参加費管理</h1>

        {/* 集金サマリー */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">総参加者数</div>
              <div className="text-3xl font-bold text-primary">{summary.totalParticipants}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">支払済</div>
              <div className="text-3xl font-bold text-green-600">{summary.paidCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">未払い</div>
              <div className="text-3xl font-bold text-red-600">{summary.unpaidCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-1">集金率</div>
              <div className="text-3xl font-bold text-primary">{(summary.collectionRate * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">
                {summary.totalCollected.toLocaleString()}円 / {summary.totalExpected.toLocaleString()}円
              </div>
            </div>
          </div>
        )}

        {/* フィルターと追加ボタン */}
        <div className="mb-6 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
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
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded ${
                filter === 'paid'
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              支払済
            </button>
            <button
              onClick={() => setFilter('unpaid')}
              className={`px-4 py-2 rounded ${
                filter === 'unpaid'
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              未払い
            </button>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowAddForm(!showAddForm);
            }}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
          >
            {showAddForm ? 'キャンセル' : '+ 新規登録'}
          </button>
        </div>

        {/* 登録フォーム */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? '参加者編集' : '参加者登録'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">チーム名</label>
                  <input
                    type="text"
                    required
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">選手名</label>
                  <input
                    type="text"
                    required
                    value={formData.playerName}
                    onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">メールアドレス</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">電話番号</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">支払いステータス</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="unpaid">未払い</option>
                    <option value="paid">支払済</option>
                    <option value="exempted">免除</option>
                    <option value="refunded">返金済</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">支払い方法</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="paypay">PayPay</option>
                    <option value="bank_transfer">銀行振込</option>
                    <option value="cash">現金</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">支払い日</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">参加費（円）</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">備考</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-opacity-90"
                >
                  {editingId ? '更新' : '登録'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 参加者一覧 */}
        {filteredParticipants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">該当する参加者がいません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">チーム名</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">選手名</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">連絡先</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">参加費</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">ステータス</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">支払い方法</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">支払い日</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant.participantId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{participant.teamName}</td>
                      <td className="px-4 py-3 font-medium">{participant.playerName}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>{participant.email}</div>
                        <div className="text-gray-500">{participant.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-center">{participant.paymentAmount.toLocaleString()}円</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          participant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          participant.paymentStatus === 'unpaid' ? 'bg-red-100 text-red-800' :
                          participant.paymentStatus === 'exempted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {participant.paymentStatus === 'paid' ? '支払済' :
                           participant.paymentStatus === 'unpaid' ? '未払い' :
                           participant.paymentStatus === 'exempted' ? '免除' : '返金済'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {participant.paymentMethod === 'paypay' ? 'PayPay' :
                         participant.paymentMethod === 'bank_transfer' ? '銀行振込' :
                         participant.paymentMethod === 'cash' ? '現金' :
                         participant.paymentMethod === 'other' ? 'その他' : '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{participant.paymentDate || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleEdit(participant)}
                          className="text-blue-600 hover:underline mr-2"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(participant.participantId)}
                          className="text-red-600 hover:underline"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ParticipantsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 text-accent">参加費管理</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      </main>
    }>
      <ParticipantsContent />
    </Suspense>
  );
}

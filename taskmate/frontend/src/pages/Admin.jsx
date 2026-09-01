import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import StampBadge from '../components/StampBadge';

const TASK_STATUSES = ['open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'];

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('overview');

  const loadAll = async () => {
    const [statsRes, usersRes, tasksRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/tasks'),
    ]);
    setStats(statsRes.data.stats);
    setUsers(usersRes.data.users);
    setTasks(tasksRes.data.tasks);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const toggleBan = async (id) => {
    await api.put(`/admin/users/${id}/ban`);
    loadAll();
  };

  const toggleVerify = async (id) => {
    await api.put(`/admin/users/${id}/verify`);
    loadAll();
  };

  const overrideStatus = async (id, status) => {
    await api.put(`/admin/tasks/${id}/status`, { status });
    loadAll();
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-paper">Admin</h1>

      <div className="mt-6 flex gap-2 border-b border-board-line">
        {['overview', 'users', 'tasks'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-b-2 border-signal text-signal' : 'text-paper-dim'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="ticket p-4">
            <p className="text-xs uppercase text-ink/50">Users</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink">{stats.userCount}</p>
          </div>
          <div className="ticket p-4">
            <p className="text-xs uppercase text-ink/50">Transactions</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink">
              {stats.transactionCount}
            </p>
          </div>
          {Object.entries(stats.tasksByStatus).map(([status, count]) => (
            <div key={status} className="ticket p-4">
              <p className="text-xs uppercase text-ink/50">{status}</p>
              <p className="mt-1 font-mono text-2xl font-semibold text-ink">{count}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div
              key={u._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-board-line bg-board-raised px-4 py-3"
            >
              <div>
                <p className="font-medium text-paper">
                  {u.name} <span className="text-xs text-paper-dim">({u.email})</span>
                </p>
                <p className="font-mono text-[11px] text-paper-dim">
                  {u.isAdmin ? 'admin \u00b7 ' : ''}
                  {u.isVerified ? 'verified \u00b7 ' : ''}
                  {u.isBanned ? 'banned' : 'active'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleVerify(u._id)}
                  className="rounded-sm border border-board-line px-3 py-1.5 text-xs text-paper-dim hover:border-teal hover:text-teal"
                >
                  {u.isVerified ? 'Unverify' : 'Verify'}
                </button>
                <button
                  onClick={() => toggleBan(u._id)}
                  className="rounded-sm border border-board-line px-3 py-1.5 text-xs text-paper-dim hover:border-stamp hover:text-stamp"
                >
                  {u.isBanned ? 'Unban' : 'Ban'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="mt-6 space-y-2">
          {tasks.map((t) => (
            <div
              key={t._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-board-line bg-board-raised px-4 py-3"
            >
              <div>
                <p className="font-medium text-paper">{t.title}</p>
                <p className="text-xs text-paper-dim">
                  Posted by {t.postedBy?.name} &middot; {t.assignedTo?.name || 'unassigned'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StampBadge status={t.status} />
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && overrideStatus(t._id, e.target.value)}
                  className="field w-auto !py-1.5 text-xs"
                >
                  <option value="" disabled>
                    Override status…
                  </option>
                  {TASK_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ClipboardList, PlusCircle, Search, WalletMinimal } from 'lucide-react';
import { fetchMyTasks } from '../redux/slices/taskSlice';
import { fetchMyBids } from '../redux/slices/bidSlice';
import { fetchWallet } from '../redux/slices/walletSlice';
import TaskCard from '../components/TaskCard';
import StampBadge from '../components/StampBadge';
import { formatRupees } from '../constants/categories';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { mine: myTasks, mineStatus } = useSelector((state) => state.tasks);
  const { mine: myBids, mineStatus: bidsStatus } = useSelector((state) => state.bids);
  const { balance, escrowHeld } = useSelector((state) => state.wallet);
  const [tab, setTab] = useState('posted');

  useEffect(() => {
    dispatch(fetchMyTasks());
    dispatch(fetchMyBids());
    dispatch(fetchWallet());
  }, [dispatch]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-paper">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-paper-dim">
            Currently in <span className="font-mono text-signal">{user?.activeMode}</span> mode
            &middot; <Link to="/profile" className="underline hover:text-paper">switch or edit profile</Link>
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/tasks/new" className="btn-primary !px-4 !py-2.5 text-sm">
            <PlusCircle className="h-4 w-4" /> Post a task
          </Link>
          <Link to="/tasks" className="btn-outline !px-4 !py-2.5 text-sm">
            <Search className="h-4 w-4" /> Browse tasks
          </Link>
        </div>
      </div>

      <Link
        to="/wallet"
        className="mt-6 flex items-center justify-between rounded-sm border border-board-line bg-board-raised px-5 py-4 hover:border-signal"
      >
        <div className="flex items-center gap-2 text-paper-dim">
          <WalletMinimal className="h-4 w-4" />
          <span className="text-sm">Wallet</span>
        </div>
        <div className="flex gap-6 font-mono text-sm">
          <span className="text-paper">{formatRupees(balance)} available</span>
          <span className="text-paper-dim">{formatRupees(escrowHeld)} in escrow</span>
        </div>
      </Link>

      <div className="mt-8 flex gap-2 border-b border-board-line">
        <button
          onClick={() => setTab('posted')}
          className={`px-4 py-2 text-sm font-medium ${
            tab === 'posted' ? 'border-b-2 border-signal text-signal' : 'text-paper-dim'
          }`}
        >
          Tasks I posted ({myTasks.length})
        </button>
        <button
          onClick={() => setTab('bids')}
          className={`px-4 py-2 text-sm font-medium ${
            tab === 'bids' ? 'border-b-2 border-signal text-signal' : 'text-paper-dim'
          }`}
        >
          My offers ({myBids.length})
        </button>
      </div>

      {tab === 'posted' && (
        <div className="mt-6">
          {mineStatus === 'succeeded' && myTasks.length === 0 && (
            <EmptyState
              text="You haven't posted anything yet."
              cta={{ to: '/tasks/new', label: 'Post your first task' }}
            />
          )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {myTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </div>
      )}

      {tab === 'bids' && (
        <div className="mt-6 space-y-2">
          {bidsStatus === 'succeeded' && myBids.length === 0 && (
            <EmptyState
              text="You haven't made any offers yet."
              cta={{ to: '/tasks', label: 'Find work to bid on' }}
            />
          )}
          {myBids.map((bid) => (
            <Link
              key={bid._id}
              to={`/tasks/${bid.task?._id}`}
              className="flex items-center justify-between rounded-sm border border-board-line bg-board-raised px-4 py-3 hover:border-signal"
            >
              <div>
                <p className="font-medium text-paper">{bid.task?.title}</p>
                <p className="font-mono text-xs text-paper-dim">
                  Your offer: {formatRupees(bid.amount)}
                </p>
              </div>
              <StampBadge status={bid.status === 'accepted' ? 'assigned' : bid.task?.status || 'open'} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function EmptyState({ text, cta }) {
  return (
    <div className="mb-6 flex flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-board-line py-16 text-center">
      <ClipboardList className="h-7 w-7 text-paper-dim" strokeWidth={1.5} />
      <p className="text-sm text-paper-dim">{text}</p>
      <Link to={cta.to} className="text-sm font-medium text-signal hover:underline">
        {cta.label}
      </Link>
    </div>
  );
}

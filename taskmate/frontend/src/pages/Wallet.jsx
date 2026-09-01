import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { WalletMinimal, Lock } from 'lucide-react';
import { fetchWallet, topUpWallet, fetchTransactions, clearTopupStatus } from '../redux/slices/walletSlice';
import { formatRupees } from '../constants/categories';

const TX_LABELS = {
  topup: 'Wallet top-up',
  escrow_hold: 'Held in escrow',
  escrow_release: 'Payment released',
  escrow_refund: 'Escrow refunded',
};

export default function Wallet() {
  const dispatch = useDispatch();
  const { balance, escrowHeld, transactions, topupStatus, topupError } = useSelector(
    (state) => state.wallet
  );
  const { user } = useSelector((state) => state.auth);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleTopup = async (e) => {
    e.preventDefault();
    dispatch(clearTopupStatus());
    const result = await dispatch(topUpWallet(Number(amount)));
    if (topUpWallet.fulfilled.match(result)) {
      setAmount('');
      dispatch(fetchTransactions());
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-paper">Wallet</h1>
      <p className="mt-2 text-sm text-paper-dim">
        This is a simulated wallet — no real payments are processed. It exists to model the
        escrow flow: funds are held when you accept an offer, and released once you confirm a
        task is complete.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="ticket p-5">
          <div className="flex items-center gap-2 text-ink/60">
            <WalletMinimal className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Available</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold text-ink">
            {formatRupees(balance)}
          </p>
        </div>
        <div className="ticket p-5">
          <div className="flex items-center gap-2 text-ink/60">
            <Lock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">In escrow</span>
          </div>
          <p className="mt-2 font-mono text-3xl font-semibold text-ink">
            {formatRupees(escrowHeld)}
          </p>
        </div>
      </div>

      <form onSubmit={handleTopup} className="mt-6 flex gap-3">
        <input
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to add (\u20b9)"
          className="field"
        />
        <button
          type="submit"
          disabled={topupStatus === 'loading'}
          className="btn-primary shrink-0"
        >
          {topupStatus === 'loading' ? 'Adding…' : 'Add funds'}
        </button>
      </form>
      {topupError && <p className="mt-2 text-sm text-stamp">{topupError}</p>}

      <h2 className="mt-10 font-display text-lg font-bold text-paper">Transaction history</h2>
      <div className="mt-4 space-y-2">
        {transactions.length === 0 && (
          <p className="text-sm text-paper-dim">No transactions yet.</p>
        )}
        {transactions.map((tx) => {
          const isCredit = tx.to?._id === user?._id || tx.to === user?._id;
          return (
            <div
              key={tx._id}
              className="flex items-center justify-between rounded-sm border border-board-line bg-board-raised px-4 py-3"
            >
              <div>
                <p className="text-sm text-paper">{TX_LABELS[tx.type] || tx.type}</p>
                {tx.task?.title && (
                  <p className="text-xs text-paper-dim">{tx.task.title}</p>
                )}
                <p className="font-mono text-[11px] text-paper-dim">
                  {new Date(tx.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
              <span
                className={`font-mono text-sm font-semibold ${
                  tx.type === 'escrow_hold' ? 'text-paper-dim' : isCredit ? 'text-teal' : 'text-stamp'
                }`}
              >
                {formatRupees(tx.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}

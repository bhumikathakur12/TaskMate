import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Check, X } from 'lucide-react';
import StarRating from './StarRating';
import { formatRupees } from '../constants/categories';
import { acceptBid, rejectBid } from '../redux/slices/bidSlice';

export default function BidRow({ bid, canManage, taskOpen }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleAccept = async () => {
    setBusy(true);
    setError('');
    const result = await dispatch(acceptBid(bid._id));
    if (acceptBid.rejected.match(result)) setError(result.payload);
    setBusy(false);
  };

  const handleReject = async () => {
    setBusy(true);
    await dispatch(rejectBid(bid._id));
    setBusy(false);
  };

  const statusColor =
    bid.status === 'accepted'
      ? 'text-teal'
      : bid.status === 'rejected'
      ? 'text-stamp'
      : 'text-paper-dim';

  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-board-line bg-board-raised p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-semibold text-paper">{bid.tasker?.name}</span>
          <StarRating value={bid.tasker?.rating?.average || 0} count={bid.tasker?.rating?.count || 0} size={12} />
        </div>
        {bid.message && <p className="mt-1 text-sm text-paper-dim">{bid.message}</p>}
        <p className={`mt-1 font-mono text-xs uppercase ${statusColor}`}>{bid.status}</p>
        {error && <p className="mt-1 text-xs text-stamp">{error}</p>}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="font-mono text-lg font-semibold text-signal">
          {formatRupees(bid.amount)}
        </span>
        {canManage && taskOpen && bid.status === 'pending' && (
          <div className="flex gap-1.5">
            <button
              onClick={handleAccept}
              disabled={busy}
              className="flex items-center gap-1 rounded-sm bg-signal px-2.5 py-1 text-xs font-semibold text-board hover:bg-signal-dark disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Accept
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="flex items-center gap-1 rounded-sm border border-board-line px-2.5 py-1 text-xs text-paper-dim hover:border-stamp hover:text-stamp disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

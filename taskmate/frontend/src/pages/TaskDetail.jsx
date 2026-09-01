import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Clock, Send, PackageCheck, ShieldCheck } from 'lucide-react';
import api from '../api/axiosInstance';
import { fetchTaskById, clearCurrentTask } from '../redux/slices/taskSlice';
import { fetchBidsForTask, placeBid, clearPlaceStatus } from '../redux/slices/bidSlice';
import StampBadge from '../components/StampBadge';
import BidRow from '../components/BidRow';
import StarRating from '../components/StarRating';
import { getCategoryMeta, formatRupees } from '../constants/categories';

export default function TaskDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { current: task, currentStatus } = useSelector((state) => state.tasks);
  const { forTask: bids, placeStatus, placeError } = useSelector((state) => state.bids);

  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [lifecycleBusy, setLifecycleBusy] = useState(false);
  const [lifecycleError, setLifecycleError] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    dispatch(fetchTaskById(id));
    return () => dispatch(clearCurrentTask());
  }, [id, dispatch]);

  useEffect(() => {
    if (task && user && task.postedBy?._id === user._id) {
      dispatch(fetchBidsForTask(id));
    }
  }, [task, user, id, dispatch]);

  if (currentStatus === 'loading' || !task) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16 text-center text-paper-dim">
        Loading ticket…
      </main>
    );
  }

  const isOwner = user && task.postedBy?._id === user._id;
  const isAssignedTasker = user && task.assignedTo?._id === user._id;
  const { icon: Icon, label } = getCategoryMeta(task.category);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearPlaceStatus());
    const result = await dispatch(
      placeBid({ taskId: id, amount: Number(bidAmount), message: bidMessage })
    );
    if (placeBid.fulfilled.match(result)) {
      setBidAmount('');
      setBidMessage('');
    }
  };

  const handleRequestCompletion = async () => {
    setLifecycleBusy(true);
    setLifecycleError('');
    try {
      await api.put(`/tasks/${id}/request-completion`);
      await dispatch(fetchTaskById(id));
    } catch (err) {
      setLifecycleError(err.response?.data?.message || 'Something went wrong');
    }
    setLifecycleBusy(false);
  };

  const handleConfirmCompletion = async () => {
    setLifecycleBusy(true);
    setLifecycleError('');
    try {
      await api.put(`/tasks/${id}/confirm-completion`);
      await dispatch(fetchTaskById(id));
    } catch (err) {
      setLifecycleError(err.response?.data?.message || 'Something went wrong');
    }
    setLifecycleBusy(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      await api.post(`/tasks/${id}/reviews`, { rating: reviewRating, comment: reviewComment });
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const alreadyBid = bids.some((b) => b.tasker?._id === user?._id) ||
    (task.status !== 'open' && !isOwner && !isAssignedTasker);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="ticket p-6 sm:p-8">
        <div className="flex items-start justify-between border-b border-dashed border-ink/20 pb-4">
          <div>
            <p className="font-mono text-xs text-ink/50">
              TICKET #{task._id.slice(-4).padStart(4, '0')}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-ink">{task.title}</h1>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ink/60">
              <Icon className="h-4 w-4" /> {label}
            </div>
          </div>
          <StampBadge status={task.status} />
        </div>

        <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink/80">
          {task.description}
        </p>

        {task.photos?.length > 0 && (
          <div className="mt-5 flex gap-2 overflow-x-auto">
            {task.photos.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                className="h-32 w-32 shrink-0 rounded-sm object-cover"
              />
            ))}
          </div>
        )}

        <div className="mt-5 space-y-2 text-sm text-ink/70">
          {task.location?.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" /> {task.location.address}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />{' '}
            {new Date(task.deadline).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-dashed border-ink/20 pt-4">
          <div>
            <span className="font-mono text-3xl font-semibold text-ink">
              {formatRupees(task.budget)}
            </span>
            <span className="ml-2 text-xs text-ink/50">
              {task.budgetType === 'negotiable' ? 'negotiable' : 'fixed'}
            </span>
          </div>
          <div className="text-right text-xs text-ink/50">
            Posted by <span className="font-semibold text-ink/80">{task.postedBy?.name}</span>
            <br />
            <StarRating
              value={task.postedBy?.rating?.average || 0}
              count={task.postedBy?.rating?.count || 0}
              size={12}
            />
          </div>
        </div>
      </div>

      {/* Assigned tasker info */}
      {task.assignedTo && (
        <div className="mt-6 rounded-sm border border-board-line bg-board-raised p-4">
          <p className="text-xs uppercase tracking-wide text-paper-dim">Assigned to</p>
          <p className="mt-1 font-display font-semibold text-paper">{task.assignedTo.name}</p>
        </div>
      )}

      {/* Lifecycle actions */}
      {lifecycleError && (
        <p className="mt-4 rounded-sm border border-stamp/40 bg-stamp/10 px-3 py-2 text-sm text-stamp">
          {lifecycleError}
        </p>
      )}

      {isAssignedTasker && task.status === 'assigned' && (
        <button
          onClick={handleRequestCompletion}
          disabled={lifecycleBusy}
          className="btn-primary mt-6 w-full"
        >
          <PackageCheck className="h-4 w-4" /> Mark as done — notify poster
        </button>
      )}

      {isAssignedTasker && task.status === 'in_progress' && task.completionRequested && (
        <p className="mt-6 rounded-sm border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          Waiting for {task.postedBy?.name} to confirm and release payment.
        </p>
      )}

      {isOwner && task.status === 'in_progress' && task.completionRequested && (
        <button
          onClick={handleConfirmCompletion}
          disabled={lifecycleBusy}
          className="btn-primary mt-6 w-full"
        >
          <ShieldCheck className="h-4 w-4" /> Confirm complete & release payment
        </button>
      )}

      {/* Review flow */}
      {task.status === 'completed' && (isOwner || isAssignedTasker) && !reviewSubmitted && (
        <form onSubmit={handleReviewSubmit} className="mt-6 rounded-sm border border-board-line bg-board-raised p-4">
          <p className="font-display font-semibold text-paper">
            Leave a review for {isOwner ? task.assignedTo?.name : task.postedBy?.name}
          </p>
          <div className="mt-2">
            <StarRating value={reviewRating} onChange={setReviewRating} size={22} />
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={3}
            placeholder="How did it go?"
            className="field mt-3 resize-none"
          />
          {reviewError && <p className="mt-2 text-sm text-stamp">{reviewError}</p>}
          <button type="submit" className="btn-primary mt-3">
            Submit review
          </button>
        </form>
      )}
      {reviewSubmitted && (
        <p className="mt-6 rounded-sm border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-teal">
          Thanks — your review has been posted.
        </p>
      )}

      {/* Bidding — owner sees offers, others can bid */}
      {isOwner ? (
        <div className="mt-8">
          <h2 className="font-display text-lg font-bold text-paper">
            Offers ({bids.length})
          </h2>
          <div className="mt-4 space-y-3">
            {bids.length === 0 && (
              <p className="text-sm text-paper-dim">No offers yet — check back soon.</p>
            )}
            {bids.map((bid) => (
              <BidRow key={bid._id} bid={bid} canManage taskOpen={task.status === 'open'} />
            ))}
          </div>
        </div>
      ) : (
        user &&
        task.status === 'open' &&
        !alreadyBid && (
          <form onSubmit={handleBidSubmit} className="mt-8 rounded-sm border border-board-line bg-board-raised p-4">
            <h2 className="font-display font-semibold text-paper">Make an offer</h2>
            <div className="mt-3 flex gap-3">
              <input
                type="number"
                required
                min={1}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Your price (\u20b9)"
                className="field w-40"
              />
              <input
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                placeholder="Optional message"
                className="field flex-1"
              />
            </div>
            {placeError && <p className="mt-2 text-sm text-stamp">{placeError}</p>}
            <button
              type="submit"
              disabled={placeStatus === 'loading'}
              className="btn-primary mt-3"
            >
              <Send className="h-4 w-4" />
              {placeStatus === 'loading' ? 'Sending…' : 'Send offer'}
            </button>
          </form>
        )
      )}

      {!user && task.status === 'open' && (
        <p className="mt-8 text-sm text-paper-dim">Log in to make an offer on this task.</p>
      )}
    </main>
  );
}

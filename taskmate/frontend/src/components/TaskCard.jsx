import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import StampBadge from './StampBadge';
import { getCategoryMeta, formatRupees } from '../constants/categories';

const formatDeadline = (iso) => {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `Today, ${d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
    ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
};

export default function TaskCard({ task, ticketNo }) {
  const { icon: Icon, label } = getCategoryMeta(task.category);

  return (
    <Link to={`/tasks/${task._id}`} className="block">
      <div className="ticket flex h-full flex-col p-5 transition-transform hover:-translate-y-0.5">
        <div className="flex items-start justify-between border-b border-dashed border-ink/20 pb-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-ink/50">
              TICKET #{String(ticketNo ?? task._id.slice(-4)).padStart(4, '0')}
            </p>
            <h3 className="mt-1 truncate font-display text-base font-bold text-ink">
              {task.title}
            </h3>
          </div>
          <StampBadge status={task.status} />
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-ink/60">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </div>

        <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink/70">{task.description}</p>

        <div className="mt-3 space-y-1 text-xs text-ink/60">
          {task.location?.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{task.location.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDeadline(task.deadline)}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/20 pt-3">
          <span className="font-mono text-xl font-semibold text-ink">
            {formatRupees(task.budget)}
          </span>
          <span className="font-mono text-[11px] text-ink/50">
            {task.bidCount || 0} offer{task.bidCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>
    </Link>
  );
}

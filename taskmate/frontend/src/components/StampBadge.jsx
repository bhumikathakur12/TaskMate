const STYLES = {
  open: 'stamp-open',
  assigned: 'stamp-assigned',
  in_progress: 'stamp-assigned',
  completed: 'stamp-done',
  cancelled: 'stamp-cancelled',
  disputed: 'stamp-cancelled',
};

const LABELS = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In progress',
  completed: 'Done',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
};

export default function StampBadge({ status }) {
  const style = STYLES[status] || 'stamp-open';
  const label = LABELS[status] || status;
  return <span className={`stamp ${style}`}>{label}</span>;
}

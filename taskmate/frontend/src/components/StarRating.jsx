import { Star } from 'lucide-react';

export default function StarRating({ value = 0, count, onChange, size = 16 }) {
  const interactive = typeof onChange === 'function';
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          disabled={!interactive}
          onClick={() => interactive && onChange(n)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            width={size}
            height={size}
            className={n <= Math.round(value) ? 'fill-signal text-signal' : 'text-paper-dim'}
          />
        </button>
      ))}
      {typeof count === 'number' && (
        <span className="ml-1 font-mono text-xs text-paper-dim">
          {value.toFixed ? value.toFixed(1) : value} ({count})
        </span>
      )}
    </div>
  );
}

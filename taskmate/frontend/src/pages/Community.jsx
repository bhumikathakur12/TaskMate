import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Trees, PawPrint, Boxes, Package, Sparkles, Wrench } from 'lucide-react';
import StampBadge from '../components/StampBadge';
import StarRating from '../components/StarRating';

const STATS = [
  { label: 'Tasks completed', value: '12,400+' },
  { label: 'Paid out to taskers', value: '\u20b968L+' },
  { label: 'Avg. time to first offer', value: '9 min' },
  { label: 'Cities covered', value: '6' },
];

const RECENT_JOBS = [
  { icon: Boxes, title: 'Moved a 1BHK across town', place: 'Jalandhar', price: 1800 },
  { icon: PawPrint, title: 'Fed the cats over a long weekend', place: 'Amritsar', price: 400 },
  { icon: Trees, title: 'Cleared an overgrown backyard', place: 'Ludhiana', price: 650 },
  { icon: Package, title: 'Dropped a parcel at the courier', place: 'Jalandhar', price: 120 },
  { icon: Sparkles, title: 'Pre-Diwali deep clean, 3BHK', place: 'Patiala', price: 1200 },
  { icon: Wrench, title: 'Fixed a wobbly ceiling fan', place: 'Bathinda', price: 300 },
];

const TESTIMONIALS = [
  {
    name: 'Ritika S.',
    role: 'Posted 14 tasks',
    quote:
      "Needed my apartment cleaned before family visited and had three offers within ten minutes. Paid straight through the app, no awkward cash talk.",
    rating: 5,
  },
  {
    name: 'Gagandeep M.',
    role: 'Tasker \u00b7 62 jobs done',
    quote:
      'I pick up shifting and assembly jobs between college classes. The bidding means I set my own price instead of some fixed rate.',
    rating: 5,
  },
  {
    name: 'Anahita K.',
    role: 'Posted 6 tasks',
    quote:
      "Used it for pet care while traveling. Could see the tasker's ratings and past reviews before I picked anyone, which made it an easy call.",
    rating: 4,
  },
];

export default function Community() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-14 text-center md:pt-24">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-2xl font-display text-3xl font-bold leading-tight text-paper md:text-4xl"
        >
          Thousands of jobs get done here.
          <br />
          <span className="text-signal">Here's what that looks like.</span>
        </motion.h1>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-paper-dim">
          Every ticket on the board is a real job, a real price, and someone nearby
          getting it done.
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-board-line bg-board-raised/50 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-3xl font-bold text-signal">{stat.value}</p>
              <p className="mt-1.5 font-mono text-xs uppercase tracking-wide text-paper-dim">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently wrapped up */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-bold text-paper">Recently wrapped up</h2>
        <p className="mt-2 text-sm text-paper-dim">
          A slice of the board from the last few days.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECENT_JOBS.map((job, i) => {
            const Icon = job.icon;
            return (
              <motion.div
                key={job.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
                className="flex items-center gap-4 rounded-sm border border-board-line bg-board-raised px-5 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-board">
                  <Icon className="h-5 w-5 text-teal" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-body text-sm font-medium text-paper">
                    {job.title}
                  </p>
                  <p className="font-mono text-xs text-paper-dim">{job.place}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold text-paper">
                    &#8377;{job.price.toLocaleString('en-IN')}
                  </p>
                  <div className="mt-1">
                    <StampBadge status="completed" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-board-line bg-board-raised/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold text-paper">
            From people on both sides of the board
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="ticket flex flex-col p-6">
                <StarRating value={t.rating} size={15} />
                <p className="mt-4 flex-1 font-body text-sm leading-relaxed text-ink/80">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-5 border-t border-dashed border-ink/20 pt-4">
                  <p className="font-display text-sm font-bold text-ink">{t.name}</p>
                  <p className="font-mono text-xs text-ink/50">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-paper">
            Add your ticket to the board.
          </h2>
          <div className="mt-8">
            <Link to="/register" className="btn-primary">
              Post a task
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

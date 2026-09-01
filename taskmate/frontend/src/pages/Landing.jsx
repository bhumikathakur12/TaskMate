import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Truck,
  Sparkles,
  Boxes,
  Wrench,
  ShoppingBag,
  PawPrint,
  Trees,
  Hammer,
  ArrowRight,
  Package,
  PaintRoller,
} from 'lucide-react';
import StampBadge from '../components/StampBadge';

const CATEGORIES = [
  { icon: Truck, label: 'Delivery & pickup' },
  { icon: Sparkles, label: 'Cleaning' },
  { icon: Boxes, label: 'Moving & hauling' },
  { icon: Wrench, label: 'Repairs' },
  { icon: ShoppingBag, label: 'Errands' },
  { icon: PawPrint, label: 'Pet care' },
  { icon: Trees, label: 'Yard work' },
  { icon: Hammer, label: 'Assembly' },
];

const FEATURED_TASKS = [
  { id: '0481', icon: Trees, category: 'Gardening', title: 'Water the garden & trim hedges', place: 'Model Town', price: 450 },
  { id: '0482', icon: PawPrint, category: 'Pet care', title: 'Weekend dog walking & feeding', place: 'Urban Estate', price: 300 },
  { id: '0483', icon: Boxes, category: 'Shifting', title: 'Help move 2BHK to a new flat', place: 'Adarsh Nagar', price: 2200 },
  { id: '0484', icon: Package, category: 'Parcel pickup', title: 'Pick up a parcel from courier office', place: 'BMC Chowk', price: 150 },
  { id: '0485', icon: Sparkles, category: 'Cleaning', title: 'Deep clean before guests arrive', place: 'Lajpat Nagar', price: 700 },
  { id: '0486', icon: Hammer, category: 'Assembly', title: 'Assemble a new wardrobe', place: 'Guru Nanak Pura', price: 500 },
  { id: '0487', icon: Wrench, category: 'Repairs', title: 'Fix a leaking kitchen tap', place: 'Rama Mandi', price: 350 },
  { id: '0488', icon: ShoppingBag, category: 'Errands', title: 'Weekly grocery run', place: 'Nakodar Road', price: 200 },
  { id: '0489', icon: Truck, category: 'Delivery', title: 'Same-day flower delivery', place: 'Civil Lines', price: 250 },
  { id: '0490', icon: PaintRoller, category: 'Painting', title: 'Whitewash one bedroom wall', place: 'Maqsudan', price: 900 },
];

const STEPS = [
  {
    n: '01',
    title: 'Write up the job',
    body: 'What needs doing, where, and by when. Set the price you\u2019re willing to pay.',
  },
  {
    n: '02',
    title: 'Offers roll in',
    body: 'Nearby taskers bid on your job. Check ratings, message them, pick one.',
  },
  {
    n: '03',
    title: 'It gets done',
    body: 'Track progress, chat in real time, release payment once it\u2019s finished.',
  },
];

export default function Landing() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid items-center gap-16 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-paper md:text-5xl">
              Post the job.
              <br />
              Name your price.
              <br />
              <span className="text-signal">Get it done today.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper-dim">
              Pickups, cleanups, deliveries, repairs. Whatever's sitting on your
              to-do list, someone nearby is ready to pick it up in minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">
                Post a task
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-outline">
                Find work nearby
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: -6, y: 20 }}
            animate={{ opacity: 1, rotate: -2, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="ticket mx-auto w-full max-w-sm p-6"
          >
            <div className="flex items-start justify-between border-b border-dashed border-ink/20 pb-4">
              <div>
                <p className="font-mono text-xs text-ink/50">TICKET #0472</p>
                <h3 className="mt-1 font-display text-lg font-bold">
                  Clean 2BHK apartment
                </h3>
              </div>
              <StampBadge status="open" />
            </div>
            <div className="mt-4 space-y-2 font-body text-sm text-ink/70">
              <p>Model Town, Jalandhar &middot; Today, 5:00 PM</p>
              <p>Kitchen, both bathrooms, and living room. Supplies provided.</p>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-dashed border-ink/20 pt-4">
              <span className="font-mono text-2xl font-semibold">&#8377;800</span>
              <span className="font-mono text-xs text-ink/50">3 offers so far</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fresh off the board */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-paper">
              Fresh off the board
            </h2>
            <p className="mt-2 text-sm text-paper-dim">
              A handful of tasks posted nearby right now &mdash; and what they're paying.
            </p>
          </div>
          <Link
            to="/tasks"
            className="hidden shrink-0 items-center gap-1.5 font-mono text-xs text-paper-dim hover:text-signal sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_TASKS.map((task, i) => {
            const Icon = task.icon;
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
                className="ticket flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-dashed border-ink/20 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-ink/5">
                        <Icon className="h-4 w-4 text-ink/70" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
                          {task.category}
                        </p>
                        <p className="font-mono text-[11px] text-ink/40">#{task.id}</p>
                      </div>
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-base font-bold leading-snug text-ink">
                    {task.title}
                  </h3>
                  <p className="mt-1 font-body text-xs text-ink/60">{task.place}</p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/20 pt-3">
                  <span className="font-mono text-lg font-semibold text-ink">
                    &#8377;{task.price.toLocaleString('en-IN')}
                  </span>
                  <StampBadge status="open" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/tasks" className="btn-outline w-full">
            View all tasks
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-board-line bg-board-raised/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-bold text-paper">
            Whatever the job, someone's up for it
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-sm border border-board-line bg-board px-4 py-6 text-center transition-colors hover:border-signal"
              >
                <Icon className="h-6 w-6 text-signal" strokeWidth={1.75} />
                <span className="font-body text-sm text-paper-dim">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-2xl font-bold text-paper">How it works</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm text-signal">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold text-paper">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-paper-dim">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-board-line py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-paper">
            Your to-do list isn't going anywhere on its own.
          </h2>
          <div className="mt-8">
            <Link to="/register" className="btn-primary">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

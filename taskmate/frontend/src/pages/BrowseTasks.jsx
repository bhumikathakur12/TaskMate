import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, MapIcon, LocateFixed, Search } from 'lucide-react';
import { fetchTasks } from '../redux/slices/taskSlice';
import { CATEGORIES } from '../constants/categories';
import TaskCard from '../components/TaskCard';
import TaskMap from '../components/TaskMap';

export default function BrowseTasks() {
  const dispatch = useDispatch();
  const { list, listStatus, pagination } = useSelector((state) => state.tasks);

  const [view, setView] = useState('list'); // 'list' | 'map'
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('newest');
  const [userLocation, setUserLocation] = useState(null); // [lat, lng]
  const [page, setPage] = useState(1);

  const runSearch = useCallback(
    (overridePage = 1) => {
      const params = { page: overridePage, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minBudget) params.minBudget = minBudget;
      if (maxBudget) params.maxBudget = maxBudget;
      if (sort !== 'newest') {
        params.sort = sort === 'budget_low' ? 'budget_asc' : sort === 'budget_high' ? 'budget_desc' : sort;
      }
      if (sort === 'nearest' && userLocation) {
        params.lat = userLocation[0];
        params.lng = userLocation[1];
      }
      dispatch(fetchTasks(params));
      setPage(overridePage);
    },
    [category, search, minBudget, maxBudget, sort, userLocation, dispatch]
  );

  useEffect(() => {
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  useEffect(() => {
    runSearch(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    });
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-paper">Browse tasks</h1>
        <div className="flex overflow-hidden rounded-sm border border-board-line">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm ${
              view === 'list' ? 'bg-signal text-board' : 'text-paper-dim'
            }`}
          >
            <List className="h-4 w-4" /> List
          </button>
          <button
            onClick={() => setView('map')}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm ${
              view === 'map' ? 'bg-signal text-board' : 'text-paper-dim'
            }`}
          >
            <MapIcon className="h-4 w-4" /> Map
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(1);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-dim" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="field pl-9"
            />
          </div>
          <button type="submit" className="btn-outline !px-5 !py-2.5 text-sm">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`rounded-sm border px-3 py-1.5 text-xs font-medium ${
              category === '' ? 'border-signal text-signal' : 'border-board-line text-paper-dim'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`rounded-sm border px-3 py-1.5 text-xs font-medium ${
                category === value
                  ? 'border-signal text-signal'
                  : 'border-board-line text-paper-dim'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="number"
            placeholder="Min \u20b9"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            onBlur={() => runSearch(1)}
            className="field w-28 !py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max \u20b9"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
            onBlur={() => runSearch(1)}
            className="field w-28 !py-2 text-sm"
          />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              if (e.target.value === 'nearest' && !userLocation) handleLocate();
            }}
            className="field w-auto !py-2 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="budget_high">Budget: high to low</option>
            <option value="budget_low">Budget: low to high</option>
            <option value="deadline">Deadline soonest</option>
            <option value="nearest">Nearest to me</option>
          </select>
          {sort === 'nearest' && !userLocation && (
            <button
              onClick={handleLocate}
              className="flex items-center gap-1.5 text-xs text-signal hover:underline"
            >
              <LocateFixed className="h-3.5 w-3.5" /> Share location
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mt-8">
        {listStatus === 'loading' && (
          <p className="text-sm text-paper-dim">Loading tasks…</p>
        )}
        {listStatus === 'succeeded' && list.length === 0 && (
          <p className="text-sm text-paper-dim">No tasks match those filters yet.</p>
        )}

        {view === 'list' ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <TaskMap tasks={list} userLocation={userLocation} height="560px" />
        )}

        {pagination && pagination.pages > 1 && view === 'list' && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => runSearch(p)}
                className={`h-8 w-8 rounded-sm text-sm font-mono ${
                  p === page ? 'bg-signal text-board' : 'border border-board-line text-paper-dim'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

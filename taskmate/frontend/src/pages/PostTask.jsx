import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LocateFixed, ImagePlus, X } from 'lucide-react';
import { createTask, clearCreateStatus } from '../redux/slices/taskSlice';
import { CATEGORIES } from '../constants/categories';

const emptyForm = {
  title: '',
  description: '',
  category: '',
  budget: '',
  budgetType: 'fixed',
  deadline: '',
  address: '',
};

export default function PostTask() {
  const [form, setForm] = useState(emptyForm);
  const [coords, setCoords] = useState(null); // [lng, lat]
  const [locating, setLocating] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [localError, setLocalError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createStatus, createError } = useSelector((state) => state.tasks);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocalError('Your browser does not support geolocation — enter the address manually.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.longitude, pos.coords.latitude]);
        setLocating(false);
      },
      () => {
        setLocalError('Could not get your location. You can still submit with an address.');
        setLocating(false);
      }
    );
  };

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setPhotos(files);
  };

  const removePhoto = (idx) => setPhotos(photos.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    dispatch(clearCreateStatus());

    if (!form.category) {
      setLocalError('Please choose a category.');
      return;
    }
    if (!coords) {
      setLocalError('Please share your location so nearby taskers can find this job.');
      return;
    }

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('category', form.category);
    fd.append('budget', form.budget);
    fd.append('budgetType', form.budgetType);
    fd.append('deadline', form.deadline);
    fd.append(
      'location',
      JSON.stringify({ coordinates: coords, address: form.address })
    );
    photos.forEach((file) => fd.append('photos', file));

    const result = await dispatch(createTask(fd));
    if (createTask.fulfilled.match(result)) {
      navigate(`/tasks/${result.payload._id}`);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-2xl font-bold text-paper">Post a task</h1>
      <p className="mt-2 text-sm text-paper-dim">
        Be specific about what needs doing — clearer tickets get better offers.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">Title</label>
          <input
            name="title"
            required
            maxLength={100}
            value={form.title}
            onChange={handleChange}
            className="field"
            placeholder="e.g. Clean 2BHK apartment"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {CATEGORIES.filter((c) => c.value !== 'other').concat(
              CATEGORIES.filter((c) => c.value === 'other')
            ).map(({ value, label, icon: Icon }) => (
              <button
                type="button"
                key={value}
                onClick={() => setForm({ ...form, category: value })}
                className={`flex flex-col items-center gap-1.5 rounded-sm border px-2 py-3 text-center transition-colors ${
                  form.category === value
                    ? 'border-signal bg-signal/10 text-signal'
                    : 'border-board-line text-paper-dim hover:border-paper-dim'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span className="text-[11px] leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Description
          </label>
          <textarea
            name="description"
            required
            maxLength={2000}
            rows={5}
            value={form.description}
            onChange={handleChange}
            className="field resize-none"
            placeholder="What needs to happen, and anything a tasker should know before bidding."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-paper-dim">
              Budget (\u20b9)
            </label>
            <input
              name="budget"
              type="number"
              min={1}
              required
              value={form.budget}
              onChange={handleChange}
              className="field"
              placeholder="800"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-paper-dim">
              Budget type
            </label>
            <select
              name="budgetType"
              value={form.budgetType}
              onChange={handleChange}
              className="field"
            >
              <option value="fixed">Fixed</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Deadline
          </label>
          <input
            name="deadline"
            type="datetime-local"
            required
            value={form.deadline}
            onChange={handleChange}
            className="field"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Location
          </label>
          <div className="flex gap-2">
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="field"
              placeholder="Model Town, Jalandhar"
            />
            <button
              type="button"
              onClick={handleLocate}
              disabled={locating}
              className="flex shrink-0 items-center gap-1.5 rounded-sm border border-board-line px-4 text-sm text-paper-dim hover:border-signal hover:text-signal"
            >
              <LocateFixed className="h-4 w-4" />
              {locating ? 'Locating…' : coords ? 'Located' : 'Use my location'}
            </button>
          </div>
          {coords && (
            <p className="mt-1 font-mono text-xs text-teal">
              Pinned at {coords[1].toFixed(4)}, {coords[0].toFixed(4)}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Photos <span className="text-paper-dim/50">(up to 5, optional)</span>
          </label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-board-line py-6 text-sm text-paper-dim hover:border-signal hover:text-signal">
            <ImagePlus className="h-5 w-5" />
            Click to add photos
            <input type="file" accept="image/*" multiple hidden onChange={handlePhotos} />
          </label>
          {photos.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {photos.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="h-16 w-16 rounded-sm object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-stamp p-0.5 text-paper"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {(localError || createError) && (
          <p className="rounded-sm border border-stamp/40 bg-stamp/10 px-3 py-2 text-sm text-stamp">
            {localError || createError}
          </p>
        )}

        <button type="submit" disabled={createStatus === 'loading'} className="btn-primary w-full">
          {createStatus === 'loading' ? 'Posting…' : 'Post task'}
        </button>
      </form>
    </main>
  );
}

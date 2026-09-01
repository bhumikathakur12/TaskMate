import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera } from 'lucide-react';
import api from '../api/axiosInstance';
import { loadCurrentUser } from '../redux/slices/authSlice';
import StarRating from '../components/StarRating';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: '', phone: '', bio: '', skills: '' });
  const [saveStatus, setSaveStatus] = useState('idle');
  const [error, setError] = useState('');
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        bio: user.bio || '',
        skills: (user.skills || []).join(', '),
      });
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      api.get(`/users/${user._id}/reviews`).then(({ data }) => setReviews(data.reviews));
    }
  }, [user?._id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveStatus('loading');
    setError('');
    try {
      await api.put('/users/me', {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      await dispatch(loadCurrentUser());
      setSaveStatus('succeeded');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      setSaveStatus('failed');
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    await api.put('/users/me/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch(loadCurrentUser());
  };

  const handleModeSwitch = async (mode) => {
    await api.put('/users/me/mode', { activeMode: mode });
    dispatch(loadCurrentUser());
  };

  if (!user) return null;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold text-paper">Your profile</h1>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-board-line bg-board-raised">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-2xl text-paper-dim">
                {user.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-signal text-board">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-paper">{user.name}</p>
          <StarRating value={user.rating?.average || 0} count={user.rating?.count || 0} />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {['poster', 'tasker'].map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeSwitch(mode)}
            className={`rounded-sm border px-4 py-2 text-sm font-medium capitalize ${
              user.activeMode === mode
                ? 'border-signal bg-signal/10 text-signal'
                : 'border-board-line text-paper-dim'
            }`}
          >
            {mode} mode
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">Name</label>
          <input name="name" value={form.name} onChange={handleChange} className="field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="field" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="field resize-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-paper-dim">
            Skills <span className="text-paper-dim/50">(comma separated)</span>
          </label>
          <input
            name="skills"
            value={form.skills}
            onChange={handleChange}
            className="field"
            placeholder="cleaning, plumbing, delivery"
          />
        </div>

        {error && <p className="text-sm text-stamp">{error}</p>}
        {saveStatus === 'succeeded' && <p className="text-sm text-teal">Saved.</p>}

        <button type="submit" disabled={saveStatus === 'loading'} className="btn-primary">
          {saveStatus === 'loading' ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <h2 className="mt-10 font-display text-lg font-bold text-paper">Reviews</h2>
      <div className="mt-4 space-y-3">
        {reviews.length === 0 && <p className="text-sm text-paper-dim">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="rounded-sm border border-board-line bg-board-raised p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-paper">{r.reviewer?.name}</span>
              <StarRating value={r.rating} size={14} />
            </div>
            {r.comment && <p className="mt-1.5 text-sm text-paper-dim">{r.comment}</p>}
            <p className="mt-1 font-mono text-[11px] text-paper-dim">{r.task?.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

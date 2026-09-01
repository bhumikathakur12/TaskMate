import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, PackageSearch, WalletMinimal, ShieldCheck } from 'lucide-react';
import { logout } from '../redux/slices/authSlice';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-board-line bg-board/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <PackageSearch className="h-6 w-6 text-signal" strokeWidth={2.5} />
          <span className="font-display text-xl font-bold tracking-tight text-paper">
            Task<span className="text-signal">Mate</span>
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            to="/tasks"
            className="hidden font-body text-sm font-medium text-paper-dim hover:text-paper transition-colors sm:inline"
          >
            Browse tasks
          </Link>
          <Link
            to="/community"
            className="hidden font-body text-sm font-medium text-paper-dim hover:text-paper transition-colors sm:inline"
          >
            Community
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden font-body text-sm font-medium text-paper-dim hover:text-paper transition-colors sm:inline"
              >
                Dashboard
              </Link>
              <Link to="/wallet" className="text-paper-dim hover:text-signal">
                <WalletMinimal className="h-5 w-5" />
              </Link>
              {user.isAdmin && (
                <Link to="/admin" className="text-paper-dim hover:text-signal">
                  <ShieldCheck className="h-5 w-5" />
                </Link>
              )}
              <Link to="/profile" className="font-mono text-xs text-paper-dim hover:text-paper">
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-paper-dim hover:text-signal transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-body text-sm font-medium text-paper-dim hover:text-paper transition-colors"
              >
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                Post a task
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { user, token, bootstrapped } = useSelector((state) => state.auth);

  if (!bootstrapped) {
    // Still verifying an existing session — avoid a flash-redirect to /login
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="font-mono text-sm text-paper-dim">Checking your session…</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

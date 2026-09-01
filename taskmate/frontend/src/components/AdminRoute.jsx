import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { user } = useSelector((state) => state.auth);

  return (
    <ProtectedRoute>
      {user?.isAdmin ? children : <Navigate to="/dashboard" replace />}
    </ProtectedRoute>
  );
}

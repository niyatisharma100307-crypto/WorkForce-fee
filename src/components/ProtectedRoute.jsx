import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

/**
 * Wrap any student/teacher route with this. Redirects to /login
 * if there's no session, or if the session role doesn't match.
 * Usage: <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ role, children }) {
  const { session } = useAuth();

  if (!session || session.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

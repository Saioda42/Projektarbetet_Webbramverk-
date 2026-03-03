import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, isLoggedIn }) {
  if (!isLoggedIn) {
    // Om inte inloggad, redirecta till login
    return <Navigate to="/login" replace />;
  }
  
  // Om inloggad, visa komponenten
  return children;
}

export default ProtectedRoute;
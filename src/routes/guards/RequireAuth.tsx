import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthLoadingScreen } from '@/routes/AuthLoadingScreen';

/** sem login → /login. */
export function RequireAuth() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return <AuthLoadingScreen />;
  if (status === 'unauthenticated') return <Navigate to={ROUTES.login} replace />;
  return <Outlet />;
}

import { Navigate } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthLoadingScreen } from '@/routes/AuthLoadingScreen';

/** Landing at "/" resolves to the right screen for the current auth state. */
export function RootRedirect() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return <AuthLoadingScreen />;
  return <Navigate to={status === 'authenticated' ? ROUTES.home : ROUTES.login} replace />;
}

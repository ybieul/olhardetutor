import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { useAuthStore } from '@/store/useAuthStore';
import { AuthLoadingScreen } from '@/routes/AuthLoadingScreen';

/**
 * Keeps signed-in users off /login and /forgot-password. Redirects to
 * /home, which itself defers to PetGate if the user still needs
 * onboarding — this guard doesn't need to know about pets at all.
 */
export function RequireGuest() {
  const status = useAuthStore((state) => state.status);

  if (status === 'loading') return <AuthLoadingScreen />;
  if (status === 'authenticated') return <Navigate to={ROUTES.home} replace />;
  return <Outlet />;
}

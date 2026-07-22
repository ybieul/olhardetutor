import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes.config';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { CheckinPage } from '@/features/checkin/pages/CheckinPage';
import { GuidesPage } from '@/features/guides/pages/GuidesPage';
import { AgendaPage } from '@/features/agenda/pages/AgendaPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { DevShowcasePage } from '@/routes/DevShowcasePage';

import { NotFoundPage } from './NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth/onboarding flow — no tab shell. */}
      <Route index element={<Navigate to={ROUTES.login} replace />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.onboarding} element={<OnboardingPage />} />

      {/* Main tab experience. */}
      <Route element={<AppShell />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.checkin} element={<CheckinPage />} />
        <Route path={ROUTES.guides} element={<GuidesPage />} />
        <Route path={ROUTES.agenda} element={<AgendaPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
        <Route path={ROUTES.devShowcase} element={<DevShowcasePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

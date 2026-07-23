import { Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ROUTES } from '@/config/routes.config';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage';
import { HomePage } from '@/features/home/pages/HomePage';
import { CheckinPage } from '@/features/checkin/pages/CheckinPage';
import { GuidesPage } from '@/features/guides/pages/GuidesPage';
import { AgendaPage } from '@/features/agenda/pages/AgendaPage';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { DevShowcasePage } from '@/routes/DevShowcasePage';
import { RootRedirect } from '@/routes/RootRedirect';
import { RequireAuth } from '@/routes/guards/RequireAuth';
import { RequireGuest } from '@/routes/guards/RequireGuest';
import { PetGate } from '@/routes/guards/PetGate';

import { NotFoundPage } from './NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<RootRedirect />} />

      {/* Auth flow — no tab shell, redirects away if already signed in. */}
      <Route element={<RequireGuest />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      </Route>

      {/* Reached via an emailed recovery link — may or may not already have a session. */}
      <Route path={ROUTES.resetPassword} element={<ResetPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<PetGate require="no-pet" />}>
          <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
        </Route>

        <Route element={<PetGate require="has-pet" />}>
          <Route element={<AppShell />}>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.checkin} element={<CheckinPage />} />
            <Route path={ROUTES.guides} element={<GuidesPage />} />
            <Route path={ROUTES.agenda} element={<AgendaPage />} />
            <Route path={ROUTES.profile} element={<ProfilePage />} />
            <Route path={ROUTES.devShowcase} element={<DevShowcasePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

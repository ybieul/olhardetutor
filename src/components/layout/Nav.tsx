import { BookOpen, CalendarDays, ClipboardCheck, Home, LogIn, PawPrint, User, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/cn';

type NavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.login, labelKey: 'nav.login', icon: LogIn },
  { to: ROUTES.onboarding, labelKey: 'nav.onboarding', icon: PawPrint },
  { to: ROUTES.home, labelKey: 'nav.home', icon: Home },
  { to: ROUTES.checkin, labelKey: 'nav.checkin', icon: ClipboardCheck },
  { to: ROUTES.guides, labelKey: 'nav.guides', icon: BookOpen },
  { to: ROUTES.agenda, labelKey: 'nav.agenda', icon: CalendarDays },
  { to: ROUTES.profile, labelKey: 'nav.profile', icon: User },
];

export function Nav() {
  const { t } = useTranslation('common');

  return (
    <nav className="flex flex-wrap gap-4 border-t border-neutral-200 px-16 py-8 sm:border-t-0 sm:px-0 sm:py-0">
      {NAV_ITEMS.map(({ to, labelKey, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-4 rounded-sm px-8 py-4 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100',
            )
          }
        >
          <Icon className="h-icon-sm w-icon-sm" aria-hidden="true" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}

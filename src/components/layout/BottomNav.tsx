import { BookOpen, CalendarDays, ClipboardCheck, Home, PawPrint, User, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/config/routes.config';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';

type NavItem = {
  to: string;
  labelKey: string;
  icon: LucideIcon;
};

const NAV_ITEMS: NavItem[] = [
  { to: ROUTES.home, labelKey: 'nav.home', icon: Home },
  { to: ROUTES.checkin, labelKey: 'nav.checkin', icon: ClipboardCheck },
  { to: ROUTES.guides, labelKey: 'nav.guides', icon: BookOpen },
  { to: ROUTES.agenda, labelKey: 'nav.agenda', icon: CalendarDays },
  { to: ROUTES.profile, labelKey: 'nav.profile', icon: User },
];

const MOBILE_LINK_CLASSES = 'flex flex-1 flex-col items-center gap-2 px-8 py-8 text-xs font-medium transition-colors';
const DESKTOP_LINK_CLASSES = 'flex items-center gap-8 rounded-md px-12 py-8 text-sm font-medium transition-colors';

/**
 * Primary app navigation — a fixed bottom bar on mobile, a side rail on
 * desktop. Only the 5 main tabs live here; auth/onboarding screens render
 * outside this shell.
 */
export function BottomNav() {
  const { t } = useTranslation('common');

  return (
    <>
      <nav
        data-tour="bottom-nav"
        aria-label={t('nav.label')}
        className="fixed inset-x-0 bottom-0 z-sticky flex justify-around border-t border-neutral-200 bg-white sm:hidden"
      >
        {NAV_ITEMS.map(({ to, labelKey, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(MOBILE_LINK_CLASSES, isActive ? 'text-primary-600' : 'text-neutral-500 hover:text-neutral-800')
            }
          >
            <Icon icon={icon} size="md" color="current" />
            {t(labelKey)}
          </NavLink>
        ))}
      </nav>

      <aside className="hidden sm:sticky sm:top-0 sm:flex sm:h-svh sm:w-rail sm:shrink-0 sm:flex-col sm:overflow-y-auto sm:border-r sm:border-neutral-200 sm:p-16">
        <div className="mb-24 flex items-center gap-8 px-12">
          <Icon icon={PawPrint} size="lg" color="primary" />
          <span className="text-lg font-bold text-foreground-light">{t('app.name')}</span>
        </div>
        <nav aria-label={t('nav.label')} className="flex flex-col gap-4">
          {NAV_ITEMS.map(({ to, labelKey, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  DESKTOP_LINK_CLASSES,
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-neutral-600 hover:bg-neutral-100',
                )
              }
            >
              <Icon icon={icon} size="md" color="current" />
              {t(labelKey)}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

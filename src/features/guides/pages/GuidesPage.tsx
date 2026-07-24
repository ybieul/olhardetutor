import {
  EyeOff,
  Fingerprint,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  TriangleAlert,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { GUIDE_MODULE_IDS, type GuideModuleId } from '@/config/app.config';
import { Button } from '@/components/ui/Button';
import { TourOverlay } from '@/components/tutorial/TourOverlay';
import { AlertSignsList } from '../components/AlertSignsList';
import { GuideCard } from '../components/GuideCard';
import { GuideDetail } from '../components/GuideDetail';
import { VetButton } from '../components/VetButton';
import type { GuideView } from '../types';
import { usePetSpecies } from '../hooks/usePetSpecies';

const MODULE_ICONS: Record<GuideModuleId, LucideIcon> = {
  silence: EyeOff,
  dna: Fingerprint,
  checkin: ClipboardList,
  changes: TrendingUp,
  history: Clock,
  when: AlertCircle,
};

export function GuidesPage() {
  const { t } = useTranslation('guides');
  const petSpecies = usePetSpecies();
  const [view, setView] = useState<GuideView>({ type: 'list' });

  return (
    <div className="flex flex-col gap-16">
      <TourOverlay tourId="guides" />

      {/* Legal disclaimer — always at top */}
      <div className="rounded-md border border-primary-100 bg-primary-50 px-12 py-10">
        <p className="text-xs text-primary-700">{t('disclaimer')}</p>
      </div>

      {view.type === 'list' && (
        <>
          <h1 data-tour="guides-header" className="text-xl font-bold text-foreground">{t('title')}</h1>

          <div data-tour="guides-list" className="flex flex-col gap-10">
            {GUIDE_MODULE_IDS.map((id) => (
              <GuideCard
                key={id}
                moduleId={id}
                iconComponent={MODULE_ICONS[id]}
                onClick={() => setView({ type: 'module', id })}
              />
            ))}

            {/* Alert signs card */}
            <button
              type="button"
              onClick={() => setView({ type: 'alertSigns' })}
              className="w-full text-left"
            >
              <Card padding="md" shadow="sm" className="transition-shadow hover:shadow-md">
                <div className="flex items-center gap-12">
                  <div className="flex h-40 w-40 flex-shrink-0 items-center justify-center rounded-full bg-danger-50">
                    <Icon icon={TriangleAlert} size="md" color="danger" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {t('alertSigns.title')}
                    </p>
                    <p className="truncate text-sm text-neutral-500">
                      {t('alertSigns.subtitle')}
                    </p>
                  </div>
                  <Icon icon={ChevronRight} size="sm" color="neutral" />
                </div>
              </Card>
            </button>
          </div>

          <div data-tour="vet-button" className="pt-8">
            <VetButton />
          </div>
        </>
      )}

      {view.type === 'module' && (
        <GuideDetail
          moduleId={view.id}
          onBack={() => setView({ type: 'list' })}
        />
      )}

      {view.type === 'alertSigns' && (
        <div className="flex flex-col gap-16">
          <div className="flex items-center gap-8">
            <Button
              variant="ghost"
              size="sm"
              icon={ChevronLeft}
              onClick={() => setView({ type: 'list' })}
            >
              {t('backToList')}
            </Button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">{t('alertSigns.title')}</h2>
            <p className="mt-4 text-sm text-neutral-500">{t('alertSigns.subtitle')}</p>
          </div>

          <AlertSignsList petSpecies={petSpecies} />

          <div className="pt-8">
            <VetButton />
          </div>
        </div>
      )}
    </div>
  );
}

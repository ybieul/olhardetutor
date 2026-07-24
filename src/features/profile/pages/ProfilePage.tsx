import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { deleteAccount } from '@/lib/supabase/queries/account';
import { exportHealthSheet } from '@/lib/pdf/exportHealthSheet';
import { TourOverlay } from '@/components/tutorial/TourOverlay';
import { useProfileData } from '../hooks/useProfileData';
import { InstallCard } from '../components/InstallCard';
import { NotificationCard } from '../components/NotificationCard';
import { PetCard } from '../components/PetCard';
import { WeightChart } from '../components/WeightChart';
import { WeightForm } from '../components/WeightForm';
import { StreakCard } from '../components/StreakCard';
import { PreferencesSection } from '../components/PreferencesSection';
import { PrivacySection } from '../components/PrivacySection';

export function ProfilePage() {
  const { t } = useTranslation('profile');
  const { pet, photoUrl, weightHistory, recentCheckins, healthEvents, loading, recordWeight } = useProfileData();
  const [showWeightForm, setShowWeightForm] = useState(false);

  async function handleExportPdf() {
    if (!pet) return;
    await exportHealthSheet({ pet, photoUrl, weightHistory, healthEvents, checkins: recentCheckins });
  }

  async function handleDeleteAccount() {
    await deleteAccount();
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-16">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-200 rounded-xl" />
      </div>
    );
  }

  if (!pet) return null;

  return (
    <div className="flex flex-col gap-16">
      <TourOverlay tourId="profile" />

      <h1 className="text-xl font-bold text-foreground">{t('title')}</h1>

      <InstallCard />
      <NotificationCard />

      <div data-tour="profile-pet-card">
        <PetCard pet={pet} photoUrl={photoUrl} />
      </div>

      <div data-tour="profile-streak">
        <StreakCard checkins={recentCheckins} />
      </div>

      {/* Weight section */}
      <div data-tour="profile-weight">
        <Card padding="md" shadow="sm">
          <div className="flex flex-col gap-12">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">{t('weight.title')}</p>
              <Button variant="secondary" size="sm" icon={Plus} onClick={() => setShowWeightForm(true)}>
                {t('weight.addButton')}
              </Button>
            </div>
            <WeightChart entries={weightHistory} />
          </div>
        </Card>
      </div>

      <div data-tour="profile-preferences">
        <PreferencesSection />
      </div>

      <PrivacySection
        data={{ pet, photoUrl, weightHistory, recentCheckins, healthEvents }}
        onExportPdf={handleExportPdf}
        onDeleteAccount={handleDeleteAccount}
      />

      <WeightForm
        open={showWeightForm}
        onClose={() => setShowWeightForm(false)}
        onSave={(date, kg) => recordWeight(pet.id, date, kg)}
      />
    </div>
  );
}

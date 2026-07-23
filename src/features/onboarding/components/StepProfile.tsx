import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { getPetPhotoUrl, uploadPetPhoto } from '@/lib/supabase/queries/pets';
import { useOnboardingStore, type BirthDateMode } from '@/features/onboarding/store/useOnboardingStore';
import type { ProfileStepErrors } from '@/features/onboarding/lib/petProfileHelpers';

type StepProfileProps = {
  errors: ProfileStepErrors;
};

export function StepProfile({ errors }: StepProfileProps) {
  const { t } = useTranslation('onboarding');
  const data = useOnboardingStore((state) => state.data);
  const updateData = useOnboardingStore((state) => state.updateData);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Returning to this step after a reload: re-resolve a preview from the
  // already-uploaded storage path (a local blob preview doesn't survive
  // a page reload, but the upload itself already did).
  useEffect(() => {
    if (!data.photoPath || previewUrl) return;
    let active = true;
    getPetPhotoUrl(data.photoPath)
      .then((url) => {
        if (active) setPreviewUrl(url);
      })
      .catch(() => {
        /* stale/broken path — leave the fallback avatar showing */
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when the persisted path itself changes
  }, [data.photoPath]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const localPreview = URL.createObjectURL(file);
    objectUrlRef.current = localPreview;
    setPreviewUrl(localPreview);
    setUploadError(false);
    setUploading(true);

    try {
      const path = await uploadPetPhoto(file);
      updateData({ photoPath: path });
    } catch {
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-24">
      <div className="flex flex-col gap-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground-light">{t('profile.title')}</h1>
        <p className="text-base text-neutral-600">{t('profile.subtitle')}</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <Avatar src={previewUrl ?? undefined} alt={t('profile.photoAlt', { name: data.name || '' })} size="xl" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <Button
          variant="secondary"
          size="sm"
          icon={Camera}
          loading={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {data.photoPath ? t('profile.photoChange') : t('profile.photoUpload')}
        </Button>
        <p className="text-xs text-neutral-500">{t('profile.photoHelp')}</p>
        {uploadError ? (
          <p role="alert" className="text-sm text-danger-600">
            {t('profile.photoUploadError')}
          </p>
        ) : null}
      </div>

      <Input
        label={t('profile.nameLabel')}
        placeholder={t('profile.namePlaceholder')}
        value={data.name}
        onChange={(event) => updateData({ name: event.target.value })}
        error={errors.name ? t(`profile.${errors.name}`) : undefined}
        required
      />

      <div className="flex flex-col gap-8">
        <Input
          label={t('profile.breedLabel')}
          placeholder={t('profile.breedPlaceholder')}
          value={data.breedUnknown ? '' : data.breed}
          onChange={(event) => updateData({ breed: event.target.value })}
          disabled={data.breedUnknown}
        />
        <Checkbox
          label={t('profile.breedUnknown')}
          checked={data.breedUnknown}
          onChange={(event) =>
            updateData({ breedUnknown: event.target.checked, breed: event.target.checked ? '' : data.breed })
          }
        />
      </div>

      <div className="flex flex-col gap-8">
        <span className="text-sm font-medium text-foreground-light">{t('profile.birthDateModeLabel')}</span>
        <SegmentedControl<BirthDateMode>
          label={t('profile.birthDateModeLabel')}
          value={data.birthDateMode}
          onChange={(value) => updateData({ birthDateMode: value })}
          options={[
            { value: 'exact', label: t('profile.birthDateModeExact') },
            { value: 'approximate', label: t('profile.birthDateModeApproximate') },
          ]}
        />
        {data.birthDateMode === 'exact' ? (
          <Input
            label={t('profile.birthDateLabel')}
            type="date"
            value={data.birthDate}
            onChange={(event) => updateData({ birthDate: event.target.value })}
            max={new Date().toISOString().slice(0, 10)}
            error={errors.birthDate ? t(`profile.${errors.birthDate}`) : undefined}
          />
        ) : (
          <div className="flex flex-col gap-8">
            <span className="text-sm font-medium text-foreground-light">{t('profile.approximateAgeLabel')}</span>
            <div className="flex gap-8">
              <Input
                label={t('profile.approximateAgeYearsPlaceholder')}
                type="number"
                min={0}
                placeholder={t('profile.approximateAgeYearsPlaceholder')}
                value={data.approximateAgeYears}
                onChange={(event) => updateData({ approximateAgeYears: event.target.value })}
              />
              <Input
                label={t('profile.approximateAgeMonthsPlaceholder')}
                type="number"
                min={0}
                max={11}
                placeholder={t('profile.approximateAgeMonthsPlaceholder')}
                value={data.approximateAgeMonths}
                onChange={(event) => updateData({ approximateAgeMonths: event.target.value })}
              />
            </div>
            {errors.approximateAge ? (
              <p role="alert" className="text-sm text-danger-600">
                {t(`profile.${errors.approximateAge}`)}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <Input
        label={t('profile.weightLabel')}
        type="number"
        min={0}
        step="0.1"
        placeholder={t('profile.weightPlaceholder')}
        value={data.weightKg}
        onChange={(event) => updateData({ weightKg: event.target.value })}
        error={errors.weight ? t(`profile.${errors.weight}`) : undefined}
        required
      />
    </div>
  );
}

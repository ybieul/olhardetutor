import { useTranslation } from 'react-i18next';
import { Utensils, Droplets, Moon, Zap, CircleDot, Droplet, Brain, MessageSquare } from 'lucide-react';

import { Slider } from '@/components/ui/Slider';
import { TextArea } from '@/components/ui/TextArea';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useCheckinFormStore } from '@/features/checkin/store/useCheckinFormStore';
import { sanitizeFreeText } from '@/lib/security/sanitize';
import { CategoryStatus } from './CategoryStatus';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type SectionProps = {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
};

function Section({ icon, label, children }: SectionProps) {
  return (
    <Card padding="md" shadow="sm" className="flex flex-col gap-12">
      <div className="flex items-center gap-8">
        <Icon icon={icon} size="sm" color="primary" />
        <span className="text-sm font-semibold text-foreground-light">{label}</span>
      </div>
      {children}
    </Card>
  );
}

/** The 8-question check-in form. Reads and writes to useCheckinFormStore. */
export function CheckinForm() {
  const { t } = useTranslation('checkin');
  const form = useCheckinFormStore((s) => s.form);
  const update = useCheckinFormStore((s) => s.update);
  const updateStoolDetail = useCheckinFormStore((s) => s.updateStoolDetail);
  const updateUrineDetail = useCheckinFormStore((s) => s.updateUrineDetail);
  const setStoolStatus = useCheckinFormStore((s) => s.setStoolStatus);
  const setUrineStatus = useCheckinFormStore((s) => s.setUrineStatus);

  const sliderMarks = (ns: 'feeding' | 'water' | 'sleep' | 'activity' | 'behavior') =>
    [1, 2, 3, 4, 5].map((v) => ({ value: v, label: t(`${ns}.marks.${v}`) }));

  return (
    <div className="flex flex-col gap-12">
      {/* 1. Alimentação */}
      <Section icon={Utensils} label={t('feeding.label')}>
        <Slider
          label={t('feeding.label')}
          value={form.feeding}
          onChange={(v) => update({ feeding: v })}
          marks={sliderMarks('feeding')}
        />
      </Section>

      {/* 2. Água */}
      <Section icon={Droplets} label={t('water.label')}>
        <Slider
          label={t('water.label')}
          value={form.water}
          onChange={(v) => update({ water: v })}
          marks={sliderMarks('water')}
        />
      </Section>

      {/* 3. Sono (bidirectional — center is normal) */}
      <Section icon={Moon} label={t('sleep.label')}>
        <Slider
          label={t('sleep.label')}
          value={form.sleep}
          onChange={(v) => update({ sleep: v })}
          marks={sliderMarks('sleep')}
        />
      </Section>

      {/* 4. Energia */}
      <Section icon={Zap} label={t('activity.label')}>
        <Slider
          label={t('activity.label')}
          value={form.activity}
          onChange={(v) => update({ activity: v })}
          marks={sliderMarks('activity')}
        />
      </Section>

      {/* 5. Fezes */}
      <Section icon={CircleDot} label={t('stool.label')}>
        <CategoryStatus
          label={t('stool.label')}
          value={form.stoolStatus}
          onChange={setStoolStatus}
          normalLabel={t('stool.normal')}
          differentLabel={t('stool.different')}
          notObservedLabel={t('stool.notObserved')}
          detailsTitle={t('stool.detailsTitle')}
          items={[
            { key: 'soft', label: t('stool.soft'), checked: form.stoolDetails.soft ?? false },
            { key: 'hard', label: t('stool.hard'), checked: form.stoolDetails.hard ?? false },
            { key: 'blood', label: t('stool.blood'), checked: form.stoolDetails.blood ?? false },
            { key: 'mucus', label: t('stool.mucus'), checked: form.stoolDetails.mucus ?? false },
            { key: 'colorChange', label: t('stool.colorChange'), checked: form.stoolDetails.colorChange ?? false },
            { key: 'parasites', label: t('stool.parasites'), checked: form.stoolDetails.parasites ?? false },
          ]}
          onItemChange={(key, checked) => updateStoolDetail(key as keyof typeof form.stoolDetails, checked)}
        />
      </Section>

      {/* 6. Urina */}
      <Section icon={Droplet} label={t('urine.label')}>
        <CategoryStatus
          label={t('urine.label')}
          value={form.urineStatus}
          onChange={setUrineStatus}
          normalLabel={t('urine.normal')}
          differentLabel={t('urine.different')}
          notObservedLabel={t('urine.notObserved')}
          detailsTitle={t('urine.detailsTitle')}
          items={[
            {
              key: 'increasedFrequency',
              label: t('urine.increasedFrequency'),
              checked: form.urineDetails.increasedFrequency ?? false,
            },
            {
              key: 'decreasedFrequency',
              label: t('urine.decreasedFrequency'),
              checked: form.urineDetails.decreasedFrequency ?? false,
            },
            { key: 'colorChange', label: t('urine.colorChange'), checked: form.urineDetails.colorChange ?? false },
            { key: 'blood', label: t('urine.blood'), checked: form.urineDetails.blood ?? false },
            { key: 'straining', label: t('urine.straining'), checked: form.urineDetails.straining ?? false },
          ]}
          onItemChange={(key, checked) => updateUrineDetail(key as keyof typeof form.urineDetails, checked)}
        />
      </Section>

      {/* 7. Comportamento */}
      <Section icon={Brain} label={t('behavior.label')}>
        <Slider
          label={t('behavior.label')}
          value={form.behavior}
          onChange={(v) => update({ behavior: v })}
          marks={sliderMarks('behavior')}
        />
      </Section>

      {/* 8. Nota livre */}
      <Section icon={MessageSquare} label={t('freeNote.label')}>
        <TextArea
          label={t('freeNote.label')}
          placeholder={t('freeNote.placeholder')}
          helperText={t('freeNote.helperText')}
          value={form.freeNote}
          rows={3}
          onChange={(e) => update({ freeNote: sanitizeFreeText(e.target.value) })}
        />
      </Section>
    </div>
  );
}

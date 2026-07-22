import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Cat, Dog, Heart } from 'lucide-react';

import { ASSETS_CONFIG } from '@/config/assets.config';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Slider } from '@/components/ui/Slider';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Sheet } from '@/components/ui/Sheet';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-12">
      <h2 className="text-lg font-semibold text-foreground-light">{title}</h2>
      <Card className="flex flex-col gap-20">{children}</Card>
    </section>
  );
}

function Row({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">{caption}</p>
      <div className="flex flex-wrap items-center gap-12">{children}</div>
    </div>
  );
}

/** Renders every UI primitive for visual QA. Not part of the shipped app — see CLAUDE.md. */
export function DevShowcasePage() {
  const { t } = useTranslation(['dev', 'common']);

  const [sliderValue, setSliderValue] = useState(3);
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [reminderChecked, setReminderChecked] = useState(false);
  const [contactPreference, setContactPreference] = useState('email');
  const [modalOpen, setModalOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sliderMarks = [
    { value: 1, label: t('dev:slider.muchLess') },
    { value: 2, label: t('dev:slider.less') },
    { value: 3, label: t('dev:slider.normal') },
    { value: 4, label: t('dev:slider.more') },
    { value: 5, label: t('dev:slider.muchMore') },
  ];

  return (
    <div className="flex flex-col gap-32 pb-48">
      <div>
        <Header title={t('dev:title')} action={<Badge label={t('dev:badge.normal')} level="success" />} />
        <p className="-mt-8 text-sm text-neutral-500">{t('dev:subtitle')}</p>
      </div>

      <Section title={t('dev:sections.button')}>
        <Row caption={t('dev:button.variants')}>
          <Button variant="primary">{t('dev:button.primary')}</Button>
          <Button variant="secondary">{t('dev:button.secondary')}</Button>
          <Button variant="ghost">{t('dev:button.ghost')}</Button>
          <Button variant="danger">{t('dev:button.danger')}</Button>
        </Row>
        <Row caption={t('dev:button.sizes')}>
          <Button size="sm">{t('dev:button.small')}</Button>
          <Button size="md">{t('dev:button.medium')}</Button>
          <Button size="lg">{t('dev:button.large')}</Button>
        </Row>
        <Row caption={t('dev:button.states')}>
          <Button loading>{t('dev:button.loading')}</Button>
          <Button icon={Heart}>{t('dev:button.withIcon')}</Button>
          <Button disabled>{t('dev:button.secondary')}</Button>
        </Row>
        <Row caption={t('dev:button.fullWidth')}>
          <Button fullWidth>{t('dev:button.fullWidth')}</Button>
        </Row>
      </Section>

      <Section title={t('dev:sections.card')}>
        <Card padding="sm" shadow="sm" className="border border-neutral-200">
          <p className="text-base font-semibold text-foreground-light">{t('dev:card.title')}</p>
          <p className="text-sm text-neutral-600">{t('dev:card.body')}</p>
        </Card>
      </Section>

      <Section title={t('dev:sections.inputs')}>
        <Input
          label={t('dev:input.label')}
          placeholder={t('dev:input.placeholder')}
          helperText={t('dev:input.helper')}
        />
        <Input
          label={t('dev:inputError.label')}
          placeholder={t('dev:inputError.placeholder')}
          error={t('dev:inputError.error')}
        />
        <TextArea label={t('dev:textarea.label')} placeholder={t('dev:textarea.placeholder')} />
      </Section>

      <Section title={t('dev:sections.selection')}>
        <Slider label={t('dev:slider.label')} value={sliderValue} onChange={setSliderValue} marks={sliderMarks} />
        <SegmentedControl
          label={t('dev:segmentedControl.label')}
          value={petType}
          onChange={setPetType}
          options={[
            { value: 'dog', label: t('dev:segmentedControl.dog'), icon: Dog },
            { value: 'cat', label: t('dev:segmentedControl.cat'), icon: Cat },
          ]}
        />
        <Checkbox
          label={t('dev:checkbox.label')}
          checked={reminderChecked}
          onChange={(event) => setReminderChecked(event.target.checked)}
        />
        <RadioGroup
          label={t('dev:radioGroup.label')}
          value={contactPreference}
          onChange={setContactPreference}
          options={[
            { value: 'email', label: t('dev:radioGroup.email') },
            { value: 'phone', label: t('dev:radioGroup.phone') },
            { value: 'sms', label: t('dev:radioGroup.sms') },
          ]}
        />
      </Section>

      <Section title={t('dev:sections.display')}>
        <Row caption={t('dev:labels.avatar')}>
          <Avatar alt={t('dev:avatar.alt')} size="sm" />
          <Avatar alt={t('dev:avatar.alt')} size="md" />
          <Avatar alt={t('dev:avatar.alt')} size="lg" />
          <Avatar alt={t('dev:avatar.alt')} size="xl" />
          <Avatar alt={t('dev:avatar.altBroken')} src={ASSETS_CONFIG.dev.brokenImage} />
        </Row>
        <Row caption={t('dev:labels.badge')}>
          <Badge label={t('dev:badge.normal')} level="success" />
          <Badge label={t('dev:badge.observe')} level="neutral" />
          <Badge label={t('dev:badge.attention')} level="warning" />
          <Badge label={t('dev:badge.urgent')} level="danger" />
        </Row>
        <Row caption={t('dev:labels.progressBar')}>
          <div className="w-full max-w-sm">
            <ProgressBar value={50} label={t('dev:progressBar.label')} />
          </div>
        </Row>
        <Row caption={t('dev:labels.skeleton')}>
          <div className="flex items-center gap-12">
            <Skeleton radius="full" className="h-avatar-md w-avatar-md" />
            <div className="flex flex-col gap-8">
              <Skeleton className="h-16 w-48" />
              <Skeleton className="h-16 w-32" />
            </div>
          </div>
          <p className="text-xs text-neutral-500">{t('dev:skeleton.note')}</p>
        </Row>
      </Section>

      <Section title={t('dev:sections.overlays')}>
        <Row caption={t('dev:labels.modalSheet')}>
          <Button onClick={() => setModalOpen(true)}>{t('dev:modal.trigger')}</Button>
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>
            {t('dev:sheet.trigger')}
          </Button>
        </Row>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('dev:modal.title')}
        closeLabel={t('common:actions.close')}
        footer={
          <div className="flex justify-end gap-8">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common:actions.close')}
            </Button>
            <Button onClick={() => setModalOpen(false)}>{t('dev:modal.confirm')}</Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">{t('dev:modal.body')}</p>
      </Modal>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('dev:sheet.title')}
        closeLabel={t('common:actions.close')}
      >
        <p className="text-sm text-neutral-600">{t('dev:sheet.body')}</p>
      </Sheet>
    </div>
  );
}

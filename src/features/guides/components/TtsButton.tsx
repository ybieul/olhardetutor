import { Volume2, Pause, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export type TtsState = 'idle' | 'speaking' | 'paused';

type TtsButtonProps = {
  state: TtsState;
  available: boolean;
  onToggle: () => void;
};

const STATE_ICON = {
  idle: Volume2,
  speaking: Pause,
  paused: Play,
} as const;

const STATE_KEY = {
  idle: 'audio.listen',
  speaking: 'audio.pause',
  paused: 'audio.resume',
} as const;

export function TtsButton({ state, available, onToggle }: TtsButtonProps) {
  const { t } = useTranslation('guides');

  if (!available) return null;

  const IconComponent = STATE_ICON[state];
  const label = t(STATE_KEY[state]);
  const isActive = state !== 'idle';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center gap-4 rounded-full px-10 py-4 text-xs font-medium transition-colors',
        isActive
          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
      )}
    >
      <Icon icon={IconComponent} size="sm" color="current" />
      <span>{label}</span>
    </button>
  );
}

import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/cn';
import { TTS_SPEEDS, useTtsStore, type TtsSpeed } from '@/store/useTtsStore';

const SPEED_KEY: Record<TtsSpeed, string> = {
  0.7: 'audio.speedSlow',
  1.0: 'audio.speedNormal',
  1.3: 'audio.speedFast',
};

export function SpeedControl() {
  const { t } = useTranslation('guides');
  const { rate, setRate } = useTtsStore();

  return (
    <div className="flex items-center gap-8">
      <span className="text-xs text-neutral-500">{t('audio.speed')}</span>
      <div className="flex overflow-hidden rounded-md border border-neutral-200">
        {TTS_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            onClick={() => setRate(speed)}
            className={cn(
              'px-10 py-4 text-xs font-medium transition-colors',
              rate === speed
                ? 'bg-primary-500 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-50',
            )}
          >
            {t(SPEED_KEY[speed])}
          </button>
        ))}
      </div>
    </div>
  );
}

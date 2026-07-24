import { Card } from '@/components/ui/Card';
import type { GuideSectionData } from '../types';
import { TtsButton, type TtsState } from './TtsButton';

type GuideSectionProps = {
  section: GuideSectionData;
  ttsState: TtsState;
  ttsAvailable: boolean;
  onToggleTts: () => void;
};

export function GuideSection({ section, ttsState, ttsAvailable, onToggleTts }: GuideSectionProps) {
  return (
    <Card padding="md" shadow="sm">
      <div className="flex items-start justify-between gap-8 pb-8">
        <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
        <TtsButton state={ttsState} available={ttsAvailable} onToggle={onToggleTts} />
      </div>
      <p className="text-sm leading-relaxed text-neutral-600">{section.body}</p>
    </Card>
  );
}

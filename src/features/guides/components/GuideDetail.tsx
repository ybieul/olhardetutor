import { useEffect, useState } from 'react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { GuideModuleId } from '@/config/app.config';
import {
  isAvailable,
  getVoiceForLanguage,
  speakText,
  pauseSpeech,
  resumeSpeech,
  cancelSpeech,
} from '@/lib/audio/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useTtsStore } from '@/store/useTtsStore';
import type { GuideModuleData } from '../types';
import { usePetSpecies } from '../hooks/usePetSpecies';
import { GuideSection } from './GuideSection';
import { SpeedControl } from './SpeedControl';
import { VetButton } from './VetButton';

type GuideDetailProps = {
  moduleId: GuideModuleId;
  onBack: () => void;
};

type ActiveSection = {
  id: string;
  /** Language active when this section started playing. Used to detect stale TTS. */
  lang: string;
};

export function GuideDetail({ moduleId, onBack }: GuideDetailProps) {
  const { t } = useTranslation('guides');
  const { language } = useLanguageStore();
  const { rate } = useTtsStore();
  const petSpecies = usePetSpecies();
  const ttsAvailable = isAvailable();

  const [active, setActive] = useState<ActiveSection | null>(null);
  const [playState, setPlayState] = useState<'speaking' | 'paused'>('speaking');
  const [showVoiceWarning, setShowVoiceWarning] = useState(false);

  const moduleData = t(`modules.${moduleId}`, { returnObjects: true }) as unknown as GuideModuleData;

  // Cancel speech when language changes — content and voice would be stale.
  // Only touches the external speech API (no setState), so the effect is safe.
  // The active section UI resets automatically because active.lang !== language.
  useEffect(() => {
    cancelSpeech();
  }, [language]);

  // Cancel on unmount (user navigated back)
  useEffect(() => () => { cancelSpeech(); }, []);

  function getSectionTtsState(sectionId: string): 'idle' | 'speaking' | 'paused' {
    if (!active || active.id !== sectionId || active.lang !== language) return 'idle';
    return playState;
  }

  function handleSectionToggle(sectionId: string, text: string) {
    if (!ttsAvailable) return;

    const isCurrentSection = active?.id === sectionId && active.lang === language;

    if (isCurrentSection) {
      if (playState === 'speaking') {
        pauseSpeech();
        setPlayState('paused');
      } else {
        resumeSpeech();
        setPlayState('speaking');
      }
      return;
    }

    cancelSpeech();
    const voiceFound = Boolean(getVoiceForLanguage(language));
    setShowVoiceWarning(!voiceFound);
    setActive({ id: sectionId, lang: language });
    setPlayState('speaking');

    speakText(text, language, rate, () => {
      setActive(null);
      setPlayState('speaking');
    });
  }

  const filteredSections =
    moduleData.sections?.filter(
      (s) => !s.species || s.species === 'all' || petSpecies === null || s.species === petSpecies,
    ) ?? [];

  return (
    <div className="flex flex-col gap-16">
      <div className="flex items-center gap-8">
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={onBack}>
          {t('backToList')}
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-foreground">{moduleData.title}</h2>
        <p className="mt-4 text-sm text-neutral-500">{moduleData.tagline}</p>
      </div>

      {ttsAvailable && <SpeedControl />}

      {showVoiceWarning && (
        <div className="flex items-start gap-8 rounded-md border border-warning-200 bg-warning-50 p-12">
          <Icon icon={AlertCircle} size="sm" color="warning" />
          <p className="text-sm text-warning-700">{t('audio.voiceFallback')}</p>
        </div>
      )}

      {filteredSections.map((section) => (
        <GuideSection
          key={section.id}
          section={section}
          ttsState={getSectionTtsState(section.id)}
          ttsAvailable={ttsAvailable}
          onToggleTts={() => handleSectionToggle(section.id, `${section.title}. ${section.body}`)}
        />
      ))}

      {moduleId === 'when' && (
        <div className="pt-8">
          <VetButton />
        </div>
      )}
    </div>
  );
}

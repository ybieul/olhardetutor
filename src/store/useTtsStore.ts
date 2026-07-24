import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const TTS_SPEEDS = [0.7, 1.0, 1.3] as const;
export type TtsSpeed = (typeof TTS_SPEEDS)[number];

type TtsStore = {
  rate: TtsSpeed;
  setRate: (rate: TtsSpeed) => void;
};

export const useTtsStore = create<TtsStore>()(
  persist(
    (set) => ({
      rate: 1.0,
      setRate: (rate) => set({ rate }),
    }),
    { name: 'olhar-de-tutor:tts-prefs' },
  ),
);

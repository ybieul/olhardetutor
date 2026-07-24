/** Voice list, populated on first use and kept in sync via onvoiceschanged. */
let _voices: SpeechSynthesisVoice[] = [];

function _syncVoices(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    _voices = window.speechSynthesis.getVoices();
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  _syncVoices();
  window.speechSynthesis.onvoiceschanged = _syncVoices;
}

export function isAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Finds the best available voice for `lang` (e.g. 'pt-BR' or 'en').
 * Priority: exact match → case-insensitive match → language-prefix match.
 */
export function getVoiceForLanguage(lang: string): SpeechSynthesisVoice | null {
  if (_voices.length === 0) _syncVoices();
  const lower = lang.toLowerCase();
  const prefix = lower.split('-')[0] ?? '';
  return (
    _voices.find(v => v.lang === lang) ??
    _voices.find(v => v.lang.toLowerCase() === lower) ??
    _voices.find(v => v.lang.toLowerCase().startsWith(prefix)) ??
    null
  );
}

export function hasVoiceForLanguage(lang: string): boolean {
  return getVoiceForLanguage(lang) !== null;
}

/**
 * Cancels any current speech, then starts speaking `text`.
 * Attaches `onEnd`/`onError` handlers before calling speak so they fire
 * even if the utterance is very short.
 */
export function speakText(
  text: string,
  lang: string,
  rate: number,
  onEnd?: () => void,
  onError?: () => void,
): void {
  if (!isAvailable()) return;
  const synthesis = window.speechSynthesis;
  synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;

  const voice = getVoiceForLanguage(lang);
  if (voice) utterance.voice = voice;
  if (onEnd) utterance.onend = onEnd;
  if (onError) utterance.onerror = onError;

  synthesis.speak(utterance);
}

export function pauseSpeech(): void {
  if (isAvailable()) window.speechSynthesis.pause();
}

export function resumeSpeech(): void {
  if (isAvailable()) window.speechSynthesis.resume();
}

export function cancelSpeech(): void {
  if (isAvailable()) window.speechSynthesis.cancel();
}

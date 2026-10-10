let pending: ReturnType<typeof setTimeout> | undefined;
let removeVoiceListener: (() => void) | undefined;
let enabled = true;

export function examinerVoiceEnabled() { return enabled; }
export function stopExaminerSpeech() {
  clearTimeout(pending);
  pending = undefined;
  removeVoiceListener?.();
  removeVoiceListener = undefined;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}
export function setExaminerVoiceEnabled(value: boolean) {
  enabled = value;
  if (!value) stopExaminerSpeech();
}

/** OS voice availability differs: prefer a Korean male voice, then Korean. */
export function chooseExaminerVoice(voices: SpeechSynthesisVoice[]) {
  const korean = voices.filter(voice => /^ko(?:[-_]|$)/i.test(voice.lang));
  return korean.find(voice => /InJoon|Hyunsu|Hyunwoo|male\b|남성|남자/i.test(voice.name) && !/female/i.test(voice.name))
    ?? korean.find(voice => voice.default) ?? korean[0];
}

export function speakExaminerInstruction(text: string, onError?: () => void) {
  stopExaminerSpeech();
  if (!enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synthesis = window.speechSynthesis;
  let spoken = false;
  let active = true;
  const speak = () => {
    if (spoken || !enabled || !active) return;
    spoken = true;
    clearTimeout(pending);
    removeVoiceListener?.();
    removeVoiceListener = undefined;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.voice = chooseExaminerVoice(synthesis.getVoices()) ?? null;
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.onerror = event => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') onError?.();
    };
    synthesis.speak(utterance);
  };
  // Some browsers load voices asynchronously. Cancellation also removes this
  // listener, so a late voice list cannot start playback over the microphone.
  const voicesChanged = () => { if (chooseExaminerVoice(synthesis.getVoices())) speak(); };
  synthesis.addEventListener('voiceschanged', voicesChanged);
  removeVoiceListener = () => { active = false; synthesis.removeEventListener('voiceschanged', voicesChanged); };
  pending = setTimeout(speak, chooseExaminerVoice(synthesis.getVoices()) ? 0 : 1000);
}

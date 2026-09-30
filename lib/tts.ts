export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

/** Speaks `text` in the given BCP-47 locale. Returns false if TTS is unavailable. */
export function speak(text: string, locale: string): boolean {
  if (!isTtsSupported()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
    utterance.lang = locale;
    const lang = locale.toLowerCase();
    const voices = synth.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === lang) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(lang.split("-")[0]));
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9;
    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

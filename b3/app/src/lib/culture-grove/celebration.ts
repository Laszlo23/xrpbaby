import confetti from "canvas-confetti";

import { ipfsToHttp } from "@/lib/ipfs-gateway";
import { TWIN_BLOOM_AUDIO_CID } from "@/lib/culture-grove/types";

const CELEBRATED_KEY = "grove-twin-bloom-celebrated";
const MUTE_KEY = "grove-twin-bloom-audio-muted";

export function isTwinBloomCelebrated(): boolean {
  try {
    return localStorage.getItem(CELEBRATED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markTwinBloomCelebrated(): void {
  try {
    localStorage.setItem(CELEBRATED_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function isTwinBloomAudioMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setTwinBloomAudioMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function twinBloomAudioUrl(): string {
  return (
    ipfsToHttp(`ipfs://${TWIN_BLOOM_AUDIO_CID}`) ?? `https://ipfs.io/ipfs/${TWIN_BLOOM_AUDIO_CID}`
  );
}

export function fireTwinBloomConfetti(): void {
  const burst = (particleRatio: number, opts: confetti.Options) => {
    void confetti({
      ...opts,
      origin: { y: 0.65 },
      particleCount: Math.floor(200 * particleRatio),
    });
  };

  burst(0.25, { spread: 26, startVelocity: 55, colors: ["#C5FF41", "#a78bfa", "#ffffff"] });
  burst(0.2, { spread: 60, colors: ["#C5FF41", "#8b5cf6"] });
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#C5FF41", "#34d399"] });
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  burst(0.1, { spread: 120, startVelocity: 45 });
}

export function playTwinBloomAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined" || isTwinBloomAudioMuted()) return null;
  const audio = new Audio(twinBloomAudioUrl());
  audio.volume = 0.85;
  void audio.play().catch(() => undefined);
  return audio;
}

export function celebrateTwinBloomUnlock(): void {
  if (isTwinBloomCelebrated()) return;
  markTwinBloomCelebrated();
  fireTwinBloomConfetti();
  playTwinBloomAudio();
}

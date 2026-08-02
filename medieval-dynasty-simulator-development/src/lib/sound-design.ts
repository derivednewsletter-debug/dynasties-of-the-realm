"use client";
import { useEffect, useRef, useCallback } from "react";

type Season = "Spring" | "Summer" | "Autumn" | "Winter";
type SoundEvent = "click" | "build" | "event" | "crisis" | "battle" | "rankUp" | "death" | "marriage" | "raid" | "seasonChange" | "toast";

// Single shared AudioContext (lazy init)
let _ctx: AudioContext | null = null;
function ctx(): AudioContext {
  if (!_ctx) _ctx = new AudioContext();
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

// Simple oscillator-based sound effects — no external files needed
function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08, detune = 0) {
  try {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch { /* audio not available */ }
}

function playChord(freqs: number[], duration: number, type: OscillatorType = "sine", volume = 0.05) {
  for (const f of freqs) playTone(f, duration, type, volume);
}

const SFX: Record<SoundEvent, () => void> = {
  click: () => playTone(800, 0.06, "sine", 0.04),
  build: () => { playTone(220, 0.15, "triangle", 0.07); playTone(330, 0.12, "triangle", 0.05); },
  event: () => playChord([523, 659, 784], 0.3, "sine", 0.05),
  crisis: () => { playTone(80, 0.5, "sawtooth", 0.06); playTone(60, 0.4, "sawtooth", 0.04); },
  battle: () => { playTone(200, 0.2, "square", 0.05); playTone(150, 0.15, "square", 0.04); playTone(100, 0.1, "triangle", 0.06); },
  rankUp: () => { playChord([262, 330, 392, 523], 0.5, "triangle", 0.06); playChord([523, 659], 0.4, "sine", 0.04); },
  death: () => { playTone(180, 0.6, "sine", 0.05); playTone(120, 0.7, "sine", 0.03); },
  marriage: () => { playChord([392, 523, 659], 0.4, "triangle", 0.06); playTone(784, 0.3, "sine", 0.04); },
  raid: () => { playTone(300, 0.1, "square", 0.06); playTone(200, 0.08, "sawtooth", 0.05); playTone(150, 0.06, "square", 0.07); },
  seasonChange: () => { playTone(440, 0.2, "sine", 0.03); playTone(550, 0.15, "sine", 0.02); },
  toast: () => { playTone(660, 0.12, "sine", 0.04); playTone(880, 0.1, "sine", 0.03); },
};

export function useSoundDesign() {
  const ambienceRef = useRef<{ stop: () => void } | null>(null);
  const seasonRef = useRef<Season>("Spring");
  const speedRef = useRef(0);

  const play = useCallback((evt: SoundEvent) => {
    SFX[evt]?.();
  }, []);

  const startAmbience = useCallback((season: Season, speed: number) => {
    seasonRef.current = season;
    speedRef.current = speed;
    if (ambienceRef.current) ambienceRef.current.stop();

    if (speed === 0) return;

    const c = ctx();
    const masterGain = c.createGain();
    masterGain.gain.value = 0.03;

    // Ambient drone based on season
    const droneFreqs: Record<Season, number> = { Spring: 120, Summer: 90, Autumn: 100, Winter: 60 };
    const drone = c.createOscillator();
    drone.type = "sine";
    drone.frequency.value = droneFreqs[season];

    const droneGain = c.createGain();
    droneGain.gain.value = 0.4;

    // Subtle LFO for breathing effect
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.15;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.15;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);

    drone.connect(droneGain);
    droneGain.connect(masterGain);
    masterGain.connect(c.destination);

    drone.start();
    lfo.start();

    ambienceRef.current = {
      stop: () => {
        try { drone.stop(); lfo.stop(); masterGain.disconnect(); } catch {}
      },
    };
  }, []);

  const stopAmbience = useCallback(() => {
    if (ambienceRef.current) { ambienceRef.current.stop(); ambienceRef.current = null; }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (ambienceRef.current) ambienceRef.current.stop(); };
  }, []);

  return { play, startAmbience, stopAmbience };
}

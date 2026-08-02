"use client";

import { useCallback, useState } from "react";
import { MainMenu, type RegionChoice, type BannerChoice, type GenderChoice } from "./main-menu";
import { IntroCinematic } from "./intro-cinematic";
import { GameClient } from "./game-client";
import { EndingScreen, type EndingData } from "./ending-screen";
import { OnboardingGate } from "@/components/onboarding-gate";

type GamePhase = "onboarding" | "menu" | "intro" | "playing" | "ending";

export function GameShell() {
  const [phase, setPhase] = useState<GamePhase>("onboarding");
  const [hasSave, setHasSave] = useState(() => {
    try { return !!localStorage.getItem("dotr-v8"); } catch { return false; }
  });
  const [user, setUser] = useState<{ email?: string } | null>(null);

  // Character creation data
  const [charData, setCharData] = useState<{
    region: RegionChoice;
    gender: GenderChoice;
    firstName: string;
    houseName: string;
    banner: BannerChoice;
    path: string;
  } | null>(null);

  // Ending data
  const [endingData, setEndingData] = useState<EndingData | null>(null);

  // ── Onboarding callbacks ──
  const handleSkipAuth = useCallback(() => {
    setUser(null);
    setPhase("menu");
  }, []);

  const handleStartNew = useCallback((u: { email?: string }) => {
    setUser(u);
    setPhase("menu");
  }, []);

  const handleContinueFromCloud = useCallback((u: { email?: string }, _save: unknown) => {
    setUser(u);
    // GameClient auto-loads from localStorage on mount — just jump to playing
    setPhase("playing");
  }, []);

  // Menu → Creation → Intro → Playing
  const handleCreate = useCallback(async (data: {
    region: RegionChoice; gender: GenderChoice;
    firstName: string; houseName: string; banner: BannerChoice; path: string;
  }) => {
    setCharData(data);
    // Save initial empty world to cloud so account is "claimed"
    if (user) {
      try {
        await fetch("/api/game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slot: "autosave",
            houseName: data.houseName,
            rulerName: `${data.firstName} ${data.houseName}`,
            state: { claimed: true, houseName: data.houseName, createdAt: new Date().toISOString() },
          }),
        });
      } catch { /* offline — proceed anyway */ }
    }
    setPhase("intro");
  }, [user]);

  const handleIntroDone = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleEnding = useCallback((data: EndingData) => {
    setEndingData(data);
    setPhase("ending");
  }, []);

  const handleRestart = useCallback(() => {
    try { localStorage.removeItem("dotr-v8"); } catch { /* ignore */ }
    setPhase("onboarding");
    setCharData(null);
    setEndingData(null);
    setHasSave(false);

  }, []);

  const handleContinue = useCallback(() => {
    setPhase("playing");
  }, []);

  // ── Onboarding phase ──
  if (phase === "onboarding") {
    return (
      <OnboardingGate
        onStartNew={handleStartNew}
        onContinue={handleContinueFromCloud}
        onSkipAuth={handleSkipAuth}
      />
    );
  }

  if (phase === "menu") {
    return (
      <MainMenu
        onCreate={handleCreate}
        onContinue={handleContinue}
        hasSave={hasSave}
        isAuthed={!!user}
      />
    );
  }

  if (phase === "intro" && charData) {
    return (
      <IntroCinematic
        houseName={charData.houseName}
        firstName={charData.firstName}
        banner={charData.banner}
        onDone={handleIntroDone}
      />
    );
  }

  if (phase === "ending" && endingData) {
    return (
      <EndingScreen
        data={endingData}
        onRestart={handleRestart}
      />
    );
  }

  // Playing phase
  return (
    <GameClient
      charData={charData ?? undefined}
      onEnding={handleEnding}
      onSave={() => setHasSave(true)}
    />
  );
}

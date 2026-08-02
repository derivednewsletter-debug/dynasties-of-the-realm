"use client";

import { useCallback, useState } from "react";
import { MainMenu, type RegionChoice, type BannerChoice, type GenderChoice } from "./main-menu";
import { IntroCinematic } from "./intro-cinematic";
import { GameClient } from "./game-client";
import { EndingScreen, type EndingData } from "./ending-screen";

type GamePhase = "menu" | "intro" | "playing" | "ending";

export function GameShell() {
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [hasSave, setHasSave] = useState(() => {
    try { return !!localStorage.getItem("dotr-v8"); } catch { return false; }
  });

  // Character creation data
  const [charData, setCharData] = useState<{
    region: RegionChoice;
    gender: GenderChoice;
    firstName: string;
    houseName: string;
    banner: BannerChoice;
  } | null>(null);

  // Ending data
  const [endingData, setEndingData] = useState<EndingData | null>(null);

  // Menu → Creation → Intro → Playing
  const handleCreate = useCallback((data: {
    region: RegionChoice; gender: GenderChoice;
    firstName: string; houseName: string; banner: BannerChoice;
  }) => {
    setCharData(data);
    setPhase("intro");
  }, []);

  const handleIntroDone = useCallback(() => {
    setPhase("playing");
  }, []);

  const handleEnding = useCallback((data: EndingData) => {
    setEndingData(data);
    setPhase("ending");
  }, []);

  const handleRestart = useCallback(() => {
    // Clear localStorage for fresh start
    try { localStorage.removeItem("dotr-v8"); } catch { /* ignore */ }
    setPhase("menu");
    setCharData(null);
    setEndingData(null);
    setHasSave(false);
  }, []);

  const handleContinue = useCallback(() => {
    setPhase("playing");
  }, []);

  if (phase === "menu") {
    return (
      <MainMenu
        onCreate={handleCreate}
        onContinue={handleContinue}
        hasSave={hasSave}
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

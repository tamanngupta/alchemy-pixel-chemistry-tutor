import { useEffect, useState } from "react";
import wizard from "@/assets/wizard.png";
import spellAsset from "@/assets/spell.png.asset.json";

export function WizardIntro() {
  const [phase, setPhase] = useState<"walk" | "cast" | "blast" | "done">("walk");

  useEffect(() => {
    if (sessionStorage.getItem("alchemy-intro-played")) {
      setPhase("done");
      return;
    }
    const t1 = setTimeout(() => setPhase("cast"), 2200);
    const t2 = setTimeout(() => setPhase("blast"), 2900);
    const t3 = setTimeout(() => {
      setPhase("done");
      sessionStorage.setItem("alchemy-intro-played", "1");
    }, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-deep scanlines"
      style={{ animation: phase === "blast" ? "cover-fade 1.3s ease-out forwards" : undefined }}
    >
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div
        className="absolute bottom-12 left-0"
        style={{
          animation:
            phase === "walk"
              ? "wizard-walk 2.2s steps(8, end) forwards"
              : "wizard-cast 0.7s ease-in-out forwards",
        }}
      >
        <img
          src={wizard}
          alt="Pixel wizard"
          width={260}
          height={260}
          style={{ imageRendering: "pixelated", filter: "drop-shadow(0 0 20px oklch(0.78 0.2 200))" }}
        />
      </div>
      {phase !== "walk" && (
        <img
          src={spellAsset.url}
          alt="Pixel spell blast"
          className="absolute bottom-44 left-1/2 -translate-x-1/2 h-24 w-24"
          style={{
            imageRendering: "pixelated",
            animation: "blast-grow 1.3s cubic-bezier(.6,.2,.8,1) forwards",
            filter: "drop-shadow(0 0 30px var(--color-neon))",
          }}
        />
      )}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-neon text-glow flicker">
        SUMMONING ALCHEMY...
      </div>
    </div>
  );
}

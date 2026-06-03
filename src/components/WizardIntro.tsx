import { useEffect, useState } from "react";
import wizard from "@/assets/wizard.png";
import spellAsset from "@/assets/spell.png.asset.json";

export function WizardIntro() {
  const [phase, setPhase] = useState<"walk" | "cast" | "blast" | "done">("walk");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("cast"), 2200);
    const t2 = setTimeout(() => setPhase("blast"), 3000);
    const t3 = setTimeout(() => setPhase("done"), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-deep scanlines"
      style={{ animation: phase === "blast" ? "cover-fade 2s ease-out forwards" : undefined }}
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
          width={160}
          height={160}
          className="absolute"
          style={{
            bottom: "11rem",
            left: "50%",
            imageRendering: "pixelated",
            animation: "blast-grow 2s cubic-bezier(.6,.2,.8,1) forwards",
            filter: "drop-shadow(0 0 40px var(--color-neon)) drop-shadow(0 0 80px var(--color-neon))",
          }}
        />
      )}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-pixel text-xs text-neon text-glow flicker">
        SUMMONING ALCHEMY...
      </div>
    </div>
  );
}

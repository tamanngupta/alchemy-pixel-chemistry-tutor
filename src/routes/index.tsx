import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WizardIntro } from "@/components/WizardIntro";
import { TestTube } from "@/components/TestTube";
import lab from "@/assets/lab.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alchemy — Learn the WHY of Carbonyl Chemistry" },
      { name: "description", content: "Retro pixel chemistry adventure. Socratic learning for kids — master carbonyl chemistry by understanding, not memorising." },
      { property: "og:title", content: "Alchemy — Learn the WHY of Carbonyl Chemistry" },
      { property: "og:description", content: "Socratic, interactive chemistry for curious minds." },
    ],
  }),
  component: Landing,
});

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return y;
}

const FEATURES = [
  { icon: "?", title: "Socratic Method", body: "We ask, you discover. Build intuition through guided questions instead of rote answers." },
  { icon: "⚗", title: "Learn the WHY", body: "Stop memorising mechanisms. See why each electron moves, why each step happens." },
  { icon: "▶", title: "Actively Engage", body: "Drag, click, react. No boring textbooks — chemistry you play with, not read about." },
  { icon: "✦", title: "Carbonyl Mastery", body: "Aldehydes, ketones, esters, enolates. Mechanism intuition that actually sticks." },
  { icon: "♪", title: "Zero Strict Teachers", body: "Learn at your own pace from home. No judgement, just curiosity rewarded." },
];

function Landing() {
  const y = useScrollY();

  return (
    <>
      <WizardIntro />
      <div className="min-h-screen bg-background text-foreground">
        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b-4 border-border bg-deep/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/" className="font-pixel text-sm text-neon text-glow">◆ ALCHEMY</Link>
            <div className="flex items-center gap-3">
              <Link to="/auth" className="font-pixel text-[10px] text-foreground hover:text-neon">SIGN IN</Link>
              <Link
                to="/auth"
                className="pixel-border-neon bg-primary px-4 py-2 font-pixel text-[10px] text-primary-foreground transition-transform hover:-translate-y-0.5"
              >
                GET STARTED
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO with parallax */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pt-24">
          <div
            className="absolute inset-0 grid-bg opacity-30"
            style={{ transform: `translateY(${y * 0.3}px)` }}
          />
          <div
            className="absolute inset-x-0 top-0 -z-0 h-full opacity-25"
            style={{
              backgroundImage: `url(${lab})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translateY(${y * 0.5}px) scale(1.1)`,
              imageRendering: "pixelated",
              filter: "hue-rotate(-20deg) saturate(1.2)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

          <div className="relative z-10 mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-block pixel-border bg-card px-4 py-2 font-pixel text-[10px] text-neon">
              ▸ LVL 1 · CARBONYL CHEMISTRY
            </div>
            <h1 className="flex flex-wrap items-center justify-center gap-4 font-pixel text-5xl text-foreground text-glow md:text-7xl">
              <span>ALCHEMY</span>
              <TestTube size={90} />
            </h1>
            <p className="mx-auto mt-8 max-w-2xl font-body text-2xl leading-snug text-muted-foreground">
              Skip the boring test tubes. Master carbonyl chemistry the SOCRATIC way —
              learn the <span className="text-neon">WHY</span>, not the what.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/auth"
                className="pixel-border-neon bg-primary px-8 py-4 font-pixel text-sm text-primary-foreground transition-transform hover:-translate-y-1"
              >
                ▶ GET STARTED
              </Link>
              <a
                href="#features"
                className="pixel-border bg-card px-8 py-4 font-pixel text-sm text-foreground transition-transform hover:-translate-y-1"
              >
                ? LEARN MORE
              </a>
            </div>
            <div className="mt-16 font-pixel text-[10px] text-muted-foreground flicker">
              ▼ SCROLL TO CONTINUE ▼
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="relative px-6 py-32">
          <div
            className="absolute inset-0 -z-10 opacity-20 grid-bg"
            style={{ transform: `translateY(${(y - 600) * 0.2}px)` }}
          />
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="mb-4 inline-block font-pixel text-[10px] text-neon">// PLAYER PERKS</div>
              <h2 className="font-pixel text-3xl text-foreground md:text-5xl">WHY ALCHEMY?</h2>
              <p className="mx-auto mt-6 max-w-2xl font-body text-xl text-muted-foreground">
                Five power-ups that turn chemistry from a chore into a quest.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-6">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`pixel-border group relative bg-card p-6 transition-transform hover:-translate-y-2 lg:col-span-2 ${
                    i === 3 ? "lg:col-start-2" : ""
                  }`}
                  style={{ transform: `translateY(${Math.max(-40, Math.min(0, (y - 700 - i * 60) * -0.05))}px)` }}
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center bg-secondary font-pixel text-2xl text-neon text-glow">
                    {f.icon}
                  </div>
                  <h3 className="font-pixel text-sm text-foreground">{f.title}</h3>
                  <p className="mt-3 font-body text-lg leading-snug text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="relative overflow-hidden px-6 py-32">
          <div
            className="absolute inset-x-0 top-0 h-full opacity-30"
            style={{
              backgroundImage: `url(${lab})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translateY(${(y - 1400) * 0.3}px)`,
              imageRendering: "pixelated",
            }}
          />
          <div className="absolute inset-0 bg-background/80" />
          <div className="relative mx-auto max-w-5xl">
            <div className="mb-12 text-center font-pixel text-[10px] text-neon">// QUEST LOG</div>
            <h2 className="text-center font-pixel text-3xl text-foreground md:text-5xl">HOW IT WORKS</h2>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                { n: "01", t: "ASK", d: "We pose a tiny question about a mechanism. No answer key — yet." },
                { n: "02", t: "EXPLORE", d: "Drag electrons, build intermediates, watch reactions play out pixel-by-pixel." },
                { n: "03", t: "UNDERSTAND", d: "The WHY clicks. You explain it back. The mechanism is yours forever." },
              ].map((s) => (
                <div key={s.n} className="pixel-border-neon bg-card p-8 text-center">
                  <div className="font-pixel text-4xl text-neon text-glow">{s.n}</div>
                  <h3 className="mt-4 font-pixel text-lg text-foreground">{s.t}</h3>
                  <p className="mt-4 font-body text-lg text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-32">
          <div className="mx-auto max-w-3xl pixel-border-neon bg-card p-12 text-center">
            <TestTube size={80} />
            <h2 className="mt-6 font-pixel text-2xl text-foreground md:text-4xl">READY PLAYER ONE?</h2>
            <p className="mx-auto mt-6 max-w-xl font-body text-xl text-muted-foreground">
              Join the lab. Cast your first spell. Learn carbonyl chemistry the way it should be taught.
            </p>
            <Link
              to="/auth"
              className="mt-8 inline-block pixel-border bg-primary px-10 py-4 font-pixel text-sm text-primary-foreground transition-transform hover:-translate-y-1"
            >
              ▶ START QUEST
            </Link>
          </div>
        </section>

        <footer className="border-t-4 border-border bg-deep px-6 py-8 text-center font-pixel text-[10px] text-muted-foreground">
          © {new Date().getFullYear()} ALCHEMY · PRESS START TO LEARN
        </footer>
      </div>
    </>
  );
}

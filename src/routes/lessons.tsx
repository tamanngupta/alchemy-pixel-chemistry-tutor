import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TestTube } from "@/components/TestTube";
import wizard from "@/assets/wizard.png";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Quest Map · Alchemy" },
      { name: "description", content: "Your carbonyl chemistry quest map. 6 lessons of socratic learning." },
    ],
  }),
  component: LessonsPage,
});

type Lesson = {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
};

const LESSONS: Lesson[] = [
  { id: 1, title: "THE C=O BOND",        subtitle: "Why carbonyls pull electrons",       icon: "⚗" },
  { id: 2, title: "ALDEHYDE vs KETONE",  subtitle: "Spot the reactive cousin",           icon: "✦" },
  { id: 3, title: "NUCLEOPHILIC ATTACK", subtitle: "Where the arrows REALLY go",         icon: "➶" },
  { id: 4, title: "ACETALS & HEMIS",     subtitle: "Protect, react, unmask",             icon: "◈" },
  { id: 5, title: "IMINES & ENAMINES",   subtitle: "Nitrogen joins the dance",           icon: "♆" },
  { id: 6, title: "ALDOL BOSS BATTLE",   subtitle: "Forge a C-C bond. Final spell.",     icon: "♛" },
];

function LessonsPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [wizardName, setWizardName] = useState<string>("WIZARD");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (!session?.user) {
        navigate({ to: "/auth" });
        return;
      }
      setUserId(session.user.id);
      setWizardName(
        (session.user.user_metadata?.wizard_name as string) ||
          session.user.email?.split("@")[0]?.toUpperCase() ||
          "WIZARD",
      );
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) navigate({ to: "/auth" });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) toast.error("Couldn't load progress");
        else setCompleted(new Set((data ?? []).map((r) => r.lesson_id as number)));
        setLoading(false);
      });
  }, [userId]);

  const currentId = LESSONS.find((l) => !completed.has(l.id))?.id ?? null;

  async function completeLesson(id: number) {
    if (!userId) return;
    setCompleted((prev) => new Set(prev).add(id));
    const { error } = await supabase
      .from("lesson_progress")
      .upsert({ user_id: userId, lesson_id: id }, { onConflict: "user_id,lesson_id" });
    if (error) toast.error(error.message);
    else toast.success(`Lesson ${id} sealed in the grimoire ✦`);
  }

  async function resetProgress() {
    if (!userId) return;
    await supabase.from("lesson_progress").delete().eq("user_id", userId);
    setCompleted(new Set());
    toast.success("Quest reset. Begin again, wizard.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const totalDone = completed.size;
  const pct = Math.round((totalDone / LESSONS.length) * 100);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 pb-32 pt-6">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* HUD */}
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between border-b-4 border-border bg-deep/80 px-4 py-3 pixel-border-neon">
        <Link to="/" className="font-pixel text-[10px] text-neon text-glow">◆ ALCHEMY</Link>
        <div className="flex items-center gap-4 font-pixel text-[10px]">
          <span className="text-neon">⚡ {totalDone}/{LESSONS.length}</span>
          <span className="text-foreground">★ {totalDone * 50}</span>
          <button onClick={signOut} className="text-muted-foreground hover:text-neon">LOGOUT</button>
        </div>
      </header>

      {/* Quest banner */}
      <section className="relative z-10 mx-auto mt-6 max-w-3xl pixel-border-neon bg-card p-5">
        <div className="font-pixel text-[10px] text-neon">// SECTION 1 · CARBONYL CHEMISTRY</div>
        <h1 className="mt-2 font-pixel text-xl text-foreground text-glow md:text-2xl">
          WELCOME BACK, {wizardName.toUpperCase()}
        </h1>
        <p className="mt-3 font-body text-lg text-muted-foreground">
          Six trials stand between you and mastery of the C=O. Cast wisely.
        </p>
        <div className="mt-4 h-3 w-full border-2 border-border bg-deep">
          <div
            className="h-full bg-neon transition-all"
            style={{ width: `${pct}%`, boxShadow: "0 0 12px var(--color-neon)" }}
          />
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative z-10 mx-auto mt-12 max-w-md">
        <div className="relative">
          {LESSONS.map((lesson, i) => {
            const isDone = completed.has(lesson.id);
            const isCurrent = lesson.id === currentId;
            const isLocked = !isDone && !isCurrent;
            // zig-zag offsets
            const offsets = [0, 90, 130, 90, 0, -90];
            const offset = offsets[i % offsets.length];

            return (
              <div key={lesson.id} className="relative flex flex-col items-center">
                {/* dotted path */}
                {i > 0 && (
                  <div
                    className="h-10 w-1"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, var(--color-neon) 0 4px, transparent 4px 10px)",
                      opacity: isLocked ? 0.3 : 0.8,
                    }}
                  />
                )}
                <div style={{ transform: `translateX(${offset}px)` }} className="my-2">
                  <LessonNode
                    lesson={lesson}
                    state={isDone ? "done" : isCurrent ? "current" : "locked"}
                    onClick={() => !isLocked && !loading && completeLesson(lesson.id)}
                  />
                  {/* wizard sits next to current node */}
                  {isCurrent && (
                    <img
                      src={wizard}
                      alt="Your wizard"
                      width={70}
                      height={70}
                      className="absolute -right-20 top-0"
                      style={{
                        imageRendering: "pixelated",
                        filter: "drop-shadow(0 0 14px var(--color-neon))",
                        animation: "float-y 2.4s ease-in-out infinite",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Treasure */}
          <div className="mt-10 flex flex-col items-center">
            <div
              className="h-10 w-1"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, var(--color-neon) 0 4px, transparent 4px 10px)",
                opacity: totalDone === LESSONS.length ? 1 : 0.3,
              }}
            />
            <div
              className={`mt-2 pixel-border bg-card p-6 text-center ${
                totalDone === LESSONS.length ? "pixel-border-neon" : ""
              }`}
              style={{ opacity: totalDone === LESSONS.length ? 1 : 0.6 }}
            >
              <div className="font-pixel text-4xl text-neon text-glow">⛃</div>
              <div className="mt-2 font-pixel text-[10px] text-foreground">
                {totalDone === LESSONS.length ? "GRIMOIRE UNLOCKED" : "SEALED CHEST"}
              </div>
              <div className="mt-2 font-body text-sm text-muted-foreground">
                Complete all 6 trials to claim
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <TestTube size={70} />
          <div className="mt-2">
            <button
              onClick={resetProgress}
              className="font-pixel text-[9px] text-muted-foreground hover:text-neon"
            >
              ⟲ RESET QUEST
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LessonNode({
  lesson,
  state,
  onClick,
}: {
  lesson: Lesson;
  state: "done" | "current" | "locked";
  onClick: () => void;
}) {
  const isLocked = state === "locked";
  const isCurrent = state === "current";
  const isDone = state === "done";

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="group flex flex-col items-center disabled:cursor-not-allowed"
    >
      <div
        className={`relative flex h-20 w-20 items-center justify-center font-pixel text-3xl transition-transform ${
          isLocked ? "" : "group-hover:-translate-y-1"
        }`}
        style={{
          background: isDone
            ? "var(--color-neon)"
            : isCurrent
              ? "var(--color-primary)"
              : "var(--color-muted)",
          color: isDone
            ? "var(--color-deep)"
            : isCurrent
              ? "var(--color-primary-foreground)"
              : "var(--color-muted-foreground)",
          boxShadow: isCurrent
            ? "0 -4px 0 0 var(--color-neon), 0 4px 0 0 var(--color-neon), -4px 0 0 0 var(--color-neon), 4px 0 0 0 var(--color-neon), 0 0 32px var(--color-neon), 0 8px 0 0 oklch(0.12 0.05 265)"
            : isDone
              ? "0 -4px 0 0 var(--color-border), 0 4px 0 0 var(--color-border), -4px 0 0 0 var(--color-border), 4px 0 0 0 var(--color-border), 0 8px 0 0 oklch(0.12 0.05 265)"
              : "0 -4px 0 0 var(--color-border), 0 4px 0 0 var(--color-border), -4px 0 0 0 var(--color-border), 4px 0 0 0 var(--color-border)",
          animation: isCurrent ? "float-y 2s ease-in-out infinite" : undefined,
          imageRendering: "pixelated",
          opacity: isLocked ? 0.55 : 1,
        }}
      >
        {isLocked ? "🔒" : isDone ? "✓" : lesson.icon}
        {isCurrent && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-deep px-2 py-1 font-pixel text-[9px] text-neon text-glow flicker">
            START
          </span>
        )}
      </div>
      <div className="mt-3 max-w-[200px] text-center">
        <div
          className={`font-pixel text-[10px] ${
            isLocked ? "text-muted-foreground" : "text-foreground"
          } ${isCurrent ? "text-glow text-neon" : ""}`}
        >
          {String(lesson.id).padStart(2, "0")} · {lesson.title}
        </div>
        <div className="mt-1 font-body text-sm text-muted-foreground">{lesson.subtitle}</div>
      </div>
    </button>
  );
}

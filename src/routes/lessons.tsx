import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import wizard from "@/assets/wizard.png";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons")({
  head: () => ({
    meta: [
      { title: "Quest Map · Alchemy" },
      { name: "description", content: "Your carbonyl chemistry quest map. 7 lessons of socratic learning." },
    ],
  }),
  component: LessonsPage,
});

type Lesson = {
  id: number;
  title: string;
  icon: string;
};

const LESSONS: Lesson[] = [
  { id: 1, title: "CARBON GETS A DOUBLE DATE",   icon: "⚗" },
  { id: 2, title: "THE ATTACK",                  icon: "➶" },
  { id: 3, title: "MORE NUCLEOPHILES",           icon: "✦" },
  { id: 4, title: "WHEN ADDITION CHANGES JOB",   icon: "◈" },
  { id: 5, title: "THE REDUCTION MANUAL",        icon: "♆" },
  { id: 6, title: "SOMEONE HAD TO GO",           icon: "☣" },
  { id: 7, title: "THE ENOLATE FILES",           icon: "♛" },
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
    <div className="relative min-h-screen overflow-hidden bg-background px-4 pb-32 pt-6">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* HUD */}
      <header className="relative z-10 mx-auto flex max-w-md items-center justify-between px-1 py-2">
        <Link to="/" className="font-pixel text-[10px] text-foreground hover:text-neon">◆ ALCHEMY</Link>
        <div className="flex items-center gap-3 font-pixel text-[9px]">
          <span className="text-neon">⚡ {totalDone}/{LESSONS.length}</span>
          <span className="text-foreground">★ {totalDone * 50}</span>
          <button onClick={signOut} className="pixel-border-neon bg-card px-2 py-1 text-neon hover:-translate-y-0.5 transition-transform">LOGOUT</button>
        </div>
      </header>

      {/* Quest banner */}
      <section className="relative z-10 mx-auto mt-4 max-w-md pixel-border-neon bg-card/90 p-5">
        <div className="inline-block bg-neon px-2 py-1 font-pixel text-[9px] text-deep">ACTIVE_MISSION</div>
        <h1 className="mt-3 font-pixel text-lg text-foreground text-glow leading-tight">
          UNIT 1:<br />FOUNDATIONS
        </h1>
        <p className="mt-3 font-body text-base text-muted-foreground">
          &gt; Welcome back, {wizardName.toUpperCase()}. Carbonyls &amp; Nucleophilic Addition await.
        </p>
        <div className="mt-4 flex gap-1">
          {LESSONS.map((l) => (
            <div
              key={l.id}
              className="h-2 flex-1 border-2 border-border"
              style={{
                background: completed.has(l.id) ? "var(--color-neon)" : "var(--color-deep)",
                boxShadow: completed.has(l.id) ? "0 0 8px var(--color-neon)" : undefined,
              }}
            />
          ))}
        </div>
        <div className="mt-2 font-pixel text-[8px] text-muted-foreground">{pct}% COMPLETE</div>
      </section>

      {/* TIMELINE */}
      <section className="relative z-10 mx-auto mt-10 max-w-md">
        {/* curved dashed path (snakes through nodes, stretches to fit) */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 1600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M 200 0
               C 80 120, 320 240, 200 360
               S 80 600, 200 720
               S 320 960, 200 1080
               S 80 1320, 200 1440
               L 200 1600"
            fill="none"
            stroke="var(--color-neon)"
            strokeWidth="3"
            strokeDasharray="8 12"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>

        {/* floating ambient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[12, 38, 65, 88].map((top, i) => (
            <div
              key={i}
              className="absolute h-3 w-3 rounded-full border border-neon/40"
              style={{
                top: `${top}%`,
                left: i % 2 === 0 ? "6%" : "90%",
                opacity: 0.5,
                animation: `float-y ${3 + i}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-14 py-6">
          {LESSONS.map((lesson, i) => {
            const isDone = completed.has(lesson.id);
            const isCurrent = lesson.id === currentId;
            const isLocked = !isDone && !isCurrent;
            // snake offsets — alternating sway to follow the curved path
            const sway = [0, -70, 70, -90, 70, -70, 0];
            const offset = sway[i % sway.length];

            return (
              <div
                key={lesson.id}
                className="relative flex flex-col items-center"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <LessonNode
                  lesson={lesson}
                  state={isDone ? "done" : isCurrent ? "current" : "locked"}
                  onClick={() => !isLocked && !loading && completeLesson(lesson.id)}
                />
                {isCurrent && (
                  <img
                    src={wizard}
                    alt="Your wizard"
                    width={60}
                    height={60}
                    className="absolute -right-16 top-4 hidden sm:block"
                    style={{
                      imageRendering: "pixelated",
                      filter: "drop-shadow(0 0 14px var(--color-neon))",
                      animation: "float-y 2.4s ease-in-out infinite",
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Treasure / boss */}
          <div className="relative flex flex-col items-center">
            <div className="mb-3 font-pixel text-[9px] text-neon flicker">UNIT_BOSS</div>
            <div
              className={`flex h-24 w-24 items-center justify-center font-pixel text-3xl ${
                totalDone === LESSONS.length ? "pixel-border-neon" : ""
              }`}
              style={{
                background: totalDone === LESSONS.length ? "var(--color-primary)" : "transparent",
                color: totalDone === LESSONS.length ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                border: totalDone === LESSONS.length ? undefined : "3px dashed var(--color-border)",
                opacity: totalDone === LESSONS.length ? 1 : 0.5,
              }}
            >
              ⛃
            </div>
            <div className={`mt-3 font-pixel text-[10px] ${totalDone === LESSONS.length ? "text-neon text-glow" : "text-muted-foreground"}`}>
              {totalDone === LESSONS.length ? "GRIMOIRE UNLOCKED" : "UNIT 1 QUIZ"}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={resetProgress}
            className="font-pixel text-[9px] text-muted-foreground hover:text-neon"
          >
            ⟲ RESET QUEST
          </button>
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
      className="group relative z-10 flex flex-col items-center disabled:cursor-not-allowed"
    >
      {isCurrent && (
        <span className="mb-2 bg-neon px-3 py-1 font-pixel text-[9px] text-deep flicker">
          START
        </span>
      )}

      <div className="relative">
        {/* outer dashed ring for current */}
        {isCurrent && (
          <div
            className="absolute inset-0 -m-3 rounded-full"
            style={{
              border: "2px dashed var(--color-neon)",
              animation: "float-y 3s ease-in-out infinite",
            }}
          />
        )}
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full font-pixel text-3xl transition-transform ${
            isLocked ? "" : "group-hover:-translate-y-1"
          }`}
          style={{
            background: isDone
              ? "transparent"
              : isCurrent
                ? "color-mix(in oklab, var(--color-neon) 22%, var(--color-deep))"
                : "color-mix(in oklab, var(--color-muted) 60%, var(--color-deep))",
            color: isDone
              ? "var(--color-neon)"
              : isCurrent
                ? "var(--color-neon)"
                : "var(--color-muted-foreground)",
            border: isDone
              ? "4px solid var(--color-neon)"
              : isCurrent
                ? "4px solid var(--color-neon)"
                : "3px solid var(--color-border)",
            boxShadow: isCurrent
              ? "0 0 28px var(--color-neon), inset 0 0 18px color-mix(in oklab, var(--color-neon) 40%, transparent)"
              : isDone
                ? "0 0 18px color-mix(in oklab, var(--color-neon) 60%, transparent)"
                : "none",
            opacity: isLocked ? 0.45 : 1,
          }}
        >
          {isLocked ? lesson.icon : isDone ? "✓" : lesson.icon}
        </div>

        {/* done badge */}
        {isDone && (
          <div
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full font-pixel text-[10px]"
            style={{
              background: "var(--color-neon)",
              color: "var(--color-deep)",
              border: "2px solid var(--color-deep)",
            }}
          >
            ✓
          </div>
        )}
      </div>

      <div className="mt-4 max-w-[220px] text-center">
        <div
          className={`font-pixel text-[10px] leading-tight ${
            isCurrent ? "text-neon text-glow" : isDone ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {lesson.title}
        </div>
        <div className="mt-1 font-pixel text-[8px] text-muted-foreground">
          {isDone ? "100% COMPLETE" : isCurrent ? `MODULE 0${lesson.id}_READY` : `MODULE 0${lesson.id}_LOCKED`}
        </div>
      </div>
    </button>
  );
}

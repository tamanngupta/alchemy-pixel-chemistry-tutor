import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import wizard from "@/assets/wizard.png";
import { toast } from "sonner";
import { LESSONS } from "./lessons";

export const Route = createFileRoute("/lessons/$lessonId")({
  head: ({ params }) => ({
    meta: [{ title: `Lesson ${params.lessonId} · Alchemy` }],
  }),
  component: LessonViewer,
});

function LessonViewer() {
  const { lessonId } = Route.useParams();
  const navigate = useNavigate();
  const id = parseInt(lessonId, 10);
  const lesson = LESSONS.find((l) => l.id === id);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const [popup, setPopup] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate({ to: "/auth" }); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  // Inject highlight listener into iframe once it loads
  function attachIframeListeners() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      const onMouseUp = () => {
        const sel = win.getSelection();
        const text = sel?.toString().trim() ?? "";
        if (!text || text.length < 3) { setPopup(null); return; }
        const range = sel?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        if (!rect) return;
        const iframeRect = iframe.getBoundingClientRect();
        setPopup({
          x: iframeRect.left + rect.left + rect.width / 2,
          y: iframeRect.top + rect.top - 10,
          text,
        });
      };
      const onScrollOrDown = () => setPopup(null);
      doc.addEventListener("mouseup", onMouseUp);
      doc.addEventListener("mousedown", onScrollOrDown);
      win.addEventListener("scroll", onScrollOrDown);
    } catch (e) {
      console.warn("Could not attach iframe listeners", e);
    }
  }

  async function saveHighlight() {
    if (!popup || !userId) return;
    const { error } = await supabase.from("notebook").insert({
      user_id: userId,
      lesson_number: id,
      highlighted_text: popup.text,
    });
    if (error) toast.error(error.message);
    else toast.success("✦ Sealed in your notebook");
    setPopup(null);
  }

  async function markComplete() {
    if (!userId || completed) { setShowCongrats(true); return; }
    const { error } = await supabase
      .from("user_progress")
      .upsert({ user_id: userId, lesson_number: id }, { onConflict: "user_id,lesson_number" });
    if (error) { toast.error(error.message); return; }
    setCompleted(true);
    setShowCongrats(true);
  }

  function goNext() {
    const next = LESSONS.find((l) => l.id === id + 1);
    if (next) navigate({ to: "/lessons/$lessonId", params: { lessonId: String(next.id) } });
    else navigate({ to: "/lessons" });
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-pixel text-neon">LESSON NOT FOUND</h1>
          <Link to="/lessons" className="mt-4 inline-block font-pixel text-[10px] text-foreground">← BACK TO MAP</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-card/95 px-4 py-3 pixel-border-neon">
        <Link to="/lessons" className="font-pixel text-[10px] text-foreground hover:text-neon">← QUEST MAP</Link>
        <div className="font-pixel text-[10px] text-neon text-glow truncate">
          MODULE 0{id}: {lesson.title}
        </div>
        <button
          onClick={markComplete}
          className="pixel-border-neon bg-neon px-3 py-1 font-pixel text-[9px] text-deep hover:-translate-y-0.5 transition-transform"
        >
          ✓ COMPLETE
        </button>
      </header>

      <div className="relative" style={{ height: "calc(100vh - 56px)" }}>
        <iframe
          ref={iframeRef}
          src={`/lessons/lesson${id}.html`}
          title={lesson.title}
          className="h-full w-full border-0"
          onLoad={attachIframeListeners}
        />

        {popup && (
          <div
            className="fixed z-40 -translate-x-1/2 -translate-y-full"
            style={{ left: popup.x, top: popup.y }}
          >
            <button
              onClick={saveHighlight}
              className="pixel-border-neon bg-card px-3 py-2 font-pixel text-[9px] text-neon hover:bg-neon hover:text-deep transition-colors whitespace-nowrap"
            >
              ✎ SAVE TO NOTEBOOK
            </button>
          </div>
        )}
      </div>

      {showCongrats && (
        <CongratsOverlay
          lessonTitle={lesson.title}
          lessonId={id}
          onNext={goNext}
          onMap={() => navigate({ to: "/lessons" })}
          hasNext={!!LESSONS.find((l) => l.id === id + 1)}
        />
      )}
    </div>
  );
}

function CongratsOverlay({ lessonTitle, lessonId, onNext, onMap, hasNext }: {
  lessonTitle: string;
  lessonId: number;
  onNext: () => void;
  onMap: () => void;
  hasNext: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-4 backdrop-blur-sm">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full pixel-border-neon bg-card p-8 text-center">
        <div className="inline-block bg-neon px-3 py-1 font-pixel text-[9px] text-deep mb-4 flicker">
          MODULE 0{lessonId} CLEARED
        </div>

        <img
          src={wizard}
          alt="Dancing wizard"
          width={120}
          height={120}
          className="mx-auto"
          style={{
            imageRendering: "pixelated",
            filter: "drop-shadow(0 0 24px var(--color-neon))",
            animation: "wizard-dance 0.6s ease-in-out infinite",
          }}
        />

        <h1 className="mt-4 font-pixel text-2xl text-neon text-glow leading-tight">
          ✦ VICTORY ✦
        </h1>
        <p className="mt-3 font-body text-xl text-foreground">
          &gt; You conquered:
        </p>
        <p className="mt-2 font-pixel text-[12px] text-neon">
          {lessonTitle}
        </p>
        <p className="mt-4 font-body text-base text-muted-foreground">
          +50 XP &nbsp;·&nbsp; The grimoire grows stronger.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {hasNext && (
            <button
              onClick={onNext}
              className="pixel-border-neon bg-neon px-4 py-3 font-pixel text-[10px] text-deep hover:-translate-y-0.5 transition-transform"
            >
              NEXT LESSON →
            </button>
          )}
          <button
            onClick={onMap}
            className="pixel-border bg-card px-4 py-3 font-pixel text-[10px] text-foreground hover:text-neon hover:-translate-y-0.5 transition-transform"
          >
            ← BACK TO QUEST MAP
          </button>
        </div>
      </div>

      <style>{`
        @keyframes wizard-dance {
          0%, 100% { transform: translateY(0) rotate(-6deg) scale(1); }
          25%      { transform: translateY(-10px) rotate(6deg) scale(1.05); }
          50%      { transform: translateY(0) rotate(-6deg) scale(1); }
          75%      { transform: translateY(-10px) rotate(6deg) scale(1.05); }
        }
      `}</style>
    </div>
  );
}

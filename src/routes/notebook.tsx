import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LESSONS } from "./lessons";

export const Route = createFileRoute("/notebook")({
  head: () => ({
    meta: [
      { title: "Notebook · Alchemy" },
      { name: "description", content: "Your saved highlights from the carbonyl grimoire." },
    ],
  }),
  component: NotebookPage,
});

type Entry = {
  id: string;
  lesson_number: number;
  highlighted_text: string;
  saved_at: string;
};

function NotebookPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { navigate({ to: "/auth" }); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("notebook")
      .select("id, lesson_number, highlighted_text, saved_at")
      .eq("user_id", userId)
      .order("lesson_number", { ascending: true })
      .order("saved_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) toast.error("Couldn't load notebook");
        else setEntries((data ?? []) as Entry[]);
        setLoading(false);
      });
  }, [userId]);

  async function deleteEntry(id: string) {
    const prev = entries;
    setEntries((e) => e.filter((x) => x.id !== id));
    const { error } = await supabase.from("notebook").delete().eq("id", id);
    if (error) { toast.error(error.message); setEntries(prev); }
    else toast.success("Highlight banished.");
  }

  const grouped = LESSONS.map((l) => ({
    lesson: l,
    items: entries.filter((e) => e.lesson_number === l.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="relative min-h-screen bg-background px-4 pb-20 pt-6">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <header className="relative z-10 mx-auto flex max-w-2xl items-center justify-between py-2">
        <Link to="/lessons" className="font-pixel text-[10px] text-foreground hover:text-neon">← QUEST MAP</Link>
        <div className="font-pixel text-[10px] text-neon text-glow">✎ THE NOTEBOOK</div>
        <Link to="/" className="font-pixel text-[10px] text-foreground hover:text-neon">◆ HOME</Link>
      </header>

      <section className="relative z-10 mx-auto mt-6 max-w-2xl pixel-border-neon bg-card/90 p-5">
        <div className="inline-block bg-neon px-2 py-1 font-pixel text-[9px] text-deep">GRIMOIRE_FRAGMENTS</div>
        <h1 className="mt-3 font-pixel text-lg text-foreground text-glow leading-tight">YOUR HIGHLIGHTS</h1>
        <p className="mt-2 font-body text-base text-muted-foreground">
          &gt; Wisdom you sealed from the lessons. Tap ✕ to banish.
        </p>
      </section>

      <main className="relative z-10 mx-auto mt-8 max-w-2xl space-y-8">
        {loading && <div className="font-pixel text-[10px] text-muted-foreground text-center">LOADING…</div>}

        {!loading && grouped.length === 0 && (
          <div className="pixel-border bg-card/60 p-8 text-center">
            <div className="font-pixel text-[12px] text-neon mb-2">∅ EMPTY GRIMOIRE</div>
            <p className="font-body text-base text-muted-foreground">
              &gt; Highlight any text in a lesson and tap "Save to Notebook" to begin collecting.
            </p>
            <Link to="/lessons" className="mt-4 inline-block pixel-border-neon bg-neon px-3 py-2 font-pixel text-[9px] text-deep">
              ← BEGIN QUEST
            </Link>
          </div>
        )}

        {grouped.map(({ lesson, items }) => (
          <section key={lesson.id}>
            <div className="flex items-center gap-3 mb-3">
              <span className="font-pixel text-[10px] text-neon">{lesson.icon}</span>
              <h2 className="font-pixel text-[11px] text-foreground text-glow">
                MODULE 0{lesson.id}: {lesson.title}
              </h2>
            </div>
            <ul className="space-y-3">
              {items.map((e) => (
                <li key={e.id} className="pixel-border bg-card/70 p-4 flex items-start gap-3">
                  <span className="font-pixel text-[10px] text-neon mt-1">❝</span>
                  <p className="flex-1 font-body text-lg text-foreground leading-snug">
                    {e.highlighted_text}
                  </p>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    className="font-pixel text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Delete highlight"
                    title="Delete"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}

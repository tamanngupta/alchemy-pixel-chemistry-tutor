import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { TestTube } from "@/components/TestTube";
import wizard from "@/assets/wizard.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In · Alchemy" },
      { name: "description", content: "Enter the Alchemy lab. Sign up or sign in to start your carbonyl chemistry quest." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-6 py-16">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <Link to="/" className="relative z-10 font-pixel text-[10px] text-neon text-glow hover:underline">
        ◀ BACK TO LANDING
      </Link>

      <div className="relative z-10 mx-auto mt-12 grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center gap-4 md:justify-start">
            <img
              src={wizard}
              alt="Alchemy wizard"
              width={140}
              height={140}
              style={{ imageRendering: "pixelated", filter: "drop-shadow(0 0 20px var(--color-neon))", animation: "float-y 3s ease-in-out infinite" }}
            />
            <TestTube size={80} />
          </div>
          <h1 className="mt-6 font-pixel text-3xl text-foreground text-glow md:text-5xl">
            {mode === "signup" ? "JOIN THE LAB" : "WELCOME BACK"}
          </h1>
          <p className="mt-4 font-body text-xl text-muted-foreground">
            {mode === "signup"
              ? "Create your wizard profile and start casting reactions."
              : "Re-enter the lab. Your potions are bubbling."}
          </p>
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="pixel-border-neon bg-card p-8"
        >
          <div className="mb-6 flex">
            {(["signup", "signin"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 border-b-4 py-3 font-pixel text-[10px] transition-colors ${
                  mode === m ? "border-neon text-neon text-glow" : "border-border text-muted-foreground"
                }`}
              >
                {m === "signup" ? "SIGN UP" : "SIGN IN"}
              </button>
            ))}
          </div>

          {mode === "signup" && (
            <Field label="WIZARD NAME" type="text" placeholder="merlin_42" />
          )}
          <Field label="EMAIL" type="email" placeholder="you@alchemy.lab" />
          <Field label="PASSWORD" type="password" placeholder="••••••••" />

          <button
            type="submit"
            className="mt-6 w-full pixel-border bg-primary px-6 py-4 font-pixel text-xs text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            {mode === "signup" ? "▶ CREATE ACCOUNT" : "▶ ENTER LAB"}
          </button>

          <p className="mt-6 text-center font-body text-base text-muted-foreground">
            {mode === "signup" ? "Already a wizard? " : "New here? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-pixel text-[10px] text-neon hover:underline"
            >
              {mode === "signup" ? "SIGN IN" : "SIGN UP"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder }: { label: string; type: string; placeholder: string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block font-pixel text-[10px] text-neon">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border-4 border-border bg-input px-4 py-3 font-body text-xl text-foreground placeholder:text-muted-foreground focus:border-neon focus:outline-none"
      />
    </label>
  );
}

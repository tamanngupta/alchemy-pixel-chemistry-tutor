import testtube from "@/assets/testtube.png";

export function TestTube({ size = 120 }: { size?: number }) {
  return (
    <span className="relative inline-block align-middle" style={{ width: size, height: size * 1.5 }}>
      <img
        src={testtube}
        alt="Bubbling test tube"
        width={size}
        height={size * 1.5}
        style={{ imageRendering: "pixelated", filter: "drop-shadow(0 0 16px var(--color-neon))" }}
      />
      <span className="pointer-events-none absolute inset-0">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="absolute block rounded-full bg-neon/80"
            style={{
              width: 6 + (i % 3) * 3,
              height: 6 + (i % 3) * 3,
              left: `${30 + i * 8}%`,
              bottom: "20%",
              animation: `bubble ${1.6 + i * 0.3}s ease-in ${i * 0.25}s infinite`,
            }}
          />
        ))}
      </span>
    </span>
  );
}

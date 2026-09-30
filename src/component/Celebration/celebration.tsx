import { useEffect, useState, type CSSProperties } from "react";

import type { Holiday } from "@/lib/holidays";

// Nepal flag crimson and blue, gold, and the app green.
const colors = ["#dc143c", "#003893", "#f5b301", "#087b55", "#ff7a59"];
const pieceCount = 120;

// Spread the pieces with fixed maths instead of Math.random so every render
// draws the same confetti.
const pieces = Array.from({ length: pieceCount }, (_, index) => ({
  left: (index * 37) % 100,
  delay: ((index * 53) % 40) / 10,
  duration: 4 + ((index * 29) % 30) / 10,
  size: 6 + (index % 3) * 2,
  color: colors[index % colors.length],
  round: index % 4 === 0,
}));

// Each piece falls twice (see .celebration-piece in index.css).
const confettiDurationMs =
  Math.max(...pieces.map((piece) => piece.delay + piece.duration * 2)) * 1000;

const fadeOutMs = 500;

type CelebrationProps = {
  holiday: Holiday;
};

export default function Celebration({ holiday }: CelebrationProps) {
  const [stage, setStage] = useState<"showing" | "leaving" | "done">("showing");

  useEffect(() => {
    const leaveTimer = setTimeout(() => setStage("leaving"), confettiDurationMs);
    const doneTimer = setTimeout(
      () => setStage("done"),
      confettiDurationMs + fadeOutMs
    );

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (stage === "done") return null;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 overflow-hidden motion-reduce:hidden"
      >
        {pieces.map((piece, index) => (
          <span
            key={index}
            className={`celebration-piece absolute top-0 ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
            style={
              {
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.round ? piece.size : piece.size * 1.6,
                backgroundColor: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              } satisfies CSSProperties
            }
          />
        ))}
      </div>

      {/* Plain text floating above the login card, so removing it never moves the form. */}
      <div
        role="status"
        className={`${stage === "leaving" ? "celebration-text-leave" : "celebration-text"} pointer-events-none fixed inset-x-0 top-4 z-50 px-3 text-center sm:top-8`}
      >
        <p className="text-xl font-extrabold text-[#087948] sm:text-3xl">
          🎉 {holiday.greeting}
        </p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 sm:text-sm">
          {holiday.name}
        </p>
      </div>
    </>
  );
}

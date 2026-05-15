"use client";

import { useEffect, useState } from "react";

type Star = {
  top: number;
  left: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  twinkleDelay: number;
  driftDuration: number;
  driftDelay: number;
  driftLayer: 0 | 1 | 2;
};

const STAR_COUNT = 140;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const r1 = seededRandom(i * 1.3);
    const r2 = seededRandom(i * 2.7);
    const r3 = seededRandom(i * 3.9);
    const r4 = seededRandom(i * 5.1);
    const r5 = seededRandom(i * 7.3);
    const r6 = seededRandom(i * 9.7);
    const r7 = seededRandom(i * 11.1);

    const sizeRoll = r3;
    let size: number;
    if (sizeRoll < 0.7) size = 1;
    else if (sizeRoll < 0.92) size = 2;
    else size = 3;

    const layer: 0 | 1 | 2 = sizeRoll < 0.5 ? 0 : sizeRoll < 0.85 ? 1 : 2;

    stars.push({
      top: r1 * 100,
      left: r2 * 100,
      size,
      opacity: 0.35 + r4 * 0.65,
      twinkleDuration: 2.5 + r5 * 5,
      twinkleDelay: r6 * 6,
      driftDuration: 22 + r7 * 28,
      driftDelay: r5 * 12,
      driftLayer: layer,
    });
  }
  return stars;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(generateStars());
  }, []);

  return (
    <>
      <style jsx global>{`
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--star-opacity-min, 0.25); transform: scale(0.85); }
          50%      { opacity: var(--star-opacity-max, 1);    transform: scale(1.1); }
        }
        @keyframes star-drift-0 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(6px, -4px); }
        }
        @keyframes star-drift-1 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(-8px, 5px); }
        }
        @keyframes star-drift-2 {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(4px, 7px); }
        }
        @keyframes nebula-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-20px, 15px) scale(1.05); }
        }
        .star-wrapper {
          position: absolute;
          will-change: transform;
        }
        .star-dot {
          display: block;
          border-radius: 9999px;
          background: #e8dcc8;
          will-change: opacity, transform;
        }
      `}</style>

      <div
        aria-hidden
        className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(40, 30, 70, 0.4) 0%, rgba(10, 10, 15, 0) 60%), #0a0a0f",
        }}
      >
        {/* Drifting nebula glow for ambient motion */}
        <div
          className="absolute"
          style={{
            top: "-10%",
            left: "20%",
            width: "60vw",
            height: "60vw",
            background:
              "radial-gradient(circle, rgba(80, 50, 130, 0.18) 0%, rgba(80, 50, 130, 0) 60%)",
            filter: "blur(40px)",
            animation: "nebula-float 28s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-15%",
            right: "10%",
            width: "55vw",
            height: "55vw",
            background:
              "radial-gradient(circle, rgba(40, 80, 130, 0.14) 0%, rgba(40, 80, 130, 0) 60%)",
            filter: "blur(40px)",
            animation: "nebula-float 36s ease-in-out 4s infinite reverse",
          }}
        />

        {/* Stars — wrapper handles drift, dot handles twinkle */}
        {stars.map((star, i) => (
          <span
            key={i}
            className="star-wrapper"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              animation: `star-drift-${star.driftLayer} ${star.driftDuration}s ease-in-out ${star.driftDelay}s infinite`,
            }}
          >
            <span
              className="star-dot"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow:
                  star.size > 1
                    ? `0 0 ${star.size * 2}px rgba(232, 220, 200, 0.6)`
                    : "none",
                ["--star-opacity-min" as string]: `${star.opacity * 0.35}`,
                ["--star-opacity-max" as string]: `${star.opacity}`,
                animation: `star-twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`,
              }}
            />
          </span>
        ))}

      </div>
    </>
  );
}

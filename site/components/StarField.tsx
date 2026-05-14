"use client";

import { useEffect, useState } from "react";

type Star = {
  top: number;
  left: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
};

const STAR_COUNT = 120;

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

    const sizeRoll = r3;
    let size: number;
    if (sizeRoll < 0.7) size = 1;
    else if (sizeRoll < 0.92) size = 2;
    else size = 3;

    stars.push({
      top: r1 * 100,
      left: r2 * 100,
      size,
      opacity: 0.3 + r4 * 0.7,
      duration: 3 + r5 * 6,
      delay: r6 * 5,
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
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at top, rgba(40, 30, 70, 0.4) 0%, rgba(10, 10, 15, 0) 60%), #0a0a0f",
      }}
    >
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-parchment"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            boxShadow:
              star.size > 1
                ? `0 0 ${star.size * 2}px rgba(232, 220, 200, 0.6)`
                : "none",
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

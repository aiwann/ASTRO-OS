import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Астро ОС — Персонален AI Астрологичен Анализ';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  // Cormorant Garamond supports Cyrillic and matches the site serif
  let fontData: ArrayBuffer | null = null;
  try {
    const res = await fetch(
      'https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2',
      { next: { revalidate: 86400 } }
    );
    fontData = await res.arrayBuffer();
  } catch {
    // fallback to system serif — still looks decent
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial gold glow behind center */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px',
            height: '400px',
            background:
              'radial-gradient(ellipse at center, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 50%, transparent 75%)',
            borderRadius: '50%',
            display: 'flex',
          }}
        />

        {/* Purple nebula accent — top-right */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '400px',
            height: '400px',
            background:
              'radial-gradient(circle, rgba(90,50,140,0.18) 0%, transparent 65%)',
            borderRadius: '50%',
            display: 'flex',
          }}
        />

        {/* Border frame */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '1px solid rgba(212,175,55,0.20)',
            borderRadius: '4px',
            display: 'flex',
          }}
        />

        {/* Corner stars */}
        {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
          <div
            key={pos}
            style={{
              position: 'absolute',
              top: pos.startsWith('top') ? '36px' : undefined,
              bottom: pos.startsWith('bottom') ? '36px' : undefined,
              left: pos.endsWith('left') ? '36px' : undefined,
              right: pos.endsWith('right') ? '36px' : undefined,
              color: 'rgba(212,175,55,0.40)',
              fontSize: '16px',
              display: 'flex',
            }}
          >
            ✦
          </div>
        ))}

        {/* Scattered small stars */}
        {[
          { top: '80px', left: '180px', size: '10px', op: 0.25 },
          { top: '120px', right: '220px', size: '8px', op: 0.20 },
          { bottom: '100px', left: '250px', size: '9px', op: 0.22 },
          { bottom: '140px', right: '180px', size: '11px', op: 0.18 },
          { top: '200px', left: '80px', size: '8px', op: 0.15 },
          { top: '160px', right: '90px', size: '7px', op: 0.18 },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: s.top,
              bottom: s.bottom,
              left: s.left,
              right: s.right,
              color: `rgba(212,175,55,${s.op})`,
              fontSize: s.size,
              display: 'flex',
            }}
          >
            ★
          </div>
        ))}

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0px',
            zIndex: 10,
          }}
        >
          {/* Top ornament */}
          <div
            style={{
              color: 'rgba(212,175,55,0.55)',
              fontSize: '22px',
              letterSpacing: '20px',
              marginBottom: '28px',
              display: 'flex',
            }}
          >
            ✦  ✦  ✦
          </div>

          {/* Logo / site name */}
          <div
            style={{
              fontFamily: fontData ? 'Cormorant' : 'Georgia, serif',
              fontSize: '88px',
              fontWeight: 400,
              color: '#d4af37',
              letterSpacing: '8px',
              lineHeight: 1,
              display: 'flex',
            }}
          >
            АСТРО ОС
          </div>

          {/* Thin gold line */}
          <div
            style={{
              width: '280px',
              height: '1px',
              background:
                'linear-gradient(to right, transparent, rgba(212,175,55,0.7), transparent)',
              margin: '22px 0',
              display: 'flex',
            }}
          />

          {/* Subtitle */}
          <div
            style={{
              fontFamily: fontData ? 'Cormorant' : 'Georgia, serif',
              fontSize: '28px',
              fontWeight: 300,
              color: '#e8dcc8',
              letterSpacing: '3px',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            Персонален AI Астрологичен Анализ
          </div>

          {/* Tag line */}
          <div
            style={{
              marginTop: '16px',
              fontSize: '16px',
              color: 'rgba(212,175,55,0.65)',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              fontFamily: 'system-ui, sans-serif',
              display: 'flex',
            }}
          >
            от €5.99  ·  PDF в минути  ·  astro-os.net
          </div>
        </div>

        {/* Bottom ornament */}
        <div
          style={{
            position: 'absolute',
            bottom: '38px',
            color: 'rgba(212,175,55,0.30)',
            fontSize: '13px',
            letterSpacing: '6px',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
          }}
        >
          ЛИЧЕН  ·  ДУХОВЕН  ·  ТОЧЕН
        </div>
      </div>
    ),
    {
      ...size,
      ...(fontData
        ? {
            fonts: [
              {
                name: 'Cormorant',
                data: fontData,
                weight: 400 as const,
                style: 'normal' as const,
              },
            ],
          }
        : {}),
    }
  );
}

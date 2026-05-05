// LIVIO wordmark with the hardhat as the "O".
//
// Inline SVG — ships zero extra HTTP requests, scales crisply at any size,
// and the artwork lives in source so we can refine it without juggling
// asset files. Pair this with " Land" in emerald in the header to assemble
// the full Livio Land lockup.
//
// Visual language: the parent Livio brand mark is the yellow construction
// helmet with an orange brim and chinstrap. Here it substitutes for the
// final "O" of LIVIO. The chinstrap loop is rendered as the lower arc of
// the O letterform so the helmet still reads as a letter, not a sticker.
//
// All colors are flat (no gradients) so the mark feels at home with the
// Swiss-style typographic system the rest of the site uses.

export function LivioLogo({
  height = 28,
  className,
}: {
  height?: number;
  className?: string;
}) {
  // viewBox is sized so that 4 letters + helmet + small breathing room
  // come out to a ~3.7:1 aspect ratio. Caller picks the height; width
  // scales naturally.
  return (
    <svg
      viewBox="0 0 222 60"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LIVIO"
      height={height}
      className={className}
      style={{ width: "auto" }}
    >
      {/* L · I · V · I — extra-bold geometric sans, near-black */}
      <text
        x="0"
        y="48"
        fontFamily='"Helvetica Neue", "Helvetica", "Arial Black", sans-serif'
        fontWeight={900}
        fontSize={56}
        letterSpacing={-1}
        fill="#0a0a0a"
      >
        LIVI
      </text>

      {/* The "O" — Livio Building Systems hardhat */}
      <g transform="translate(133, 6)">
        {/* Chinstrap (the bottom arc of the O letterform). Drawn first so
            the helmet sits on top of it. */}
        <path
          d="M 2,33 A 22 13 0 0 0 46,33"
          fill="none"
          stroke="#0a0a0a"
          strokeWidth={2.4}
          strokeLinecap="round"
        />
        {/* Brim — orange ellipse */}
        <ellipse cx="24" cy="33" rx="27" ry="4.5" fill="#f97316" />
        {/* Shell — yellow capsule dome */}
        <path
          d="M 5,33 Q 5,4 24,4 Q 43,4 43,33 Z"
          fill="#facc15"
          stroke="#f97316"
          strokeWidth={1}
        />
        {/* Crown highlight (subtle arc near the top of the dome) */}
        <path
          d="M 11,9 Q 24,3 37,9"
          fill="none"
          stroke="#f97316"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {/* Vertical ridges — three of them, like the segments on a real
            hardhat. Just enough detail to sell the shape; not so much
            that the mark gets noisy at small sizes. */}
        <line x1="24" y1="4" x2="24" y2="33" stroke="#f97316" strokeWidth={1.6} />
        <line x1="14" y1="14" x2="14" y2="33" stroke="#f97316" strokeWidth={1.4} />
        <line x1="34" y1="14" x2="34" y2="33" stroke="#f97316" strokeWidth={1.4} />
      </g>
    </svg>
  );
}

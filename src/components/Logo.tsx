import { Pumpkin } from "./Pumpkin";

// The WargameCompare mark (owner, 2026-10-29): a blood-red battle shield with a gold rim, a bone die showing five, and
// two crossed swords behind it. An original heraldic drawing: nothing in it resembles any Games Workshop mark or
// artwork, and the name is plain text that never contains their trademarks. The colours are fixed (they read on both
// themes); src/app/icon.svg and the share images draw the same shield and die.
export const MARK = { gold: "#e0b252", red: "#c8222d", redDeep: "#6a0c13", bone: "#f1e6cf", pip: "#7a0f17", steel: "#d5d9de" };

export function LogoMark({ size = 32, swords = true }: { size?: number; swords?: boolean }) {
  const m = MARK;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="wgc-shield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m.red} />
          <stop offset="1" stopColor={m.redDeep} />
        </linearGradient>
      </defs>
      {swords &&
        [false, true].map((flip) => (
          <g key={String(flip)} transform={flip ? "matrix(-1 0 0 1 64 0)" : undefined}>
            <path d="M3 3l5 1.6L46 43l-3 3L4.6 8z" fill={m.steel} />
            <path d="M41 53l12-12M47.5 47.5l6 6" stroke={m.gold} strokeWidth="3.6" strokeLinecap="round" />
            <circle cx="57" cy="57" r="3.4" fill={m.gold} />
          </g>
        ))}
      <path d="M32 7 52 13v16c0 13-8 22.5-20 27.5C20 51.5 12 42 12 29V13z" fill="url(#wgc-shield)" stroke={m.gold} strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="21.5" y="18.5" width="21" height="21" rx="4.5" fill={m.bone} />
      <g fill={m.pip}>
        <circle cx="26.6" cy="23.6" r="2.3" />
        <circle cx="37.4" cy="23.6" r="2.3" />
        <circle cx="32" cy="29" r="2.3" />
        <circle cx="26.6" cy="34.4" r="2.3" />
        <circle cx="37.4" cy="34.4" r="2.3" />
      </g>
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-1.5 sm:gap-2">
      <LogoMark />
      <span className="flex flex-col leading-none">
        {/* Two lines on a phone (the header is full there), one line from sm up. */}
        <span className="flex flex-col font-display text-[15px] font-extrabold leading-[1.05] tracking-[0.06em] text-ink sm:flex-row sm:text-xl sm:tracking-[0.04em]">
          <span>WARGAME</span>
          <span className="text-brand">COMPARE</span>
        </span>
        <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.28em] text-faint sm:block">Muster for less</span>
      </span>
      <Pumpkin />
    </span>
  );
}

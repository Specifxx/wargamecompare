import { Pumpkin } from "./Pumpkin";

// The WargameCompare mark: a hex (the tabletop's hex grid) with two opposing arrows (compare). Deliberately nothing that
// resembles any Games Workshop mark or artwork; the name is plain text, and never contains their trademarks.
// At Christmas Santa's hat sits on it (globals.css .xmas-logo-hat, hidden outside the season), hence the host span.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span className="xmas-hat-host">
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="shrink-0">
        <path d="M32 6 54.5 19v26L32 58 9.5 45V19z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <path d="M21 27h17l-5-5M43 37H26l5 5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span aria-hidden="true" className="xmas-logo-hat" />
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2 text-brand">
      <LogoMark />
      <span className="font-display text-lg font-extrabold tracking-tight text-ink sm:text-xl">
        Wargame<span className="text-brand">Compare</span>
      </span>
      <Pumpkin />
    </span>
  );
}

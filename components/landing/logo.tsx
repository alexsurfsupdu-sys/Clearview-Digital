type LogoProps = {
  compact?: boolean;
};

export function Logo({ compact = false }: LogoProps) {
  const size = compact ? 26 : 30;

  return (
    <div className="flex items-center gap-3">
      <svg
        aria-hidden="true"
        fill="none"
        height={size}
        viewBox="0 0 40 40"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          fill="none"
          height="13"
          rx="1.5"
          stroke="#183153"
          strokeWidth="2.2"
          transform="rotate(-45 1 20)"
          width="13"
          x="1"
          y="20"
        />
        <rect
          fill="none"
          height="7"
          rx="0.8"
          stroke="#183153"
          strokeWidth="1.8"
          transform="rotate(-45 9 20)"
          width="7"
          x="9"
          y="20"
        />
      </svg>
      <span
        className={`font-extrabold tracking-[-0.04em] text-slate-950 ${
          compact ? "text-lg" : "text-xl"
        }`}
      >
        Clearview <span className="text-[var(--trust)]">Digital</span>
      </span>
    </div>
  );
}

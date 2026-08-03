export function PharmacyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* soft background blob */}
      <circle cx="160" cy="170" r="120" fill="#DBEAFE" opacity="0.5" />

      {/* mortar bowl */}
      <path
        d="M90 190 C90 240 125 270 160 270 C195 270 230 240 230 190"
        stroke="#2563EB"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <ellipse cx="160" cy="190" rx="70" ry="14" fill="#BFDBFE" stroke="#2563EB" strokeWidth="6" />

      {/* pestle */}
      <rect x="150" y="70" width="20" height="90" rx="10" fill="#2563EB" transform="rotate(18 160 115)" />
      <ellipse cx="196" cy="82" rx="16" ry="12" fill="#2563EB" transform="rotate(18 196 82)" />

      {/* small cross / plus accent */}
      <rect x="250" y="60" width="28" height="8" rx="4" fill="#E4C9C5" />
      <rect x="260" y="50" width="8" height="28" rx="4" fill="#E4C9C5" />

      {/* leaf accents */}
      <path d="M60 120 Q40 100 55 75 Q80 90 70 120 Z" fill="#BFDBFE" opacity="0.8" />
    </svg>
  )
}
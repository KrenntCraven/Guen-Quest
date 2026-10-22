/** Flat SVG version of the 3D intro bunny, used on the map marker and the intro button. */
export function BunnyIcon({ className, width = 44 }: { className?: string; width?: number }) {
  return (
    <svg className={className} viewBox="0 0 48 56" width={width} height={(width * 56) / 48} aria-hidden="true">
      <g stroke="#E6D9F2" strokeWidth="1.2">
        <rect x="11.5" y="2" width="9" height="20" rx="4.5" fill="#FFF6EC" transform="rotate(-8 16 20)" />
        <rect x="27.5" y="2" width="9" height="20" rx="4.5" fill="#FFF6EC" transform="rotate(8 32 20)" />
        <ellipse cx="24" cy="46" rx="11" ry="8.5" fill="#FFF6EC" />
        <circle cx="24" cy="29" r="13.5" fill="#FFF6EC" />
      </g>
      <rect x="14" y="5" width="4.6" height="14" rx="2.3" fill="#F7B8C6" transform="rotate(-8 16 20)" />
      <rect x="29.4" y="5" width="4.6" height="14" rx="2.3" fill="#F7B8C6" transform="rotate(8 32 20)" />
      <path d="M11 18.5c2.2-2.6 4.8-2.6 5.6.2-2.4 1.6-4.4 1.6-5.6-.2Zm11 0c-2.2-2.6-4.8-2.6-5.6.2 2.4 1.6 4.4 1.6 5.6-.2Z" fill="#C9B3EE" />
      <circle cx="16.6" cy="18.6" r="1.6" fill="#B79BE6" />
      <ellipse cx="18.6" cy="29.5" rx="2.6" ry="3.1" fill="#4A2A80" />
      <ellipse cx="29.4" cy="29.5" rx="2.6" ry="3.1" fill="#4A2A80" />
      <circle cx="19.5" cy="28.3" r="1" fill="#FFFFFF" />
      <circle cx="30.3" cy="28.3" r="1" fill="#FFFFFF" />
      <ellipse cx="14.8" cy="34" rx="2.6" ry="1.6" fill="#F7B8C6" opacity="0.85" />
      <ellipse cx="33.2" cy="34" rx="2.6" ry="1.6" fill="#F7B8C6" opacity="0.85" />
      <path d="M22.6 32.6h2.8l-1.4 1.6Z" fill="#F29BB0" />
      <path d="M22 35.4c1 .9 3 .9 4 0" fill="none" stroke="#9A6A8A" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M15 41.4c5.6 2.6 12.4 2.6 18 0" fill="none" stroke="#C9B3EE" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

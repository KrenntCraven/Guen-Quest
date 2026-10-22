const PETAL = 'M20 20C16.6 14.4 17 7.6 20 3.2 23 7.6 23.4 14.4 20 20Z'
const ANGLES = [0, 60, 120, 180, 240, 300]

/** Flat, top-down version of the intro's violet lily. */
export function LilyIcon({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      {ANGLES.map((angle, index) => (
        <path key={angle} d={PETAL} fill={index % 2 === 0 ? '#8F6CCF' : '#B9A2E6'} transform={`rotate(${angle} 20 20)`} />
      ))}
      {ANGLES.map((angle) => (
        <path key={`v${angle}`} d="M20 18V9" stroke="#EDE3FB" strokeWidth="1.2" strokeLinecap="round" transform={`rotate(${angle} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="3.2" fill="#F6F0FF" />
      <circle cx="18.6" cy="18.8" r="1" fill="#7A3F62" />
      <circle cx="21.6" cy="19.2" r="1" fill="#7A3F62" />
      <circle cx="20" cy="21.6" r="1" fill="#7A3F62" />
    </svg>
  )
}

import { useId } from 'react'

/**
 * Inline SVG flags — avoids Windows “GB/BG letter pairs” instead of emoji glyphs.
 */
export default function LanguageFlag({ locale, className = '' }) {
  const clipId = useId().replace(/:/g, '')

  if (locale === 'bg') {
    return (
      <svg
        className={className}
        viewBox="0 0 5 3"
        width="20"
        height="12"
        aria-hidden="true"
      >
        <rect width="5" height="1" y="0" fill="#ffffff" />
        <rect width="5" height="1" y="1" fill="#00966e" />
        <rect width="5" height="1" y="2" fill="#d62612" />
      </svg>
    )
  }

  // en — Union Jack (compact)
  return (
    <svg
      className={className}
      viewBox="0 0 60 30"
      width="20"
      height="10"
      aria-hidden="true"
    >
      <clipPath id={clipId}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path fill="#012169" d="M0,0 h60 v30 H0z" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${clipId})`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

import { useLayoutEffect, useState, useEffect } from 'react'

const DESKTOP_QUERY = '(min-aspect-ratio: 4/3)'

/**
 * Publishes the viewport class as document-level state:
 *   - data-viewclass="desktop|portrait" on <html>
 *
 * Single source of truth for the 4:3 breakpoint — call once near the app
 * root. Page geometry itself is CSS-side (the golden spine in global.css):
 * desktop fits the largest phi:1 rect into the stage, portrait fills it.
 */
export function useSlotMetrics() {
  useLayoutEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const root = document.documentElement

    const apply = () => {
      root.dataset.viewclass = mql.matches ? 'desktop' : 'portrait'
    }

    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])
}

/**
 * Same 4:3 breakpoint as above, exposed as reactive state for components that
 * need to pick viewclass-specific values in JS rather than just toggling CSS.
 */
export function useIsDesktopViewport() {
  const [desktop, setDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const apply = () => setDesktop(mql.matches)
    apply()
    mql.addEventListener('change', apply)
    return () => mql.removeEventListener('change', apply)
  }, [])
  return desktop
}

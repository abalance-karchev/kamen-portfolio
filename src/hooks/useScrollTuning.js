import { useEffect } from 'react'

/**
 * Amplifies wheel travel so a small flick covers more ground.
 *
 * Stickiness itself is native (`scroll-snap-type: y mandatory` in
 * global.css) — this only changes how far one wheel gesture *moves* before
 * the browser decides which snap position to settle on, which is what makes
 * the reel feel responsive rather than requiring a deliberate hard scroll to
 * change page.
 *
 * Deliberately does not touch keyboard, scrollbar-drag, or touch scrolling —
 * only wheel input, the one that felt undersensitive.
 */
const WHEEL_GAIN = 1.125
const LINE_HEIGHT_PX = 16

export function useScrollTuning() {
  // Land on the true top on load. Two things otherwise steal it: the
  // browser restoring a previous scroll position, and mandatory snapping
  // resolving an initial 0 to the *page's* snap position one nav-height
  // down — skipping the "menu + masthead + front page" opening view
  // entirely. Skipped when the URL targets an anchor.
  useEffect(() => {
    if (window.location.hash) return
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const onWheel = (e) => {
      // Pinch-zoom, not scroll.
      if (e.ctrlKey) return
      // Let any element with its own scrolling (the timeline reel) handle
      // and hijack the gesture first.
      if (e.defaultPrevented) return
      if (e.target?.closest?.('[data-scroll-hijack]')) return

      let delta = e.deltaY
      if (e.deltaMode === 1) delta *= LINE_HEIGHT_PX        // lines
      else if (e.deltaMode === 2) delta *= window.innerHeight // pages
      if (!delta) return

      e.preventDefault()
      window.scrollBy({ top: delta * WHEEL_GAIN, behavior: 'auto' })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])
}

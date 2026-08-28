import { useEffect } from 'react'

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
}

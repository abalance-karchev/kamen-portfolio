import { useEffect } from 'react'

export function useScrollTuning() {
  // Land on the true top on load. Two things otherwise steal it: the
  // browser restoring a previous scroll position, and mandatory snapping
  // resolving an initial 0 to the *page's* snap position one nav-height
  // down — skipping the "menu + masthead + front page" opening view
  // entirely.
  //
  // A URL landing on an anchor (e.g. /#projects) needs its own handling
  // rather than deferring to the browser's native fragment scroll: on first
  // load this is a client-rendered SPA, so the target section doesn't exist
  // in the DOM yet when the browser processes the URL fragment, and nothing
  // retries the jump once React mounts it. Doing it here, once the section
  // is actually in the DOM, is what makes every /#<section-id> link work.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    const hash = window.location.hash.slice(1)
    const target = hash && document.getElementById(hash)
    if (target) {
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])
}

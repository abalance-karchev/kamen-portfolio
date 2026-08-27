import { useLayoutEffect } from 'react'

const MOUSE_QUERY = '(hover: hover) and (pointer: fine)'

/**
 * The reveal strip is the whole universal header band, not a hairline at
 * the very top: the band is where the active article's head lives, and
 * hovering that head is the intended gesture for calling the menu down over
 * it. Kept in sync with --header-band (10dvh) by measuring rather than
 * hard-coding, so the two can't drift.
 */
function topStripPx() {
  const declared = getComputedStyle(document.documentElement).getPropertyValue('--header-band')
  const parsed = parseFloat(declared)
  if (!Number.isNaN(parsed) && declared.includes('dvh')) {
    return (window.innerHeight * parsed) / 100
  }
  return Number.isNaN(parsed) ? 8 : parsed
}

/**
 * Publishes header visibility state as data-nav on <html>: "rest" | "hidden" | "peek".
 * CSS (scoped to [data-viewclass="desktop"]) decides what each state renders as —
 * this hook only decides which state applies. Portrait ignores data-nav entirely
 * and keeps the header sticky/always-visible via its own unconditional CSS rule.
 *
 * Reveal signals, in order of who can use them:
 *   - focus inside the header (keyboard, any device)
 *   - pointer within a top strip — gated on (hover:hover) and (pointer:fine), i.e.
 *     an actual mouse; on touch this event source is meaningless
 *   - scroll-up — only when there's no mouse, since a mouse already has the
 *     hover strip as its fast path and scroll-up would otherwise double-fire
 */
export function useNavReveal() {
  useLayoutEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia(MOUSE_QUERY)

    let hasMouse = mql.matches
    let lastY = window.scrollY
    let focused = false
    let pointerInStrip = false
    let scrollingUp = false

    const compute = () => {
      const y = window.scrollY
      if (y <= 0) {
        root.dataset.nav = 'rest'
        return
      }
      const revealed = focused || (hasMouse && pointerInStrip) || (!hasMouse && scrollingUp)
      root.dataset.nav = revealed ? 'peek' : 'hidden'
    }

    const onScroll = () => {
      const y = window.scrollY
      scrollingUp = y < lastY
      lastY = y
      compute()
    }
    const onPointerMove = (e) => {
      if (!hasMouse) return
      pointerInStrip = e.clientY <= topStripPx()
      compute()
    }
    const onFocusIn = (e) => {
      if (!e.target.closest?.('.nav')) return
      focused = true
      compute()
    }
    const onFocusOut = (e) => {
      if (!e.target.closest?.('.nav')) return
      if (e.relatedTarget?.closest?.('.nav')) return
      focused = false
      compute()
    }
    const onMqlChange = () => {
      hasMouse = mql.matches
      compute()
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    mql.addEventListener('change', onMqlChange)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
      mql.removeEventListener('change', onMqlChange)
    }
  }, [])
}

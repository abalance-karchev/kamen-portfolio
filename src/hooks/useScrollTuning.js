import { useEffect, useRef } from 'react'

/**
 * Turns wheel input into a capped, gradually-building glide instead of an
 * instant 1:1 (or amplified) jump per tick.
 *
 * Each wheel tick adds an impulse to a velocity accumulator — capped per
 * tick so one aggressive flick can't spike speed in one go — and a rAF loop
 * advances the actual scroll position by that velocity every frame, decaying
 * it by friction each frame. That gives three things at once: lower overall
 * sensitivity (GAIN), a genuinely animated multi-frame glide rather than a
 * teleport (FRICTION), and a hard ceiling on top speed regardless of how
 * hard or fast the wheel is spun (MAX_VELOCITY) — acceleration that ramps up
 * gradually across consecutive ticks instead of jumping straight to it.
 *
 * Stickiness itself is native (`scroll-snap-type: y mandatory` in
 * global.css) — the rAF loop keeps calling scrollBy every frame while
 * velocity is non-zero, so the browser only resolves the mandatory snap once
 * the glide actually settles, not mid-gesture.
 *
 * Deliberately does not touch keyboard, scrollbar-drag, or touch scrolling —
 * only wheel input, the one that felt too fast.
 */
const GAIN = 0.6           // impulse added per px of wheel delta — lower = less sensitive
const MAX_IMPULSE = 30     // cap on velocity a single wheel event can add (the "capped" part)
const MAX_VELOCITY = 36    // hard top speed, px/frame (~2100px/s at 60fps)
const FRICTION = 0.9       // per-frame velocity decay — higher = longer, slower glide
const STOP_THRESHOLD = 0.5 // velocity below this is treated as settled
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

  const velocityRef = useRef(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const step = () => {
      const v = velocityRef.current
      if (Math.abs(v) < STOP_THRESHOLD) {
        velocityRef.current = 0
        rafRef.current = null
        return
      }
      window.scrollBy({ top: v, behavior: 'auto' })
      velocityRef.current = v * FRICTION
      rafRef.current = requestAnimationFrame(step)
    }

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

      const impulse = Math.max(-MAX_IMPULSE, Math.min(MAX_IMPULSE, delta * GAIN))
      velocityRef.current = Math.max(
        -MAX_VELOCITY,
        Math.min(MAX_VELOCITY, velocityRef.current + impulse),
      )

      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [])
}

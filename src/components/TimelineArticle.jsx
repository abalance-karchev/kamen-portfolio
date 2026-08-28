import { useCallback, useEffect, useRef, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { animate } from 'motion'
import FitBox from './FitBox'

/**
 * The timeline as a horizontal reel.
 *
 * One checkpoint fills the card area at a time, so the page reads as a
 * single self-contained "post" like every other page. Because a lone card
 * gives no visual hint that more exist, the reel leans on the same
 * affordances a video reel does: the spine strip above shows a node per
 * checkpoint (so the count and your position in it are always visible),
 * vertical wheel input is translated into horizontal travel while there is
 * still reel left, and each card snaps.
 */
// Each card has scroll-snap-stop: always, so while CSS snap is active *any*
// nonzero scrollBy resolves instantly to a full card — there's no such thing
// as a partial, visible slide. To get real physical scrolling, a wheel
// gesture drops scroll-snap-type for its duration and drives reel.scrollLeft
// directly (so the cards visibly track the wheel), then re-enables snap and
// glides to whichever card is nearest once the gesture goes idle.
// DRAG_GAIN < 1 is the "300% slower": the reel travels a quarter as far per
// unit of wheel input, so it takes ~4x the scrolling to cross one card.
const DRAG_GAIN = 0.25
// A single physical mouse-wheel notch is one wheel event, not a stream —
// the natural gap between notches on a slow, deliberate roll can comfortably
// exceed 140ms, so a short idle window mistook "still scrolling, just
// unhurried" for "done," settling mid-gesture and then immediately cancelling
// when the next notch arrived (the stutter this constant fixes).
const SETTLE_IDLE_MS = 320
// A card only auto-completes into full view once it's within this fraction
// of being there already (90%+ visible) — short of that, the gesture just
// stops wherever it stopped, same as CSS scroll-snap-type: proximity.
const SETTLE_SNAP_FRACTION = 0.10
const SETTLE_SPRING = { type: 'spring', duration: 0.55, bounce: 0.28 }

export default function TimelineArticle({ copy }) {
  const articleRef = useRef(null)
  const reelRef = useRef(null)
  const [index, setIndex] = useState(0)
  const checkpoints = copy.timeline

  const scrollToIndex = useCallback((i) => {
    const reel = reelRef.current
    if (!reel) return
    const clamped = Math.max(0, Math.min(checkpoints.length - 1, i))
    reel.scrollTo({ left: clamped * reel.clientWidth, behavior: 'smooth' })
  }, [checkpoints.length])

  // Track which card is centered, for the spine nodes.
  useEffect(() => {
    const reel = reelRef.current
    if (!reel) return
    const onScroll = () => {
      const w = reel.clientWidth
      if (w > 0) setIndex(Math.round(reel.scrollLeft / w))
    }
    reel.addEventListener('scroll', onScroll, { passive: true })
    return () => reel.removeEventListener('scroll', onScroll)
  }, [])

  // Wheel hijack: while this article holds the screen, vertical wheel input
  // drives the reel horizontally — scroll down/right moves forward through
  // the checkpoints, up/left moves back. Only once the reel reaches an edge
  // does the gesture stop being intercepted, so the page scroll takes over
  // and carries the user to the next article without a second gesture.
  //
  // The listener sits on the whole article, not just the reel: the spine
  // strip and the padding around the card are part of the same surface, and
  // a wheel over them should drive the reel too rather than scrolling the
  // page out from under it.
  useEffect(() => {
    const article = articleRef.current
    const reel = reelRef.current
    if (!article || !reel) return

    let settleTimer = null
    let dragging = false
    let stopSpring = null

    const settle = () => {
      dragging = false
      const w = reel.clientWidth
      const maxIndex = Math.round((reel.scrollWidth - w) / w)
      const idx = Math.floor(reel.scrollLeft / w)
      const frac = reel.scrollLeft / w - idx

      // Only auto-complete the move if the reel is already almost at the
      // next (or back at the current) card — otherwise leave it be.
      let target = null
      if (frac <= SETTLE_SNAP_FRACTION) target = idx
      else if (frac >= 1 - SETTLE_SNAP_FRACTION) target = idx + 1

      if (target == null) {
        // Deliberately does NOT restore scroll-snap-type here: re-enabling
        // it while resting at a non-aligned position (this branch, by
        // definition) makes the browser's own snap engine immediately
        // force-correct to the nearest card on its own terms — silently
        // overriding the 10%/90% decision just made above. It stays 'none'
        // until the next drag or a completed commit re-arms it.
        return
      }

      target = Math.max(0, Math.min(maxIndex, target))
      // scroll-snap-type stays 'none' for the duration of the spring — restoring
      // it earlier lets the mandatory/stop:always CSS snap resolve the move
      // itself, instantly, fighting (and visually swallowing) this animation.
      const controls = animate(reel.scrollLeft, target * w, {
        ...SETTLE_SPRING,
        onUpdate: (v) => { reel.scrollLeft = v },
        onComplete: () => { reel.style.scrollSnapType = '' },
      })
      stopSpring = () => controls.stop()
    }

    const onWheel = (e) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (delta === 0) return
      const max = reel.scrollWidth - reel.clientWidth
      if (max <= 1) return
      const pos = reel.scrollLeft
      const atStart = pos <= 0.5
      const atEnd = pos >= max - 0.5
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return
      e.preventDefault()

      if (!dragging) {
        dragging = true
        stopSpring?.()
        stopSpring = null
        reel.style.scrollSnapType = 'none'
      }
      reel.scrollLeft = Math.max(0, Math.min(max, reel.scrollLeft + delta * DRAG_GAIN))

      clearTimeout(settleTimer)
      settleTimer = setTimeout(settle, SETTLE_IDLE_MS)
    }

    article.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      article.removeEventListener('wheel', onWheel)
      clearTimeout(settleTimer)
      stopSpring?.()
    }
  }, [])

  return (
    <Motion.section
      ref={articleRef}
      data-scroll-hijack=""
      className="glass timeline-article golden-rect"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .93, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="timeline-article-pad">
        {/* Spine strip: height is exactly 2x the article padding. */}
        <div className="tl-spine">
          <div className="tl-spine-line" aria-hidden="true" />
          <div className="tl-spine-nodes">
            {checkpoints.map((cp, i) => (
              <button
                key={cp.title}
                type="button"
                className={`tl-node${i === index ? ' tl-node--active' : ''}`}
                aria-label={`${cp.year} — ${cp.title}`}
                aria-current={i === index}
                onClick={() => scrollToIndex(i)}
              />
            ))}
          </div>
        </div>

        <div className="tl-reel" ref={reelRef}>
          {checkpoints.map((cp) => (
            <article className="tl-card golden-split" key={cp.title}>
              <div className="major tl-card-visual">
                {cp.image && <img src={cp.image} alt={cp.title} />}
              </div>
              <div className="minor tl-card-body">
                <FitBox
                  element="span"
                  className="smallcaps"
                  maxFontSize={16}
                  containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
                  textStyle={{ margin: 0, display: 'block' }}
                >
                  {cp.year}
                </FitBox>
                <FitBox
                  element="h4"
                  maxFontSize={34}
                  containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
                  textStyle={{ margin: 0, lineHeight: 1.18, fontFamily: 'var(--font-display)', fontWeight: 700 }}
                >
                  {cp.title}
                </FitBox>
                <FitBox
                  element="p"
                  maxFontSize={20}
                  containerStyle={{ flex: '2 1 0', minHeight: 0, overflow: 'hidden' }}
                  textStyle={{ margin: 0, lineHeight: 1.55, color: 'var(--muted)' }}
                >
                  {cp.body}
                </FitBox>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Motion.section>
  )
}

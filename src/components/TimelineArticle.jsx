import { useCallback, useEffect, useRef, useState } from 'react'
import { motion as Motion } from 'motion/react'
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
// How long the reel must sit idle after the last wheel tick before it
// settles to the nearest card. Long enough that a normal multi-tick scroll
// gesture never gets interrupted by a mid-gesture snap.
const SNAP_IDLE_MS = 160

export default function TimelineArticle({ copy }) {
  const articleRef = useRef(null)
  const reelRef = useRef(null)
  const [index, setIndex] = useState(0)
  const checkpoints = copy.timeline
  const snapTimerRef = useRef(null)

  const scrollToIndex = useCallback((i) => {
    const reel = reelRef.current
    if (!reel) return
    const clamped = Math.max(0, Math.min(checkpoints.length - 1, i))
    // scrollBy, not scrollTo: a `scrollTo` call on this reel was silently
    // dropped — same underlying quirk as the direct `scrollLeft =`
    // assignment noted below. scrollBy reliably commits.
    reel.scrollBy({ left: clamped * reel.clientWidth - reel.scrollLeft, behavior: 'auto' })
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

    const onWheel = (e) => {
      let delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (delta === 0) return
      // Normalize to pixels: a physical mouse wheel reports deltaMode 1
      // ("lines"), where deltaY is ~3, versus a trackpad's deltaMode 0
      // ("pixels") already in the hundreds. Treating both the same way
      // made wheel-driven scrolling read as far less sensitive than a
      // trackpad's, so scale line/page deltas up to a comparable pixel range.
      if (e.deltaMode === 1) delta *= 16
      else if (e.deltaMode === 2) delta *= reel.clientWidth
      const max = reel.scrollWidth - reel.clientWidth
      if (max <= 1) return
      const pos = reel.scrollLeft
      const atStart = pos <= 0.5
      const atEnd = pos >= max - 0.5
      if ((delta < 0 && atStart) || (delta > 0 && atEnd)) return
      e.preventDefault()
      // scrollBy, not a direct `reel.scrollLeft +=` assignment: on this
      // container a raw property write was silently dropped (reverted on
      // the next frame) while scrollBy actually commits.
      reel.scrollBy({ left: delta, behavior: 'auto' })

      // Debounced settle: wait for the gesture to actually stop before
      // snapping to the nearest card. CSS scroll-snap (even `proximity`)
      // pulls toward a snap point as soon as motion pauses between wheel
      // ticks, which reads as aggressive/jumpy during a deliberate slow
      // scroll — so snapping is done here in JS, only once input goes idle.
      clearTimeout(snapTimerRef.current)
      snapTimerRef.current = setTimeout(() => {
        const w = reel.clientWidth
        if (w > 0) scrollToIndex(Math.round(reel.scrollLeft / w))
      }, SNAP_IDLE_MS)
    }

    article.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      article.removeEventListener('wheel', onWheel)
      clearTimeout(snapTimerRef.current)
    }
  }, [scrollToIndex])

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

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { FEATURE_PORTFOLIO_YOUTUBE_ID } from '../data/content'
import { useTimelineLayout } from '../hooks/useTimelineLayout'
import { parseYouTubeVideoId } from '../utils/parseYouTubeVideoId'
import FitBox from './FitBox'

const featureYoutubeEmbedId = parseYouTubeVideoId(FEATURE_PORTFOLIO_YOUTUBE_ID)

/* Opacity-only — no transform so layout stays stable during scroll/mode changes */
const item = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: .45, ease: [.16, 1, .3, 1] } },
}
const stagger = { show: { transition: { staggerChildren: .12 } } }

/** Hide timeline when the article column is too narrow for cards + spine (pad height stays huge on tall pages). */
const TL_MIN_PAD_W = 300
const TL_SHOW_PAD_W = 320

function CheckpointCard({ cp }) {
  return (
    <div className="checkpoint-card-wrap">
      <Motion.div className="checkpoint-card" variants={item}>
        <div className="checkpoint-img">
          {cp.image && <img src={cp.image} alt={cp.title} />}
        </div>
        <div className="checkpoint-content">
          <FitBox
            element="span"
            className="smallcaps"
            maxFontSize={12}
            scale={0.85}
            containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, display: 'block' }}
          >
            {cp.year}
          </FitBox>
          <FitBox
            element="h4"
            maxFontSize={24}
            scale={0.85}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, lineHeight: 1.22, fontFamily: 'var(--font-display)', fontWeight: 700 }}
          >
            {cp.title}
          </FitBox>
          <FitBox
            element="p"
            maxFontSize={14}
            scale={0.82}
            containerStyle={{ flex: '1.5 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, lineHeight: 1.6, color: 'var(--muted)' }}
          >
            {cp.body}
          </FitBox>
        </div>
      </Motion.div>
    </div>
  )
}

export const HelloWorld = () => {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}

export default function FeatureArticle({ copy }) {
  const articlePadRef = useRef(null)
  const [showTimeline, setShowTimeline] = useState(true)
  const timelineVisibleRef = useRef(true)

  const timelineWindowRef = useTimelineLayout(showTimeline)

  const scrollWrapRef = useRef(null)

  const isHorizontal = useCallback(
    () => (timelineWindowRef.current?.dataset.tlMode ?? 'horizontal') === 'horizontal',
    [timelineWindowRef],
  )

  useEffect(() => {
    const el = articlePadRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      const visible = timelineVisibleRef.current
      let next = visible
      if (visible) {
        if (w < TL_MIN_PAD_W) next = false
      } else {
        if (w >= TL_SHOW_PAD_W) next = true
      }
      if (next !== visible) {
        timelineVisibleRef.current = next
        setShowTimeline(next)
      }
    }

    const ro = new ResizeObserver(update)
    ro.observe(el)
    update()
    return () => ro.disconnect()
  }, [])

  // Natural-pan drag: grab a spine segment, slide content 1:1 like panning cards
  useEffect(() => {
    const wrap = scrollWrapRef.current
    if (!wrap) return

    let dragging = false
    let startX = 0
    let startY = 0
    let startScroll = 0

    const onDown = (e) => {
      if (!e.target.closest('.tl-segment')) return
      dragging = true
      startX = e.clientX
      startY = e.clientY
      startScroll = isHorizontal() ? wrap.scrollLeft : wrap.scrollTop
      wrap.setPointerCapture(e.pointerId)
      wrap.classList.add('is-dragging')
      e.preventDefault()
    }
    const onMove = (e) => {
      if (!dragging) return
      const h = isHorizontal()
      // Natural pan: drag right → content moves right → earlier entries visible
      const delta = h ? (e.clientX - startX) : (e.clientY - startY)
      if (h) wrap.scrollLeft = startScroll - delta
      else wrap.scrollTop = startScroll - delta
    }
    const onUp = (e) => {
      if (dragging) {
        wrap.releasePointerCapture(e.pointerId)
        wrap.classList.remove('is-dragging')
      }
      dragging = false
    }

    wrap.addEventListener('pointerdown', onDown)
    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerup', onUp)
    wrap.addEventListener('pointercancel', onUp)
    return () => {
      wrap.removeEventListener('pointerdown', onDown)
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerup', onUp)
      wrap.removeEventListener('pointercancel', onUp)
    }
  }, [isHorizontal, showTimeline])

  // Wheel hijack: scroll timeline until edge, then let page scroll resume
  useEffect(() => {
    if (!showTimeline) return
    const winEl = timelineWindowRef.current
    const wrap = scrollWrapRef.current
    if (!winEl || !wrap) return

    const onWheel = (e) => {
      const h = isHorizontal()
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX
      if (delta === 0) return
      const max = h ? (wrap.scrollWidth - wrap.clientWidth) : (wrap.scrollHeight - wrap.clientHeight)
      if (max <= 1) return
      const pos = h ? wrap.scrollLeft : wrap.scrollTop
      if ((delta < 0 && pos <= 0) || (delta > 0 && pos >= max - 0.5)) return
      e.preventDefault()
      if (h) wrap.scrollLeft = pos + delta
      else wrap.scrollTop = pos + delta
    }

    winEl.addEventListener('wheel', onWheel, { passive: false })
    return () => winEl.removeEventListener('wheel', onWheel)
  }, [isHorizontal, timelineWindowRef, showTimeline])

  return (
    <Motion.section
      className="glass feature-article-shell"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="article-pad feature-article-pad" ref={articlePadRef}>
        <div className="feature-article-head">
          <span className="smallcaps">{copy.eyebrow}</span>

          <FitBox
            element="h3"
            maxFontSize={66}
            scale={0.82}
            containerStyle={{ flex: '1.5 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: 1.05, letterSpacing: 'clamp(0.048rem, 0.034rem + 0.22cqw, 0.104rem)', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}
            className="article-title"
          >
            {copy.title}
          </FitBox>

          <FitBox
            element="p"
            maxFontSize={18}
            scale={0.82}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: 1.45, color: 'var(--muted)', margin: 0 }}
            className="article-deck"
          >
            {copy.deck}
          </FitBox>
        </div>

        <div className="feature-video-wrap">
          <div className="video-frame video-frame--yt">
            {featureYoutubeEmbedId ? (
              <iframe
                className="yt-embed"
                src={`https://www.youtube-nocookie.com/embed/${featureYoutubeEmbedId}?rel=0`}
                title={copy.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <p className="feature-video-empty">
                {copy.emptyVideo}
              </p>
            )}
          </div>
          <div className="caption caption--below-video feature-video-caption">
            <FitBox
              element="strong"
              maxFontSize={14}
              scale={0.85}
              containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
              textStyle={{ margin: 0, display: 'block' }}
            >
              {copy.videoLabel}
            </FitBox>
            <FitBox
              element="span"
              maxFontSize={13}
              scale={0.85}
              containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
              textStyle={{ margin: 0, display: 'block', color: 'var(--muted)' }}
            >
              {copy.videoMeta}
            </FitBox>
            <FitBox
              element="p"
              maxFontSize={16}
              scale={0.82}
              containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
              textStyle={{ lineHeight: 1.75, color: 'var(--muted)', margin: 0 }}
              className="feature-body-copy"
            >
              {copy.body}
            </FitBox>
          </div>
        </div>

        {showTimeline && (
          <div className="timeline-section">
            <div className="timeline-section-head">
              <span className="smallcaps">{copy.timelineEyebrow}</span>
              <div className="rule" />
            </div>

            {/*
              Single continuous .timeline-spine-line inside .timeline-tracks-inner so left/right
              span the full row width (not the viewport-clamped scroll-content box).
            */}
            <div className="timeline-window" ref={timelineWindowRef}>
              <div className="timeline-scroll-wrap" ref={scrollWrapRef}>
                <div className="timeline-scroll-content">
                  <Motion.div
                    className="timeline-tracks-inner"
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: .1 }}
                  >
                    <div className="timeline-spine-line" aria-hidden="true" />
                    {copy.timeline.map((cp, i) => (
                      <div className="timeline-track-col" key={i}>
                        <div className="tl-segment" role="presentation" aria-hidden="true">
                          <div className="tl-dot" />
                        </div>
                        <CheckpointCard cp={cp} />
                      </div>
                    ))}
                  </Motion.div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Motion.section>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { getProjectCards } from '../utils/v3'
import { measureProjectFitPretext } from '../utils/measureProjectFitPretext'
import FitBox from './FitBox'

/** @param {{ id: string, startx: number, starty: number, width: number, height: number }[]} cards */
function cardsToRects(cards) {
  /** @type {Record<string, { x: number, y: number, w: number, h: number }>} */
  const rects = {}
  for (const c of cards) {
    rects[c.id] = { x: c.startx, y: c.starty, w: c.width, h: c.height }
  }
  return rects
}

export default function ProjectsArticle({ copy }) {
  const containerRef = useRef(null)
  const [rects,   setRects]   = useState({})
  const [skipped, setSkipped] = useState(new Set())
  const [flags,   setFlags]   = useState({})

  const projects = copy.items

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    const run = () => {
      const W = el.clientWidth
      const H = el.clientHeight
      if (W <= 0 || H <= 0) return

      // ── Pass 1: pack all projects ─────────────────────────────────────────
      let rects = cardsToRects(getProjectCards(W, H, projects))

      // ── Measure titles; collect items whose title doesn't fit ─────────────
      const titleSkipped = new Set()
      for (const p of projects) {
        const r = rects[p.id]
        if (!r) continue
        const fit = measureProjectFitPretext(p, r)
        if (!fit.titleFits) titleSkipped.add(p.id)
      }

      // ── Pass 2: re-pack without skipped items (single re-pass only) ────────
      let finalRects = rects
      if (titleSkipped.size > 0) {
        const remaining = projects.filter(p => !titleSkipped.has(p.id))
        if (remaining.length > 0) {
          finalRects = cardsToRects(getProjectCards(W, H, remaining))
        } else {
          finalRects = {}
        }
      }

      // ── Measure all content flags against the final layout ────────────────
      const finalSkipped = new Set(titleSkipped)
      const nextFlags    = {}

      const visibleOrdered = projects.filter(p => !titleSkipped.has(p.id) && finalRects[p.id])
      const lastId =
        visibleOrdered.length > 0 ? visibleOrdered[visibleOrdered.length - 1].id : null

      for (const p of projects) {
        if (finalSkipped.has(p.id)) continue
        const r = finalRects[p.id]
        if (!r) continue
        const fit = measureProjectFitPretext(p, r, { isLast: p.id === lastId })
        if (!fit.titleFits) {
          finalSkipped.add(p.id)
          continue
        }
        nextFlags[p.id] = { showBody: fit.showBody, showTags: fit.showTags }
      }

      setRects(finalRects)
      setSkipped(finalSkipped)
      setFlags(nextFlags)
    }

    run()
    document.fonts.ready.then(run)

    const ro = new ResizeObserver(run)
    ro.observe(el)
    return () => ro.disconnect()
  }, [projects])

  return (
    <Motion.section
      className="glass projects-article"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .7, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="article-pad article-pad--projects">
        <div className="projects-article-head">
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

        {/* projects-layout fills remaining flex space (flex: 1 1 0 in CSS) */}
        <div ref={containerRef} className="projects-layout">
          {(() => {
            const visible = projects.filter(p => !skipped.has(p.id) && rects[p.id])
            const lastId  = visible.length > 0 ? visible[visible.length - 1].id : null
            return projects.map(p => {
            if (skipped.has(p.id)) return null
            const b = rects[p.id]
            if (!b) return null
            const f        = flags[p.id] ?? { showBody: true, showTags: true }
            const isLast   = p.id === lastId
            const isLandscape = b.w > b.h

            return (
              <div
                key={p.id}
                className="projects-layout-cell"
                style={{
                  position: 'absolute',
                  left:   b.x,
                  top:    b.y,
                  width:  b.w,
                  height: b.h,
                  boxSizing: 'border-box',
                }}
              >
                <Motion.article
                  className={[
                    'projects-item',
                    isLandscape ? 'projects-item--landscape' : '',
                    isLast      ? 'projects-item--last'      : '',
                  ].filter(Boolean).join(' ')}
                  whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
                  transition={{ duration: .2 }}
                >
                  {p.image && (
                    <div className="project-visual">
                      <img src={p.image} alt={p.title} />
                    </div>
                  )}

                  <div className="project-content">
                    <h4 className="project-title">{p.title}</h4>

                    {f.showBody && (
                      <p className="project-body">{p.body}</p>
                    )}

                    {f.showTags && (
                      <div className="tags">
                        {p.tags.map(t => <span className="tag" key={t}>{t}</span>)}
                      </div>
                    )}
                  </div>
                </Motion.article>
              </div>
            )
            })
          })()}
        </div>
      </div>
    </Motion.section>
  )
}

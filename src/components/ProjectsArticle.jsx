import { useLayoutEffect, useRef, useState } from 'react'
import { motion as Motion } from 'motion/react'
import { getProjectCards } from '../utils/v3'
import { measureProjectFitPretext } from '../utils/measureProjectFitPretext'
import { applyTileMetricsCssVars } from '../styles/tileMetrics'
import ArticleHead from './ArticleHead'
import ProjectCard from './ProjectCard'

applyTileMetricsCssVars()

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

      setRects(finalRects)
      setSkipped(titleSkipped)
    }

    run()
    document.fonts.ready.then(run)

    const ro = new ResizeObserver(run)
    ro.observe(el)
    return () => ro.disconnect()
  }, [projects])

  return (
    <Motion.section
      className="glass projects-article golden-rect"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .93, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="article-pad article-pad--projects">
        <ArticleHead
          eyebrow={copy.eyebrow}
          title={copy.title}
          deck={copy.deck}
          headClassName="projects-article-head"
        />

        {/* projects-layout fills remaining flex space (flex: 1 1 0 in CSS) */}
        <div ref={containerRef} className="projects-layout">
          {(() => {
            const visible = projects.filter(p => !skipped.has(p.id) && rects[p.id])
            const lastId  = visible.length > 0 ? visible[visible.length - 1].id : null
            return projects.map(p => {
            if (skipped.has(p.id)) return null
            const b = rects[p.id]
            if (!b) return null
            const isLast   = p.id === lastId
            const isLandscape = b.w > b.h

            return (
              <div
                key={p.id}
                id={`project-${p.id}`}
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
                <ProjectCard
                  className={[
                    isLandscape ? 'projects-item--landscape' : '',
                    isLast      ? 'projects-item--last'      : '',
                  ].filter(Boolean).join(' ')}
                  image={p.image}
                  title={p.title}
                  body={p.body}
                  bullets={p.bullets}
                  tags={p.tags}
                />
              </div>
            )
            })
          })()}
        </div>
      </div>
    </Motion.section>
  )
}

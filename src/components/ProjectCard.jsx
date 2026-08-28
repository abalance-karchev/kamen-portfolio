import { motion as Motion } from 'motion/react'
import FitBox from './FitBox'

// The project card, extracted from ProjectsArticle's treemap loop so other
// pages can use the same card instead of growing a parallel one.
//
// Markup and classes are unchanged from the treemap version — the treemap
// still supplies its own sizing through `className` (projects-item--landscape,
// projects-item--last) and the absolutely positioned cell around it.
export default function ProjectCard({
  image,
  title,
  body,
  bullets,
  tags,
  demoLink,
  tryItLabel = 'Try it!',
  className = '',
  bodyMaxFontSize = 26,
  // Bigger than bodyMaxFontSize on purpose: the title should be free to grow
  // past the bullets/body size when there's width for it, never the other
  // way round.
  titleMaxFontSize = 40,
  children,
  ...motionProps
}) {
  return (
    <Motion.article
      className={['projects-item', className].filter(Boolean).join(' ')}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
      transition={{ duration: .2 }}
      {...motionProps}
    >
      {image && (
        <div className="project-visual">
          <img src={image} alt={title} />
        </div>
      )}

      <div className="project-content">
        {/* Fit-to-width like the bullets below, so a short title doesn't
            sit smaller than the prose it's a heading for — capped higher
            than bodyMaxFontSize so it never loses that comparison. */}
        <FitBox
          element="h4"
          className="project-title"
          maxFontSize={titleMaxFontSize}
          // Cap as a share of the tile's own height (cqh, from .projects-item's
          // container-type:size) rather than a flat px budget — a flat cap
          // generous enough for the big flagship tile let the title swallow
          // the entire content area on small tiles, squeezing bullets/tags to 0.
          containerStyle={{ flex: '0 0 auto', minHeight: 0, maxHeight: '16cqh', overflow: 'hidden' }}
          // .project-title's CSS line-height (0.95) packs lines tighter than
          // the font's own glyph height, so scrollHeight always overshoots
          // an auto-sized container built from that same line-height — the
          // fit check never succeeds and the binary search bottoms out at
          // minFontSize. A line-height with real headroom over 1 keeps the
          // box legitimately bigger than its content in every browser's
          // font-metrics rounding, not just barely.
          textStyle={{ lineHeight: 1.3 }}
        >
          {title}
        </FitBox>

        {/* Bullets over prose: fewer words at a larger size get read, a
            dense paragraph in a treemap tile does not. Falls back to `body`
            for any project that has no bullets authored yet. */}
        <FitBox
          element={bullets?.length ? 'ul' : 'p'}
          maxFontSize={bodyMaxFontSize}
          containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
          textStyle={{ lineHeight: 1.45, color: 'var(--muted)', margin: 0 }}
          className={bullets?.length ? 'project-bullets' : 'project-body'}
        >
          {bullets?.length
            ? bullets.map(b => <li key={b}>{b}</li>)
            : body}
        </FitBox>

        {tags?.length > 0 && (
          <div className="tags">
            {tags.map(t => <span className="tag" key={t}>{t}</span>)}
          </div>
        )}

        {demoLink && (
          <a
            className="project-try-it"
            href={demoLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {tryItLabel}
          </a>
        )}

        {children}
      </div>
    </Motion.article>
  )
}

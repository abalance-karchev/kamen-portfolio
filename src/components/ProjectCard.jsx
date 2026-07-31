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
  tags,
  className = '',
  bodyMaxFontSize = 21,
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
        <h4 className="project-title">{title}</h4>

        <FitBox
          element="p"
          maxFontSize={bodyMaxFontSize}
          containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
          textStyle={{ lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}
          className="project-body"
        >
          {body}
        </FitBox>

        {tags?.length > 0 && (
          <div className="tags">
            {tags.map(t => <span className="tag" key={t}>{t}</span>)}
          </div>
        )}

        {children}
      </div>
    </Motion.article>
  )
}

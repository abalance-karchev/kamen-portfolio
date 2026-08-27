import { motion as Motion } from 'motion/react'

/**
 * An article's heading — a normal in-flow element at the top of its own page.
 *
 * There is no shared header element anywhere: every page simply reserves the
 * same amount of room (`--head-space`) for its heading, so once a page snaps
 * into position its heading necessarily lands in the same place as the
 * previous one's. The visual continuity is a consequence of the shared
 * measure, not of anything persisting across pages.
 */
export default function PageHead({ eyebrow, title }) {
  return (
    <Motion.div
      className="page-head"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .4 }}
      transition={{ duration: .57, ease: [.16, 1, .3, 1] }}
    >
      <span className="smallcaps">{eyebrow}</span>
      <div className="rule" />
      <h2 className="page-head-title">{title}</h2>
      <div className="rule" />
    </Motion.div>
  )
}

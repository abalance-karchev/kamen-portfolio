import { motion as Motion } from 'motion/react'

const fade = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }

/**
 * @param {{ copy: object, asPageHead?: boolean }} props
 *   asPageHead — render as the front page's heading, i.e. sized to the same
 *   `--head-space` every other page's heading occupies. Keeps the original
 *   composition (meta · title · meta over a double rule); only the vertical
 *   scale and the dropped bottom row differ.
 */
export default function Masthead({ copy, asPageHead = false }) {
  return (
    <Motion.section
      className={`masthead${asPageHead ? ' masthead--head page-head' : ''}`}
      variants={fade}
      initial="hidden"
      animate="show"
      transition={{ duration: .93, ease: [.16, 1, .3, 1] }}
    >
      <div className="masthead-top">
        <aside className="masthead-meta">
          <span className="smallcaps">{copy.left[0]}</span>
          <span>{copy.left[1]}</span>
          {!asPageHead && <span>{copy.left[2]}</span>}
        </aside>
        <h1 className="paper-title">{copy.title}</h1>
        <aside className="masthead-meta" style={{ textAlign: 'right' }}>
          <span className="smallcaps">{copy.right[0]}</span>
          <span>{copy.right[1]}</span>
          {!asPageHead && <span>{copy.right[2]}</span>}
        </aside>
      </div>
      {!asPageHead && (
        <div className="masthead-bottom">
          {copy.bottom.map((item) => <span key={item}>{item}</span>)}
        </div>
      )}
    </Motion.section>
  )
}

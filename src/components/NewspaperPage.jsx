import { useRef } from 'react'
import { motion as Motion, useScroll, useTransform } from 'motion/react'

/*
  Card-deck page transition.

  Z-index intent (the key insight):
    · The EXITING article rises to z=3 — it's the card being slid OFF the top of the
      deck, so the user sees it depart over everything.
    · The ENTERING article starts at z=1 — it rises UP from behind/underneath.
    · Reading phase: z=2 (between entering and exiting).

  The first article on the page is already visible at load, so it skips the
  entrance animation and only has the exit (isFirst prop).
*/

export default function NewspaperPage({ children, head, isFirst = false, id }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const inStart  = 0.07
  const inEnd    = 0.14
  const outStart = 0.74
  const outEnd   = 0.86
  const k = [0, inStart, inEnd, outStart, outEnd, 1]

  const rotateX = useTransform(scrollYProgress, k,
    isFirst
      ? [0,   0,   0,  0,  -14, -14]
      : [12,  12,  0,  0,  -14, -14])

  const rotateZ = useTransform(scrollYProgress, k,
    isFirst
      ? [0,   0,   0,  0,  3,  3]
      : [-2,  -2,  0,  0,  3,  3])

  const x = useTransform(scrollYProgress, k,
    isFirst
      ? ['0%',  '0%',  '0%', '0%', '6%',  '6%']
      : ['-3%', '-3%', '0%', '0%', '6%',  '6%'])

  // Entering: rises from below (+30% to 0). Exiting: drops away (+0 to +25%).
  const y = useTransform(scrollYProgress, k,
    isFirst
      ? ['0%',  '0%',  '0%', '0%', '25%', '25%']
      : ['30%', '30%', '0%', '0%', '25%', '25%'])

  const scale = useTransform(scrollYProgress, k,
    isFirst
      ? [1,    1,    1,  1,  0.92, 0.92]
      : [0.92, 0.92, 1,  1,  0.92, 0.92])

  const opacity = useTransform(scrollYProgress, k,
    isFirst
      ? [1, 1, 1, 1, 0, 0]
      : [0, 0, 1, 1, 0, 0])

  // Exiting card is on top (z=3), entering card rises from behind (z=1).
  const zIndex = useTransform(scrollYProgress, k,
    [1, 1, 2, 2, 3, 1])

  return (
    <div ref={ref} id={id} className={`newspaper-page${isFirst ? ' newspaper-page--first' : ''}`}>
      {/* The heading sits in flow above the stage and outside the motion
          wrapper: the card-deck transform belongs to the article itself, and
          a heading that tilted and slid with it would never settle into the
          shared head space the layout is built around. */}
      {head}
      <div className="page-stage">
        <Motion.div
          className="newspaper-page-inner"
          style={{
            rotateX,
            rotateZ,
            x,
            y,
            opacity,
            scale,
            zIndex,
            position: 'relative',
            transformPerspective: 1000,
            transformOrigin: 'center center',
          }}
        >
          {children}
        </Motion.div>
      </div>
    </div>
  )
}

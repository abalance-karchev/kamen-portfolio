import { useState } from 'react'
import { motion as Motion, useMotionValue, useTransform, animate } from 'motion/react'

const DRAG_THRESHOLD = 18
const LEVER_TRAVEL = 32

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
)

const arrowVariants = {
  idle: { opacity: 0, y: 0 },
  hover: (i) => ({
    opacity: [0, 0.7, 0],
    y: [0, 7, 14],
    transition: {
      duration: 0.9,
      repeat: Infinity,
      delay: i * 0.15,
      ease: 'easeInOut',
    },
  }),
}

export default function LightSwitch({ theme, toggleTheme }) {
  const [hovered, setHovered] = useState(false)
  const leverY = useMotionValue(0)

  const knobShadow = useTransform(
    leverY,
    [0, LEVER_TRAVEL],
    [
      '0 2px 8px rgba(0,0,0,.18)',
      '0 8px 20px rgba(0,0,0,.28)',
    ],
  )

  function handleDragEnd(_, info) {
    if (info.offset.y > DRAG_THRESHOLD) {
      animate(leverY, LEVER_TRAVEL, {
        type: 'spring', stiffness: 600, damping: 18,
      }).then(() => {
        toggleTheme()
        animate(leverY, 0, {
          type: 'spring', stiffness: 480, damping: 14,
        })
      })
    } else {
      animate(leverY, 0, {
        type: 'spring', stiffness: 480, damping: 14,
      })
    }
  }

  return (
    <div
      className="light-switch-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Ghost / track circle — marks the resting position */}
      <div className="switch-track" aria-hidden="true" />

      {/* Draggable knob */}
      <Motion.button
        className="switch-knob"
        drag="y"
        dragConstraints={{ top: 0, bottom: LEVER_TRAVEL }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ y: leverY, boxShadow: knobShadow }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 1.1 }}
        aria-label="Toggle theme"
        tabIndex={0}
      >
        {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
      </Motion.button>

      {/* Pull-down arrow hints */}
      <div className="switch-arrows" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <Motion.span
            key={i}
            className="switch-arrow"
            custom={i}
            variants={arrowVariants}
            initial="idle"
            animate={hovered ? 'hover' : 'idle'}
          >
            <svg width="10" height="7" viewBox="0 0 10 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 1.5L5 5.5L9 1.5" />
            </svg>
          </Motion.span>
        ))}
      </div>
    </div>
  )
}

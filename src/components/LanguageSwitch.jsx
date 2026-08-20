import { useRef } from 'react'
import { motion as Motion, useMotionValue, animate, useReducedMotion } from 'motion/react'
import LanguageFlag from './LanguageFlag'

const D      = 36            // circle diameter — matches light-switch knob
const REVEAL = D * 0.75      // 27 px: top slides left on hover, exposing 75% of under circle
const PRESS  = D * 0.125     // 4.5 px: shuffle nudge on click

const SPR_REVEAL = { type: 'spring', stiffness: 520, damping: 22 }
const SPR_PRESS  = { type: 'spring', stiffness: 640, damping: 16 }
const SPR_RETURN = { type: 'spring', stiffness: 480, damping: 20 }

export default function LanguageSwitch({ language, onLanguageChange, copy }) {
  const reduceMotion  = useReducedMotion()
  const isSwitching   = useRef(false)
  const isRevealed    = useRef(false)

  const nextLanguage  = language === 'en' ? 'bg' : 'en'
  const current       = copy.options[language]

  const topX    = useMotionValue(0)
  const bottomX = useMotionValue(0)

  function reveal() {
    if (isSwitching.current) return
    isRevealed.current = true
    animate(topX, -REVEAL, SPR_REVEAL)
  }

  function unreveal() {
    isRevealed.current = false
    // During a switch, do not animate here — handleSwitch phase 3 uses isRevealed to pick restX.
    // If we returned early before, pointer could leave mid-switch and isRevealed stayed true → stuck open.
    if (isSwitching.current) return
    animate(topX, 0, SPR_REVEAL)
    animate(bottomX, 0, SPR_REVEAL)
  }

  function handlePointerLeave(e) {
    const next = e.relatedTarget
    if (next instanceof Node && e.currentTarget.contains(next)) return
    unreveal()
  }

  async function handleSwitch() {
    if (isSwitching.current) return
    if (reduceMotion) { onLanguageChange(nextLanguage); return }

    isSwitching.current = true

    // Phase 1 — shuffle: front goes further left, back nudges right
    await Promise.all([
      animate(topX,    -(REVEAL + PRESS), SPR_PRESS),
      animate(bottomX,  PRESS,            SPR_PRESS),
    ])

    // Phase 2 — swap content; circles keep their motion-value positions
    onLanguageChange(nextLanguage)

    // Phase 3 — spring both back to rest; honour still-hovered state
    const restX = isRevealed.current ? -REVEAL : 0
    await Promise.all([
      animate(topX,    restX, SPR_RETURN),
      animate(bottomX, 0,     SPR_RETURN),
    ])

    isSwitching.current = false
  }

  return (
    <div
      className="language-switch"
      onPointerEnter={reveal}
      onPointerLeave={handlePointerLeave}
    >
      <span className="sr-only">{copy.currentLabel}: {current.name}</span>

      {/* Under circle — inactive language, the click target */}
      <Motion.button
        className="language-circle language-circle--under"
        type="button"
        onClick={handleSwitch}
        onFocus={reveal}
        onBlur={unreveal}
        style={{ x: bottomX }}
        aria-label={copy.ariaLabel[nextLanguage]}
        aria-live="polite"
      >
        <LanguageFlag locale={nextLanguage} className="language-flag-svg" />
      </Motion.button>

      {/* Top circle — active language, pointer-events disabled */}
      <Motion.div
        className="language-circle language-circle--top"
        style={{ x: topX }}
        aria-hidden="true"
      >
        <LanguageFlag locale={language} className="language-flag-svg" />
      </Motion.div>
    </div>
  )
}

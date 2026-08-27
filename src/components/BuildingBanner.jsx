import { motion as Motion, useReducedMotion } from 'motion/react'

// A live-video-bar shaped strip announcing what Kamen is building right now.
//
// The "live" styling is a visual metaphor for active work. It must never read
// as a claim that a stream is running: no viewer count, no "LIVE NOW", no
// launch date. Everything it states is verifiable.
export default function BuildingBanner({ copy, ctaHref }) {
  const reduceMotion = useReducedMotion()
  if (!copy) return null

  // A pulsing dot is exactly the kind of motion reduced-motion users opt out of.
  const pulse = reduceMotion
    ? {}
    : {
        animate: { opacity: [1, .35, 1], scale: [1, .84, 1] },
        transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
      }

  return (
    <Motion.div
      className="building-banner"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .4 }}
      transition={{ duration: .67, delay: .2, ease: [.16, 1, .3, 1] }}
    >
      <span className="building-banner__indicator" aria-hidden="true">
        <Motion.span className="building-banner__dot" {...pulse} />
      </span>

      <span className="building-banner__status">{copy.status}</span>

      <span className="building-banner__body">
        <strong className="building-banner__title">{copy.title}</strong>
        <span className="building-banner__blurb">{copy.blurb}</span>
      </span>

      <span className="building-banner__channel">
        <span className="building-banner__channel-label">{copy.channelLabel}</span>
        <em className="building-banner__channel-name">{copy.channel}</em>
      </span>

      {ctaHref && copy.cta && (
        <a className="building-banner__cta" href={ctaHref}>
          {copy.cta}
        </a>
      )}
    </Motion.div>
  )
}

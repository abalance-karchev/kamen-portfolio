import { motion as Motion } from 'motion/react'
import BuildingBanner from './BuildingBanner'
import FitBox from './FitBox'

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: .93, ease: [.16, 1, .3, 1] } },
}

/**
 * The front page as one golden rectangle.
 *
 * First division (phi:1) splits the "about" copy (major) from the portrait
 * column (minor). The portrait column is then divided again by the same
 * ratio: the photo itself is the major, the quote/caption below it the
 * minor. Two visual panels, one underlying proportion.
 */
export default function Hero({ copy }) {
  return (
    <section className="hero-grid golden-rect golden-split" id="hero">
      <Motion.article
        className="major hero-copy glass"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: .15 }}
      >
        <div className="hero-copy-text">
          <span className="smallcaps">{copy.eyebrow}</span>
          <FitBox
            element="h2"
            maxFontSize={86}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: '.98', letterSpacing: '.065rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}
          >
            {copy.title}
          </FitBox>
          <FitBox
            element="p"
            maxFontSize={28}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}
          >
            {copy.body}
          </FitBox>
        </div>

        <div className="hero-actions-grid">
          <BuildingBanner copy={copy.building} ctaHref="#project-history-interactive" />
          <div className="hero-stack">
            {copy.stack.map(name => (
              <span className="stack-chip" key={name}>
                <span className="stack-chip-dot" aria-hidden="true" />
                {name}
              </span>
            ))}
          </div>
        </div>
      </Motion.article>

      <Motion.aside
        className="minor hero-side golden-split golden-split--col"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: .15 }}
        transition={{ delay: .12 }}
      >
        <div className="major portrait glass">
          <img className="portrait-img" src="/images/proffesional_photo_better_edge_medium.png" alt={copy.portraitAlt} />
          <div className="caption">
            <strong>{copy.portraitName}</strong>
            <span>{copy.portraitMeta}</span>
          </div>
        </div>
        <div className="minor pull-quote glass">
          <FitBox
            element="div"
            maxFontSize={26}
            containerStyle={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: 1.4, fontStyle: 'italic', fontWeight: 600, fontFamily: 'var(--font-display)' }}
          >
            {copy.pullQuote}
          </FitBox>
        </div>
      </Motion.aside>
    </section>
  )
}

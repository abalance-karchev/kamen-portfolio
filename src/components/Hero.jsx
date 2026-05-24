import { useRef, useEffect } from 'react'
import { motion as Motion } from 'motion/react'
import { useFitText } from 'react-use-fittext'
import FitBox from './FitBox'

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: .7, ease: [.16, 1, .3, 1] } },
}

function FitBtn({ href, className, children, ...motionProps }) {
  const { containerRef, textRef, fontSize } = useFitText({ maxFontSize: 36, minFontSize: 7, fitMode: 'both' })
  return (
    <Motion.a className={className} href={href} {...motionProps}>
      <span ref={containerRef} className="btn-fit">
        <span ref={textRef} style={{ fontSize, textAlign: 'center', lineHeight: 1.2 }}>{children}</span>
      </span>
    </Motion.a>
  )
}

function FitQuickCard({ label, value }) {
  const { containerRef: lCRef, textRef: lTRef, fontSize: lSize } = useFitText({ maxFontSize: 10, minFontSize: 5, fitMode: 'both' })
  const { containerRef: vCRef, textRef: vTRef, fontSize: vSize } = useFitText({ maxFontSize: 14, minFontSize: 6, fitMode: 'both' })
  const fitTextStyle = { display: 'block' }
  return (
    <div className="quick-card">
      <div ref={lCRef} style={{ flex: '1 1 0', minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
        <strong ref={lTRef} style={{ fontSize: lSize, ...fitTextStyle, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '.04em' }}>
          {label}
        </strong>
      </div>
      <div ref={vCRef} style={{ flex: '1 1 0', minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}>
        <span ref={vTRef} style={{ fontSize: vSize, ...fitTextStyle, fontWeight: 600 }}>
          {value}
        </span>
      </div>
    </div>
  )
}

export default function Hero({ copy }) {
  const portraitRef = useRef(null)
  const captionRef  = useRef(null)

  useEffect(() => {
    const portrait = portraitRef.current
    const caption  = captionRef.current
    if (!portrait || !caption) return
    const check = () => {
      caption.style.visibility = caption.offsetHeight > portrait.offsetHeight * 0.35 ? 'hidden' : ''
    }
    const ro = new ResizeObserver(check)
    ro.observe(portrait)
    ro.observe(caption)
    check()
    return () => ro.disconnect()
  }, [])
  return (
    <section className="hero-grid" id="hero">
      <Motion.article
        className="hero-copy glass"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: .15 }}
      >
        <div className="hero-copy-text">
          <span className="smallcaps">{copy.eyebrow}</span>

          <FitBox
            element="h2"
            maxFontSize={66}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: '.9', letterSpacing: 'clamp(0.048rem, 0.036rem + 0.08cqw, 0.104rem)', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}
          >
            {copy.title}
          </FitBox>

          <FitBox
            element="p"
            maxFontSize={18}
            containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ lineHeight: 1.55, color: 'var(--muted)', margin: 0 }}
          >
            {copy.body}
          </FitBox>
        </div>

        <div className="hero-actions-grid">
          <span className="smallcaps actions-label">{copy.actionsLabel ?? 'you may be interested in'}</span>
          <div className="hero-actions">
            <FitBtn className="btn btn-primary" href="#feature" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
              {copy.actions.feature}
            </FitBtn>
            <FitBtn className="btn btn-secondary" href="#projects" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
              {copy.actions.projects}
            </FitBtn>
            <FitBtn className="btn btn-secondary" href="#contact" whileHover={{ y: -2 }} whileTap={{ scale: .97 }}>
              {copy.actions.contact}
            </FitBtn>
          </div>
          <div className="quick-grid">
            {copy.quickCards.map(c => (
              <FitQuickCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>
      </Motion.article>

      <Motion.aside
        className="hero-side glass"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: .15 }}
        transition={{ delay: .12 }}
      >
        <div className="portrait" ref={portraitRef}>
          <img className="portrait-img" src="/images/portrait-kamen-karchev.png" alt={copy.portraitAlt} />
          <div className="caption" ref={captionRef}>
            <strong>{copy.portraitName}</strong>
            <span>{copy.portraitMeta}</span>
          </div>
        </div>
        <div className="pull-quote" style={{ flex: '0 0 20%', minHeight: 0, overflow: 'hidden' }}>
          <FitBox
            element="div"
            maxFontSize={18}
            containerStyle={{ height: '100%', overflow: 'hidden' }}
          >
            {copy.pullQuote}
          </FitBox>
        </div>
      </Motion.aside>
    </section>
  )
}

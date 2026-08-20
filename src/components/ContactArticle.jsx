import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'motion/react'
import FitBox from './FitBox'
import ArticleHead from './ArticleHead'

/* Must match .page width in public/cv-preview.html (210mm ≈ 794px) */
const CV_NATURAL_W = 794

/* ── Brand icons ── */
const LinkedInIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const GitHubIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)
const EmailIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)
const DocumentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

const ICONS = {
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  email: EmailIcon,
}

function FitCardBody({ label, text, desc }) {
  const containerStyle = { height: '100%', minHeight: 0, overflow: 'hidden' }
  const textStyle = { height: '100%', display: 'block', textAlign: 'right' }

  return (
    <div className="profile-card-body">
      <div className="profile-card-label-wrap">
        <FitBox
          element="span"
          className="profile-card-label"
          maxFontSize={36}
          minFontSize={6}
          containerStyle={containerStyle}
          textStyle={textStyle}
        >
          {label}
        </FitBox>
      </div>
      <div className="profile-card-text-wrap">
        <FitBox
          element="span"
          className="profile-card-text"
          maxFontSize={48}
          minFontSize={7}
          containerStyle={containerStyle}
          textStyle={textStyle}
        >
          {text}
        </FitBox>
      </div>
      <div className="profile-card-desc-wrap">
        <FitBox
          element="span"
          className="profile-card-desc"
          maxFontSize={32}
          minFontSize={6}
          containerStyle={containerStyle}
          textStyle={textStyle}
        >
          {desc}
        </FitBox>
      </div>
    </div>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: .73, ease: [.16, 1, .3, 1], delay: i * 0.08 },
  }),
}

function CertificatesExpandable({ item, certs, index }) {
  const shellRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' && window.location.hash === '#contact-certificates',
  )

  const close = useCallback(() => {
    setOpen(false)
    if (window.location.hash === '#contact-certificates') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
    }
  }, [])

  const openMenu = useCallback(() => {
    setOpen(true)
  }, [])

  useEffect(() => {
    const onHash = () => {
      const shouldOpen = window.location.hash === '#contact-certificates'
      setOpen(shouldOpen)
      if (shouldOpen) {
        requestAnimationFrame(() => {
          shellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        })
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#contact-certificates') return
    requestAnimationFrame(() => {
      shellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = e => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  useEffect(() => {
    if (!open || !panelRef.current) return undefined
    const id = window.setTimeout(() => {
      panelRef.current?.querySelector('.contact-certificates__link')?.focus()
    }, 280)
    return () => window.clearTimeout(id)
  }, [open])

  return (
    <Motion.div
      ref={shellRef}
      layout
      id="contact-certificates"
      data-brand="certificates"
      className={`profile-card profile-card--certificates-shell${open ? ' profile-card--certificates-shell-open' : ''}`}
      style={{ '--profile-gradient': item.gradient }}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: .1 }}
      whileHover={!open ? { scale: 1.015, y: -3 } : undefined}
      whileTap={!open ? { scale: 0.98 } : undefined}
      transition={{ duration: .18, layout: { duration: .38, ease: [.16, 1, .3, 1] } }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <Motion.button
            key="closed"
            type="button"
            layout
            className="profile-card__cert-trigger"
            onClick={openMenu}
            aria-expanded={false}
            aria-controls="contact-certificates-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .2 }}
          >
            <div className="profile-card-icon">
              <DocumentIcon />
            </div>
            <FitCardBody label={item.label} text={item.text} desc={item.description} />
          </Motion.button>
        ) : (
          <Motion.div
            key="open"
            ref={panelRef}
            layout
            id="contact-certificates-panel"
            role="region"
            aria-label={certs.ariaLabel}
            className="profile-card__cert-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: .22 }}
          >
            <div className="profile-card__cert-panel-head">
              <button
                type="button"
                className="profile-card__cert-back"
                onClick={close}
                aria-label={certs.closeLabel}
              >
                ←
              </button>
              <p className="contact-certificates__title contact-certificates__title--panel">{certs.title}</p>
            </div>
            <ul className="contact-certificates__list">
              {certs.links.map(entry => (
                <li key={entry.href}>
                  {entry.href.endsWith('.pdf') ? (
                    <a href={entry.href} className="contact-certificates__link">
                      {entry.label}
                    </a>
                  ) : (
                    <Link to={entry.href} className="contact-certificates__link">
                      {entry.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  )
}

export default function ContactArticle({ copy }) {
  const clipRef = useRef(null)
  const [layout, setLayout] = useState(() => ({
    scale: 1,
    iframeH: 900,
  }))

  useEffect(() => {
    const el = clipRef.current
    if (!el) return
    const update = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w < 1 || h < 1) return
      const scale = w / CV_NATURAL_W
      setLayout({ scale, iframeH: h / scale })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <Motion.section
      className="glass contact-article golden-rect"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .93, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="article-pad article-pad--contact">
        <ArticleHead
          eyebrow={copy.eyebrow}
          title={copy.title}
          deck={copy.deck}
          headClassName="contact-welcome"
        />

        <div className="contact-body golden-split">
        <div className="major profile-cards">
          {copy.items.map((item, i) => {
            if (item.brand === 'certificates' && copy.certificates) {
              return (
                <CertificatesExpandable
                  key={item.label}
                  item={item}
                  certs={copy.certificates}
                  index={i}
                />
              )
            }
            const Icon = ICONS[item.brand] || DocumentIcon
            return (
              <Motion.a
                key={item.label}
                className="profile-card"
                data-brand={item.brand}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noreferrer' : undefined}
                style={{ '--profile-gradient': item.gradient }}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: .1 }}
                whileHover={{ scale: 1.015, y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: .18 }}
              >
                <div className="profile-card-icon">
                  <Icon />
                </div>
                <FitCardBody label={item.label} text={item.text} desc={item.description} />
              </Motion.a>
            )
          })}
          </div>

          <div className="minor cv-preview-pane-wrap">
            <div className="cv-preview-pane-container">
              <Motion.a
                href={copy.cvHref}
                className="cv-preview-pane"
                target="_blank"
                rel="noreferrer"
                aria-label="Open full CV on kamenkarchev.com"
                whileHover={{ y: -6, scale: 1.012 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: .22, ease: [.16, 1, .3, 1] }}
              >
                <div className="cv-preview-pane__scaler-wrap">
                  <div ref={clipRef} className="cv-preview-pane__scale-clip">
                    <iframe
                      className="cv-preview-pane__iframe"
                      src="/cv-preview.html"
                      scrolling="no"
                      tabIndex={-1}
                      aria-hidden="true"
                      title=""
                      style={{
                        width: CV_NATURAL_W,
                        height: layout.iframeH,
                        transform: `scale(${layout.scale})`,
                        transformOrigin: 'top left',
                      }}
                    />
                  </div>
                </div>
                <div className="cv-preview-pane__fade" aria-hidden="true" />
                <div className="cv-preview-pane__cta" aria-hidden="true">
                  <div className="cv-preview-pane__cta-icon"><DocumentIcon /></div>
                  <div className="cv-preview-pane__cta-body">
                    <span className="cv-preview-pane__cta-label">CV</span>
                    <span className="cv-preview-pane__cta-text">Click to view my full CV</span>
                    <span className="cv-preview-pane__cta-desc">kamenkarchev.com/cv</span>
                  </div>
                </div>
              </Motion.a>
            </div>
          </div>
        </div>
      </div>
    </Motion.section>
  )
}

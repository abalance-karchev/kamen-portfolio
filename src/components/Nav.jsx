import { Fragment, useRef, useLayoutEffect } from 'react'
import { Link } from 'react-router-dom'
import LightSwitch from './LightSwitch'
import LanguageSwitch from './LanguageSwitch'
import { useNavReveal } from '../hooks/useNavReveal'

export default function Nav({ theme, toggleTheme, language, onLanguageChange, copy, languageCopy }) {
  const ref = useRef(null)
  useNavReveal()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    // Publish once synchronously before paint, not only from the observer:
    // page geometry (the header band's rest offset, the first snap position)
    // reads --nav-h, so it must never be missing on the first frame — and a
    // ResizeObserver's initial callback is not guaranteed to have run by
    // then. The observer then keeps it current.
    const publish = () => root.style.setProperty('--nav-h', `${el.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    window.addEventListener('resize', publish)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [])

  return (
    <Fragment>
    <header className="nav" ref={ref}>
      <div className="wrap nav-inner">
        <div className="brand-wrap">
          <div className="logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18V6"/><path d="M6 12h4"/>
              <path d="M14 6v12"/><path d="M14 12l4-6"/><path d="M14 12l4 6"/>
            </svg>
          </div>
          <div>
            <strong>{copy.brandName}</strong>
            <span>{copy.brandTagline}</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="Primary">
          {copy.links.map(l =>
            l.to != null ? (
              <Link key={l.to + l.label} to={l.to}>{l.label}</Link>
            ) : (
              <a key={l.href} href={l.href}>{l.label}</a>
            ),
          )}
        </nav>
        <div className="nav-controls">
          <LanguageSwitch
            language={language}
            onLanguageChange={onLanguageChange}
            copy={languageCopy}
          />
          <LightSwitch theme={theme} toggleTheme={toggleTheme} />
        </div>
      </div>
    </header>
    <div className="nav-spacer" aria-hidden="true" />
    </Fragment>
  )
}

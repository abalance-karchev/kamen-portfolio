import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DOCUMENTS } from '../data/documents'

function formatTitle(slug) {
  if (!slug) return ''
  return slug.replaceAll('_', ' ')
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export default function DocumentPage() {
  const { slug } = useParams()
  const config = slug ? DOCUMENTS[slug] : undefined
  const pageCount = config?.pages ?? 0

  const [pageIndex, setPageIndex] = useState(0)

  const goPrev = useCallback(() => {
    setPageIndex(i => Math.max(0, i - 1))
  }, [])

  const goNext = useCallback(() => {
    setPageIndex(i => Math.min(pageCount - 1, i + 1))
  }, [pageCount])

  useEffect(() => {
    if (!config) return undefined

    const onKey = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [config, goPrev, goNext])

  const imageSrc = useMemo(() => {
    if (!slug || !config) return ''
    return `/documents/${slug}/img${pageIndex + 1}.png`
  }, [slug, config, pageIndex])

  const title = formatTitle(slug)

  if (!slug || !config || pageCount < 1) {
    return (
      <main className="doc-viewer">
        <div className="doc-viewer__shell">
          <header className="doc-viewer__bar">
            <Link to="/" className="doc-viewer__back" aria-label="Back to home">
              ← <span className="doc-viewer__back-text">Home</span>
            </Link>
          </header>
          <p className="doc-viewer__not-found">Document not found.</p>
        </div>
      </main>
    )
  }

  const atStart = pageIndex <= 0
  const atEnd = pageIndex >= pageCount - 1

  return (
    <main className="doc-viewer">
      <div className="doc-viewer__shell">
        <header className="doc-viewer__bar">
          <Link to="/" className="doc-viewer__back" aria-label="Back to home">
            ← <span className="doc-viewer__back-text">Home</span>
          </Link>
          <h1 className="doc-viewer__title">{title}</h1>
          <span className="doc-viewer__counter" aria-live="polite">
            {pageIndex + 1} / {pageCount}
          </span>
        </header>

        <div className="doc-viewer__stage">
          <button
            type="button"
            className="doc-viewer__nav doc-viewer__nav--prev"
            onClick={goPrev}
            disabled={atStart}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </button>

          <div className="doc-viewer__frame">
            <img
              key={pageIndex}
              className="doc-viewer__img"
              src={imageSrc}
              alt={`${title} — page ${pageIndex + 1}`}
            />
          </div>

          <button
            type="button"
            className="doc-viewer__nav doc-viewer__nav--next"
            onClick={goNext}
            disabled={atEnd}
            aria-label="Next page"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </main>
  )
}

import FitBox from './FitBox'

// Shared eyebrow+title+deck head used by Feature/Projects/Contact articles.
// Real-width per-element fitting (FitBox → useFitTextToElement), not a
// fixed-design canvas: a canvas whose scale ends up height-bound (long
// titles/decks wrapping to more lines) letterboxes horizontally, leaving
// text narrower than full-width siblings (video frame, treemap, profile
// cards) and smaller than it needs to be. Measuring the real element lets
// text always fill the real column width and use the largest font that fits.
export default function ArticleHead({ eyebrow, title, deck, headClassName }) {
  return (
    <div className={`article-head-slot ${headClassName}`}>
      <span className="smallcaps">{eyebrow}</span>
      <FitBox
        element="h3"
        maxFontSize={72}
        containerStyle={{ flex: '1.5 1 0', minHeight: 0, overflow: 'hidden' }}
        textStyle={{ lineHeight: 1.05, letterSpacing: '.05rem', fontWeight: 700, margin: 0, fontFamily: 'var(--font-display)' }}
        className="article-title"
      >
        {title}
      </FitBox>
      <FitBox
        element="p"
        maxFontSize={22}
        containerStyle={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
        textStyle={{ lineHeight: 1.5, color: 'var(--muted)', margin: 0 }}
        className="article-deck"
      >
        {deck}
      </FitBox>
    </div>
  )
}

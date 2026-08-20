import { motion as Motion } from 'motion/react'
import { FEATURE_PORTFOLIO_YOUTUBE_ID } from '../data/content'
import { parseYouTubeVideoId } from '../utils/parseYouTubeVideoId'
import FitBox from './FitBox'

const featureYoutubeEmbedId = parseYouTubeVideoId(FEATURE_PORTFOLIO_YOUTUBE_ID)

/**
 * The video page: one golden rectangle split phi:1 — the video takes the
 * major region, the title/deck/body run down the minor column beside it.
 * (The timeline used to share this page and now has its own — see
 * TimelineArticle.)
 */
export default function FeatureArticle({ copy }) {
  return (
    <Motion.section
      className="glass feature-article-shell golden-rect"
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .93, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .1 }}
    >
      <div className="feature-article-pad golden-split">
        <div className="major feature-video-major">
          <div className="video-frame video-frame--yt">
            {featureYoutubeEmbedId ? (
              <iframe
                className="yt-embed"
                src={`https://www.youtube-nocookie.com/embed/${featureYoutubeEmbedId}?rel=0`}
                title={copy.videoTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <p className="feature-video-empty">{copy.emptyVideo}</p>
            )}
          </div>
        </div>

        <div className="minor feature-text-minor">
          <FitBox
            element="span"
            className="smallcaps"
            maxFontSize={17}
            containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, display: 'block' }}
          >
            {copy.eyebrow}
          </FitBox>
          <FitBox
            element="h3"
            maxFontSize={54}
            containerStyle={{ flex: '1.6 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, lineHeight: 1.05, letterSpacing: '.05rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}
            className="article-title"
          >
            {copy.title}
          </FitBox>
          <FitBox
            element="p"
            maxFontSize={21}
            containerStyle={{ flex: '1.4 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, lineHeight: 1.5, color: 'var(--muted)' }}
            className="article-deck"
          >
            {copy.deck}
          </FitBox>
          <div className="rule" />
          <FitBox
            element="p"
            maxFontSize={19}
            containerStyle={{ flex: '1.6 1 0', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, lineHeight: 1.6, color: 'var(--muted)' }}
            className="feature-body-copy"
          >
            {copy.body}
          </FitBox>
          <FitBox
            element="span"
            maxFontSize={15}
            containerStyle={{ flex: '0 0 auto', minHeight: 0, overflow: 'hidden' }}
            textStyle={{ margin: 0, display: 'block', color: 'var(--muted)' }}
          >
            {copy.videoMeta}
          </FitBox>
        </div>
      </div>
    </Motion.section>
  )
}

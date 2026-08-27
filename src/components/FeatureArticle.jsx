import { motion as Motion } from 'motion/react'
import { FEATURE_PORTFOLIO_YOUTUBE_ID } from '../data/content'
import { parseYouTubeVideoId } from '../utils/parseYouTubeVideoId'
import ArticleHead from './ArticleHead'
import FitBox from './FitBox'

const featureYoutubeEmbedId = parseYouTubeVideoId(FEATURE_PORTFOLIO_YOUTUBE_ID)

/**
 * The video page: deliberately NOT a golden split. A phi:1 side-by-side
 * cramps the video into a narrow major column; stacking head / video / body
 * lets the video run full-width and reads better. (The timeline used to
 * share this page and now has its own — see TimelineArticle.)
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
      <div className="feature-article-pad feature-article-pad--stacked">
        <ArticleHead
          eyebrow={copy.eyebrow}
          title={copy.title}
          deck={copy.deck}
          headClassName="feature-article-head"
        />

        <div className="feature-video-wrap">
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

        <div className="feature-text-bottom">
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

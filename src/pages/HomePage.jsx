import Hero from '../components/Hero'
import Masthead from '../components/Masthead'
import PageHead from '../components/PageHead'
import FeatureArticle from '../components/FeatureArticle'
import TimelineArticle from '../components/TimelineArticle'
import ProjectsArticle from '../components/ProjectsArticle'
import ContactArticle from '../components/ContactArticle'
import NewspaperPage from '../components/NewspaperPage'
import Footer from '../components/Footer'

/**
 * Each page carries its own heading in flow. There is no shared header
 * element — every page just reserves the same `--head-space` for it, so a
 * snapped page always presents its heading in the same position as the last.
 */
export default function HomePage({ copy }) {
  return (
    <main className="wrap">
      <NewspaperPage isFirst head={<Masthead copy={copy.masthead} asPageHead />}>
        <Hero copy={copy.hero} />
      </NewspaperPage>
      <NewspaperPage id="feature" head={<PageHead {...copy.sections.feature} />}>
        <FeatureArticle copy={copy.feature} />
      </NewspaperPage>
      <NewspaperPage id="timeline" head={<PageHead {...copy.sections.timeline} />}>
        <TimelineArticle copy={copy.feature} />
      </NewspaperPage>
      <NewspaperPage id="projects" head={<PageHead {...copy.sections.projects} />}>
        <ProjectsArticle copy={copy.projects} />
      </NewspaperPage>
      <NewspaperPage id="contact" head={<PageHead {...copy.sections.contact} />}>
        <ContactArticle copy={copy.contact} />
      </NewspaperPage>
      <Footer copy={copy.footer} />
    </main>
  )
}

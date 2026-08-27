import { useMemo } from 'react'
import Masthead from '../components/Masthead'
import SectionHead from '../components/SectionHead'
import { SpaceDebugView } from '../components/SpaceDebugView'
import NewspaperPage from '../components/NewspaperPage'
import Footer from '../components/Footer'

export default function NemotryPage({ copy }) {
  const concepts = useMemo(
    () => copy.projects.items.map(p => ({ id: p.id, value: p.value ?? 1 })),
    [copy.projects.items],
  )

  return (
    <main className="wrap">
      <NewspaperPage tall>
        <SectionHead {...copy.sections.projects} id="nemotry" />
        <SpaceDebugView concepts={concepts} />
      </NewspaperPage>
      <Footer copy={copy.footer} />
    </main>
  )
}

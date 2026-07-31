import { Link } from 'react-router-dom'
import { motion as Motion } from 'motion/react'
import ProjectCard from '../components/ProjectCard'
import SectionHead from '../components/SectionHead'
import Footer from '../components/Footer'

// Availability page: a fixed number of project slots, some taken, the rest open.
//
// Everything stated here is derived from FREELANCE_SLOTS in data/content.js.
// The limited count is a real constraint and the taken slot is a real project —
// that is what makes saying so legitimate. Nothing on this page may imply
// urgency that isn't factual: no countdowns, no view counters, no invented
// testimonials or client logos.
export default function FreelancePage({ copy }) {
  const freelance = copy.freelance
  const slots     = freelance.slots
  const openCount = slots.filter(s => s.status === 'open').length

  return (
    <main className="wrap">
      {/* No NewspaperPage wrapper here: its scroll-driven exit fades the card
          out, which only reads correctly in the home page's deck of sections. */}
      <SectionHead eyebrow={freelance.eyebrow} title={freelance.title} id="freelance" />

        <Motion.section
          className="glass freelance-article"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .6, ease: [.16, 1, .3, 1] }}
        >
          <div className="article-pad">
            <div className="article-head">
              <p className="article-deck">{freelance.deck}</p>
              <p className="freelance-summary">
                {freelance.availabilitySummary(openCount, slots.length)}
              </p>
            </div>

            <ul className="freelance-slots">
              {slots.map((slot, i) => (
                <li key={slot.id} className="freelance-slot">
                  {slot.status === 'taken' ? (
                    <ProjectCard
                      className="freelance-card freelance-card--taken"
                      title={slot.title}
                      body={slot.body}
                      tags={slot.tags}
                    >
                      <span className="freelance-badge freelance-badge--taken">
                        {freelance.takenLabel}
                      </span>
                    </ProjectCard>
                  ) : (
                    <Link to="/request" className="freelance-open-link">
                      <ProjectCard
                        className="freelance-card freelance-card--open"
                        title={`${freelance.openLabel} · ${i + 1}`}
                        body={freelance.openCta}
                      >
                        <span className="freelance-badge freelance-badge--open">
                          {freelance.openLabel}
                        </span>
                      </ProjectCard>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
      </Motion.section>
      <Footer copy={copy.footer} />
    </main>
  )
}

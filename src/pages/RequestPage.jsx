import { useState } from 'react'
import { motion as Motion } from 'motion/react'
import SectionHead from '../components/SectionHead'
import Footer from '../components/Footer'
import {
  ENGAGEMENT_TYPES, LIMITS, validateRequest, isValid,
} from '../utils/requestValidation.js'

const EMPTY = {
  name: '', email: '', projectName: '', description: '',
  engagement: '', timeline: '', budget: '',
  website: '',   // honeypot — hidden from humans, see the field below
}

// Project request form. Submissions POST to the Pages Function at /api/request,
// which re-runs this exact validation before writing to D1.
//
// No analytics or tracking on this page, deliberately: people describe unshipped
// work here, and nothing beyond the form fields should leave the browser.
export default function RequestPage({ copy }) {
  const t = copy.request

  const [values, setValues]   = useState(EMPTY)
  const [errors, setErrors]   = useState({})
  const [formError, setError] = useState(null)
  const [status, setStatus]   = useState('idle')   // idle | sending | sent

  const set = (field) => (e) => {
    setValues(v => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors(e2 => ({ ...e2, [field]: undefined }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)

    const found = validateRequest(values)
    if (!isValid(found)) { setErrors(found); return }

    setStatus('sending')
    try {
      const res  = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setStatus('sent')
        setValues(EMPTY)
        return
      }
      // The server is authoritative; surface its per-field verdict when it sends one.
      if (data.fields) setErrors(data.fields)
      setError(t.errors[data.error] ?? t.errors.network)
      setStatus('idle')
    } catch {
      setError(t.errors.network)
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <main className="wrap">
        <SectionHead eyebrow={t.eyebrow} title={t.title} id="request" />
        <section className="glass request-article">
          <div className="article-pad">
            <h4 className="request-success__title">{t.successTitle}</h4>
            <p className="article-deck">{t.successBody}</p>
          </div>
        </section>
        <Footer copy={copy.footer} />
      </main>
    )
  }

  const err = (field) => errors[field] && (t.errors[errors[field]] ?? t.errors.required)

  return (
    <main className="wrap">
      <SectionHead eyebrow={t.eyebrow} title={t.title} id="request" />

      <Motion.section
        className="glass request-article"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .6, ease: [.16, 1, .3, 1] }}
      >
        <div className="article-pad">
          <p className="article-deck">{t.deck}</p>

          <form className="request-form" onSubmit={onSubmit} noValidate>
            <Field id="name" label={t.fields.name.label} error={err('name')}>
              <input
                id="name" type="text" value={values.name} onChange={set('name')}
                placeholder={t.fields.name.placeholder} maxLength={LIMITS.name.max}
                autoComplete="name" required
              />
            </Field>

            <Field id="email" label={t.fields.email.label} error={err('email')}>
              <input
                id="email" type="email" value={values.email} onChange={set('email')}
                placeholder={t.fields.email.placeholder} maxLength={LIMITS.email.max}
                autoComplete="email" required
              />
            </Field>

            <Field id="projectName" label={t.fields.projectName.label} error={err('projectName')}>
              <input
                id="projectName" type="text" value={values.projectName} onChange={set('projectName')}
                placeholder={t.fields.projectName.placeholder} maxLength={LIMITS.projectName.max}
                required
              />
            </Field>

            <Field id="description" label={t.fields.description.label} error={err('description')} wide>
              <textarea
                id="description" rows={6} value={values.description} onChange={set('description')}
                placeholder={t.fields.description.placeholder} maxLength={LIMITS.description.max}
                required
              />
            </Field>

            {/* Structured on purpose: whether this is paid or a request for free
                work is the single most decision-relevant fact, so it must not be
                buried in the description. */}
            <fieldset className="request-field request-field--wide">
              <legend>{t.fields.engagement.label}</legend>
              <div className="request-choices">
                {ENGAGEMENT_TYPES.map(type => (
                  <label key={type} className="request-choice">
                    <input
                      type="radio" name="engagement" value={type}
                      checked={values.engagement === type}
                      onChange={set('engagement')}
                    />
                    <span>{t.engagementOptions[type]}</span>
                  </label>
                ))}
              </div>
              {err('engagement') && <p className="request-error">{err('engagement')}</p>}
            </fieldset>

            <Field id="timeline" label={t.fields.timeline.label} hint={t.optional} error={err('timeline')}>
              <input
                id="timeline" type="text" value={values.timeline} onChange={set('timeline')}
                placeholder={t.fields.timeline.placeholder} maxLength={LIMITS.timeline.max}
              />
            </Field>

            <Field id="budget" label={t.fields.budget.label} hint={t.optional} error={err('budget')}>
              <input
                id="budget" type="text" value={values.budget} onChange={set('budget')}
                placeholder={t.fields.budget.placeholder} maxLength={LIMITS.budget.max}
              />
            </Field>

            {/* Honeypot. Hidden from sighted users and from screen readers; only
                a bot filling every input will touch it. */}
            <div className="request-honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website" name="website" type="text" tabIndex={-1}
                autoComplete="off" value={values.website} onChange={set('website')}
              />
            </div>

            {formError && <p className="request-error request-error--form" role="alert">{formError}</p>}

            <button className="btn request-submit" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? t.submitting : t.submit}
            </button>
          </form>
        </div>
      </Motion.section>

      <Footer copy={copy.footer} />
    </main>
  )
}

function Field({ id, label, hint, error, wide = false, children }) {
  return (
    <div className={`request-field${wide ? ' request-field--wide' : ''}`}>
      <label htmlFor={id}>
        {label}
        {hint && <span className="request-hint"> · {hint}</span>}
      </label>
      {children}
      {error && <p className="request-error">{error}</p>}
    </div>
  )
}

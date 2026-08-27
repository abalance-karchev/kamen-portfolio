import { useRef, useEffect } from 'react'
import { motion as Motion } from 'motion/react'

export default function SectionHead({ eyebrow, title, id }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    const page = el?.closest('.newspaper-page')
    if (!el || !page) return
    const observer = new ResizeObserver(() => {
      page.style.setProperty('--head-h', `${el.offsetHeight}px`)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Motion.div
      ref={ref}
      className="section-head"
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: .6, ease: [.16, 1, .3, 1] }}
      viewport={{ once: true, amount: .5 }}
    >
      <span className="smallcaps">{eyebrow}</span>
      <div className="rule" />
      <h3>{title}</h3>
      <div className="rule" />
    </Motion.div>
  )
}

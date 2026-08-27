import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Binary-searches the largest font size (within [minFontSize, maxFontSize])
 * at which the real text element fits its real container — measuring the
 * element itself, not a clone reparented to document.body.
 *
 * react-use-fittext's clone approach does `clone.style.cssText = "..."`,
 * which *replaces* the whole inline style attribute rather than merging it,
 * silently dropping any font-family/weight set via inline `style` on the
 * fitted node before the clone is measured — so it under-measures and the
 * real text (which keeps its font) overflows. Measuring the live element
 * sidesteps that class of bug entirely.
 */
export function useFitTextToElement({ minFontSize = 8, maxFontSize = 100 } = {}) {
  const containerRef = useRef(null)
  const textRef = useRef(null)
  const [fontSize, setFontSize] = useState(maxFontSize)

  useLayoutEffect(() => {
    const container = containerRef.current
    const text = textRef.current
    if (!container || !text) return

    const fits = (size) => {
      text.style.fontSize = `${size}px`
      return text.scrollWidth <= container.clientWidth + 0.5 && text.scrollHeight <= container.clientHeight + 0.5
    }

    const measure = () => {
      if (container.clientWidth <= 0 || container.clientHeight <= 0) return

      if (fits(maxFontSize)) {
        setFontSize(maxFontSize)
        return
      }
      if (!fits(minFontSize)) {
        setFontSize(minFontSize)
        return
      }

      let lo = minFontSize
      let hi = maxFontSize
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2
        if (fits(mid)) lo = mid
        else hi = mid
      }
      setFontSize(Math.floor(lo))
    }

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(container)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [minFontSize, maxFontSize])

  return { containerRef, textRef, fontSize }
}

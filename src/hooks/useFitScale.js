import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Uniform-scale authoring: content is laid out once at a fixed
 * `designW x designH` px canvas, then scaled (never cropped/stretched) to
 * fit whatever real box it lands in. Replaces per-element shrink-to-fit
 * (FitBox/useFitText) for authored article content — one measurement
 * instead of dozens of independent binary searches, so text never reflows
 * and never clips as long as it was authored to fit the canvas.
 *
 * `slotRef` goes on the measured wrapper (the real, viewport-derived box).
 * The canvas child should be sized to `designW x designH` and transformed
 * with `translate(-50%, -50%) scale(scale)` from `top: 50%; left: 50%` so it
 * stays centered in the slot regardless of aspect mismatch (letterboxing).
 */
export function useFitScale(designW, designH, { minScale = 0.001 } = {}) {
  const slotRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const el = slotRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (w <= 0 || h <= 0) return
      const k = Math.max(minScale, Math.min(w / designW, h / designH))
      setScale(k)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [designW, designH, minScale])

  return { slotRef, scale }
}

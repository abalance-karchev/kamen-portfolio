import { useFitTextToElement } from '../hooks/useFitTextToElement'

export default function FitBox({
  element,
  containerStyle,
  textStyle,
  maxFontSize = 100,
  minFontSize = 8,
  scale = 1,
  children,
  ...rest
}) {
  const Tag = element || 'div'
  const { containerRef, textRef, fontSize } = useFitTextToElement({ maxFontSize, minFontSize })
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        minWidth: 0,
        // Fitting caps the font size, so a container flex-grown taller than
        // that capped text needs (short copy in a generous slot — see the
        // timeline cards) would otherwise leave the text pinned at the top
        // with dead space below it. Centering the single child here costs
        // nothing when text already fills the box, and fixes it when it
        // doesn't — the fitting math itself only reads the container's own
        // clientWidth/clientHeight, unaffected by how its child is aligned.
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        ...containerStyle,
      }}
    >
      <Tag ref={textRef} style={{ fontSize: fontSize * scale, minWidth: 0, maxWidth: '100%', ...textStyle }} {...rest}>
        {children}
      </Tag>
    </div>
  )
}

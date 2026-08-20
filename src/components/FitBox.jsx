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
    <div ref={containerRef} style={{ width: '100%', minWidth: 0, ...containerStyle }}>
      <Tag ref={textRef} style={{ fontSize: fontSize * scale, minWidth: 0, maxWidth: '100%', ...textStyle }} {...rest}>
        {children}
      </Tag>
    </div>
  )
}

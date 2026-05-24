import { useFitText } from 'react-use-fittext'

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
  const { containerRef, textRef, fontSize } = useFitText({ maxFontSize, minFontSize, fitMode: 'both' })
  return (
    <div ref={containerRef} style={{ width: '100%', minWidth: 0, ...containerStyle }}>
      <Tag ref={textRef} style={{ fontSize: fontSize * scale, ...textStyle }} {...rest}>
        {children}
      </Tag>
    </div>
  )
}

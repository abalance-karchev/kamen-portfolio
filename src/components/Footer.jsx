export default function Footer({ copy }) {
  return (
    <footer className="footer">
      <span>{copy.copyright}</span>
      <span>{copy.tagline}</span>
    </footer>
  )
}

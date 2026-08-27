import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App'

// Browsers restore the last scroll position on reload by default
// (history.scrollRestoration:"auto") — on a page this tall, a reload after
// scrolling lands you back mid-article instead of at the top, which reads
// exactly like an unwanted auto-snap on load. Force every fresh load to
// start at the top; in-page navigation (snap, anchor links) is unaffected.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

// document.fonts.ready alone isn't enough: a browser only starts fetching a
// font face once something on the page actually uses it, and nothing does
// until React mounts — so the gate would resolve before the fit-critical
// faces below ever started loading. Request them explicitly instead.
const fontsReady = 'fonts' in document
  ? Promise.race([
      Promise.all([
        document.fonts.load('700 16px Inter'),
        document.fonts.load('400 16px Inter'),
        document.fonts.load('700 16px "Instrument Serif"'),
        document.fonts.load('300 16px "Instrument Serif"'),
        document.fonts.ready,
      ]),
      new Promise(r => setTimeout(r, 1000)),
    ])
  : Promise.resolve()

fontsReady.then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})

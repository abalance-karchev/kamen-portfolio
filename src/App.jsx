import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import HomePage from './pages/HomePage'
import NemotryPage from './pages/NemotryPage'
import FreelancePage from './pages/FreelancePage'
import RequestPage from './pages/RequestPage'
import DocumentRoute from './pages/DocumentRoute'
import { CONTENT } from './data/content'
import { useSlotMetrics } from './hooks/useSlotMetrics'
import { useScrollTuning } from './hooks/useScrollTuning'

const DEFAULT_LANGUAGE = 'en'
const LANGUAGE_STORAGE_KEY = 'kamen-portfolio-language'

function getInitialLanguage() {
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  return saved && CONTENT[saved] ? saved : DEFAULT_LANGUAGE
}

export default function App() {
  useSlotMetrics()
  useScrollTuning()
  const [theme, setTheme] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  }, [language])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const copy = CONTENT[language]

  return (
    <BrowserRouter>
      <Nav
        theme={theme}
        toggleTheme={toggleTheme}
        language={language}
        onLanguageChange={setLanguage}
        copy={copy.nav}
        languageCopy={copy.languageSwitch}
      />
      <Routes>
        <Route path="/" element={<HomePage copy={copy} />} />
        <Route path="/nemotry" element={<NemotryPage copy={copy} />} />
        <Route path="/freelance" element={<FreelancePage copy={copy} />} />
        <Route path="/request" element={<RequestPage copy={copy} />} />
        <Route path="/documents/:slug" element={<DocumentRoute />} />
      </Routes>
    </BrowserRouter>
  )
}

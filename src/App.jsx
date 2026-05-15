import { useState, useCallback } from 'react'
import SettingsBar from './components/SettingsBar'
import MainControls from './components/MainControls'
import PromptDisplay from './components/PromptDisplay'
import ResponseInput from './components/ResponseInput'
import FlashcardList from './components/FlashcardList'
import { buildPrompt, ENGINE_URLS, ENGINE_LABELS } from './lib/promptBuilder'
import { parseAIResponse } from './lib/responseParser'

const DEFAULT_TOGGLES = {
  showPos:          true,
  showDefinition:   true,
  showKorean:       true,
  showAssociations: false,
}

export default function App() {
  // ── Settings ──────────────────────────────────────
  const [engine, setEngine] = useState('gemini')

  // ── Controls ──────────────────────────────────────
  const [topic,     setTopic]     = useState('')
  const [wordCount, setWordCount] = useState(10)
  const [toggles,   setToggles]   = useState(DEFAULT_TOGGLES)

  // ── Output ────────────────────────────────────────
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [justBuilt,       setJustBuilt]       = useState(false)
  const [errorMsg,        setErrorMsg]         = useState('')
  
  // ── Flashcard Result State ────────────────────────
  const [flashcards,     setFlashcards]    = useState([])
  const [isFormatting,   setIsFormatting]   = useState(false)

  const handleToggle = useCallback((key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
    setGeneratedPrompt('')
    setJustBuilt(false)
  }, [])

  const handleGenerate = useCallback(() => {
    if (!topic.trim()) {
      setErrorMsg('Please enter a topic before building the prompt.')
      return
    }
    setErrorMsg('')

    const prompt = buildPrompt({ topic: topic.trim(), wordCount, toggles })
    setGeneratedPrompt(prompt)

    setJustBuilt(true)
    setTimeout(() => setJustBuilt(false), 2500)

    // const url = ENGINE_URLS[engine]
    // if (url) window.open(url, '_blank', 'noopener,noreferrer')
    
    // Clear old flashcards when generating a new prompt
    setFlashcards([])
  }, [engine, topic, wordCount, toggles])

  const handleFormat = useCallback((rawText) => {
    setIsFormatting(true)
    setErrorMsg('')
    
    // Small timeout to simulate "processing" feel
    setTimeout(() => {
      try {
        const parsed = parseAIResponse(rawText)
        if (parsed.length === 0) {
          throw new Error("Could not find any vocabulary words in that text. Make sure you copied the entire AI response.")
        }
        setFlashcards(parsed)
      } catch (err) {
        setErrorMsg(err.message)
      } finally {
        setIsFormatting(false)
      }
    }, 600)
  }, [])

  return (
    <div className="app-wrapper">
      <SettingsBar
        engine={engine}
        onEngineChange={(e) => {
          setEngine(e)
          setGeneratedPrompt('')
          setJustBuilt(false)
        }}
      />

      <div className="notebook-paper">
        <div className="paper-lines" aria-hidden="true" />
        <SpiralHoles />

        <div className="paper-content">
          <header className="paper-header">
            <h1 className="paper-title">📖 Vocab Homework Maker</h1>
            <p className="paper-subtitle">
              Build your AI prompt → paste results → get beautiful flashcards.
            </p>
          </header>

          <MainControls
            topic={topic}
            onTopicChange={(v) => { setTopic(v); setGeneratedPrompt('') }}
            wordCount={wordCount}
            onWordCountChange={(v) => { setWordCount(v); setGeneratedPrompt('') }}
            toggles={toggles}
            onToggle={handleToggle}
            onGenerate={handleGenerate}
            canGenerate={!!topic.trim()}
            justBuilt={justBuilt}
          />

          <div className="section-divider" />

          <PromptDisplay
            prompt={generatedPrompt}
            engine={engine}
            errorMsg={errorMsg && !flashcards.length ? errorMsg : ''}
            justBuilt={justBuilt}
          />
          
          {generatedPrompt && (
            <>
              <div className="section-divider-dashed" />
              <ResponseInput onFormat={handleFormat} isFormatting={isFormatting} />
            </>
          )}

          <div className="section-divider" />
          
          {flashcards.length > 0 && (
            <FlashcardList cards={flashcards} toggles={toggles} />
          )}
          
          {errorMsg && flashcards.length === 0 && (
            <div className="error-banner" style={{ marginTop: 20 }}>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SpiralHoles() {
  return (
    <div className="spiral-holes" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} className="spiral-hole" />
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────────
   ResponseInput — Textarea for pasting AI output and
   the final "Format Flashcards" button.
─────────────────────────────────────────────────── */
import { useState } from 'react'

export default function ResponseInput({ onFormat, isFormatting }) {
  const [inputText, setInputText] = useState('')

  const handleFormatClick = () => {
    if (!inputText.trim()) return
    onFormat(inputText)
    setInputText('') // Clear after formatting
  }

  return (
    <section className="response-input-section" aria-label="Format results">
      <div className="section-header-small">
        <span className="step-badge">Final Step</span>
        <h2 className="section-title-small">Paste AI Response Here</h2>
      </div>

      <div className="response-textarea-wrapper">
        <textarea
          className="response-textarea"
          placeholder="Paste the vocabulary list you got from the AI here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Paste AI response text"
        />
        
        <button
          className={`format-btn ${!inputText.trim() ? 'disabled' : ''}`}
          onClick={handleFormatClick}
          disabled={!inputText.trim() || isFormatting}
        >
          {isFormatting ? (
            <span className="btn-spinner-small" />
          ) : (
            '✨ Format Flashcards'
          )}
        </button>
      </div>
      
      <p className="response-hint">
        Once formatted, your vocabulary will be organized into beautifully animated flashcards below.
      </p>
    </section>
  )
}

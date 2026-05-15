/* ───────────────────────────────────────────────────
   PromptDisplay — Shows the generated AI prompt in a
   large readable text area with copy & re-open actions
─────────────────────────────────────────────────── */
import { useState, useRef, useEffect } from 'react'
import { ENGINE_URLS, ENGINE_LABELS } from '../lib/promptBuilder'

const ENGINE_ICONS = {
  gemini: '✦',
  openai: '⬡',
  claude:  '◈',
}

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)

const CopyIcon = ({ copied }) => copied
  ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12"/>
    </svg>
  )
  : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  )

const LaunchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15,3 21,3 21,9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

export default function PromptDisplay({ prompt, engine, errorMsg, justBuilt }) {
  const [copied,   setCopied]   = useState(false)
  const textareaRef             = useRef(null)

  // Auto-scroll to prompt display when it appears
  useEffect(() => {
    if (prompt && textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [prompt])

  // Reset copied state when prompt changes
  useEffect(() => { setCopied(false) }, [prompt])

  const handleCopy = async () => {
    if (!prompt) return
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback for older browsers
      if (textareaRef.current) {
        textareaRef.current.select()
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      }
    }
  }

  const handleReopen = () => {
    const url = ENGINE_URLS[engine]
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
  }

  const charCount = prompt.length
  const lineCount = prompt.split('\n').length

  return (
    <section className="prompt-display-section" aria-label="Generated Prompt">

      {/* Error banner */}
      {errorMsg && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Empty state */}
      {!prompt && !errorMsg && (
        <div className="vocab-empty" aria-label="No prompt generated yet">
          <div className="vocab-empty-icon" aria-hidden="true">✏️</div>
          <p className="vocab-empty-text">
            Enter a topic, pick your word count, and hit<br />
            <strong>✦ Build Prompt</strong> — your AI prompt will appear here.
          </p>
          <div className="empty-steps">
            <div className="empty-step"><span className="step-num">1</span>Fill in topic + options above</div>
            <div className="empty-step"><span className="step-num">2</span>Click <strong>Build Prompt</strong></div>
            <div className="empty-step"><span className="step-num">3</span>Copy &amp; paste into your AI chat</div>
          </div>
        </div>
      )}

      {/* Prompt output */}
      {prompt && (
        <div className={`prompt-output-wrapper ${justBuilt ? 'pulse-in' : ''}`} ref={textareaRef}>

          {/* Header bar */}
          <div className="prompt-output-header">
            <div className="prompt-output-meta">
              <span className="prompt-ready-badge">
                <span className="ready-dot" />
                Prompt Ready
              </span>
              <span className="prompt-stats">
                {lineCount} lines · {charCount.toLocaleString()} chars
              </span>
            </div>

            <div className="prompt-output-actions">
              {/* Re-open AI tab */}
              <button
                id="reopen-ai-btn"
                className="action-btn launch-btn"
                onClick={handleReopen}
                aria-label={`Open ${ENGINE_LABELS[engine]} in new tab`}
                title={`Open ${ENGINE_LABELS[engine]}`}
              >
                <LaunchIcon />
                <span>{ENGINE_ICONS[engine]} Open {ENGINE_LABELS[engine]}</span>
              </button>

              {/* Copy to clipboard */}
              <button
                id="copy-prompt-btn"
                className={`action-btn copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopy}
                aria-label={copied ? 'Copied to clipboard' : 'Copy prompt to clipboard'}
              >
                <CopyIcon copied={copied} />
                <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
              </button>
            </div>
          </div>

          {/* The prompt textarea */}
          <textarea
            id="prompt-textarea"
            className="prompt-textarea"
            value={prompt}
            readOnly
            spellCheck="false"
            aria-label="Generated AI prompt — copy this and paste into your AI chat"
            aria-readonly="true"
          />

          {/* Footer hint */}
          <div className="prompt-output-footer">
            <span>💡 Tip: Copy the prompt above, then paste it directly into your AI chat window.</span>
          </div>
        </div>
      )}
    </section>
  )
}

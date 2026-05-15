/* ───────────────────────────────────────────────────
   MainControls — Topic, slider, toggles, build button
   Button now reads "Build Prompt" / "✓ Prompt Built!"
─────────────────────────────────────────────────── */

const TOGGLE_OPTIONS = [
  { key: 'showPos',          label: 'Part of Speech',    emoji: '🏷️' },
  { key: 'showDefinition',   label: 'Definition',         emoji: '📝' },
  { key: 'showKorean',       label: 'Korean Translation', emoji: '🇰🇷' },
  { key: 'showAssociations', label: 'Word Associations',  emoji: '🔗' },
]

const CheckIcon = () => (
  <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polyline points="2,6 5,9 10,3" />
  </svg>
)

export default function MainControls({
  topic, onTopicChange,
  wordCount, onWordCountChange,
  toggles, onToggle,
  onGenerate, canGenerate, justBuilt,
}) {
  const sliderPct = ((wordCount - 1) / (42 - 1)) * 100

  return (
    <section className="controls-section" aria-label="Prompt Builder Controls">
      {/* ── Row 1: Topic + Slider + Build Button ── */}
      <div className="controls-row-main">

        {/* Topic Input */}
        <div className="control-group" style={{ flex: '2 1 240px' }}>
          <label htmlFor="topic-input" className="control-label">Topic</label>
          <input
            id="topic-input"
            type="text"
            className="topic-input"
            placeholder="e.g. Space exploration, Emotions, Food…"
            value={topic}
            onChange={e => onTopicChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canGenerate && onGenerate()}
            autoComplete="off"
            spellCheck="true"
            aria-label="Vocabulary topic"
          />
        </div>

        {/* Word Count Slider */}
        <div className="control-group slider-group" style={{ flex: '1 1 160px' }}>
          <div className="slider-header">
            <label htmlFor="word-count-slider" className="control-label">Word Count</label>
            <span className="slider-count-badge" aria-live="polite">{wordCount}</span>
          </div>
          <input
            id="word-count-slider"
            type="range"
            className="word-slider"
            min={1}
            max={42}
            step={1}
            value={wordCount}
            onChange={e => onWordCountChange(Number(e.target.value))}
            style={{ '--slider-pct': `${sliderPct}%` }}
            aria-label={`Word count: ${wordCount}`}
            aria-valuemin={1}
            aria-valuemax={42}
            aria-valuenow={wordCount}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--ink-light)' }}>1</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--ink-light)' }}>42</span>
          </div>
        </div>

        {/* Build Prompt Button */}
        <button
          id="generate-btn"
          className={`generate-btn ${justBuilt ? 'just-built' : ''}`}
          onClick={onGenerate}
          disabled={!canGenerate}
          aria-label={justBuilt ? 'Prompt built successfully' : 'Build vocabulary prompt'}
        >
          {justBuilt ? '✓ Prompt Built!' : '✦ Build Prompt'}
        </button>
      </div>

      {/* ── Row 2: Toggle Chips ── */}
      <div className="controls-row-toggles" role="group" aria-label="Include in prompt">
        <span className="toggles-label">Include:</span>
        {TOGGLE_OPTIONS.map(({ key, label, emoji }) => (
          <label
            key={key}
            id={`toggle-${key}`}
            className={`toggle-chip ${toggles[key] ? 'active' : ''}`}
            aria-label={`Toggle ${label}`}
          >
            <input
              type="checkbox"
              checked={toggles[key]}
              onChange={() => onToggle(key)}
              aria-label={label}
            />
            <span className="toggle-icon" aria-hidden="true">
              <CheckIcon />
            </span>
            <span>{emoji} {label}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

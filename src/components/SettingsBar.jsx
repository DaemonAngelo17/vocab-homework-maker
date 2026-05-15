/* ───────────────────────────────────────────────────
   SettingsBar — engine selector + launch indicator
   API key removed; engine choice drives which AI tab opens
─────────────────────────────────────────────────── */
import { ENGINE_URLS, ENGINE_LABELS } from '../lib/promptBuilder'

const ENGINE_OPTIONS = [
  { value: 'gemini', label: '✦ Gemini',  icon: '🌐' },
  { value: 'openai', label: '⬡ ChatGPT', icon: '🤖' },
  { value: 'claude', label: '◈ Claude',  icon: '🔷' },
]

const ENGINE_COLORS = {
  gemini: '#4285f4',
  openai: '#10a37f',
  claude: '#c07a4f',
}

export default function SettingsBar({ engine, onEngineChange }) {
  const engineColor = ENGINE_COLORS[engine] || '#7a8ab0'
  const engineLabel = ENGINE_LABELS[engine] || engine
  const engineUrl   = ENGINE_URLS[engine]   || '#'

  return (
    <nav className="settings-bar" role="banner" aria-label="App Settings">
      <span className="settings-brand" aria-label="App title">Vocab HW Maker</span>

      {/* How it works hint */}
      <span className="settings-howto">
        Build a prompt → paste into AI → done ✓
      </span>

      {/* AI Engine selector */}
      <div className="settings-group">
        <label htmlFor="engine-select" className="settings-label">AI Engine</label>
        <select
          id="engine-select"
          className="settings-select"
          value={engine}
          onChange={e => onEngineChange(e.target.value)}
          aria-label="Select AI engine"
        >
          {ENGINE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Launch target indicator */}
      <div
        className="launch-indicator"
        style={{ '--engine-color': engineColor }}
        title={`Will open ${engineUrl}`}
      >
        <span className="launch-dot" style={{ background: engineColor }} />
        <span className="launch-text">
          Opens&nbsp;<strong>{engineLabel}</strong>&nbsp;after build
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={engineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15,3 21,3 21,9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      </div>
    </nav>
  )
}

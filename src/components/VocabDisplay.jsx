/* ───────────────────────────────────────────────────
   VocabDisplay — Shows loading skeletons, error banner,
   empty state, or the vocabulary list
─────────────────────────────────────────────────── */

const AlertIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

function SkeletonRow({ index }) {
  const widths = ['65%', '55%', '75%', '50%', '70%', '60%']
  const w = widths[index % widths.length]
  return (
    <div className="skeleton-word-row" aria-hidden="true">
      <div className="skeleton-block" style={{ width: 24, flexShrink: 0 }} />
      <div className="skeleton-block" style={{ width: 120 }} />
      <div className="skeleton-block" style={{ width: 44 }} />
      <div className="skeleton-block" style={{ flex: 1, maxWidth: w }} />
    </div>
  )
}

function VocabCard({ entry, index, toggles }) {
  return (
    <article className="vocab-card" aria-label={`Vocabulary word: ${entry.word}`}>
      <div className="vocab-card-top">
        <span className="vocab-number" aria-hidden="true">{index + 1}.</span>
        <span className="vocab-word">{entry.word}</span>
        {toggles.showPos && entry.pos && (
          <span className="vocab-pos" role="note" aria-label={`Part of speech: ${entry.pos}`}>
            {entry.pos}
          </span>
        )}
      </div>

      {(toggles.showDefinition || toggles.showKorean || toggles.showAssociations) && (
        <div className="vocab-card-body">
          {toggles.showDefinition && entry.definition && (
            <p className="vocab-definition">{entry.definition}</p>
          )}
          {toggles.showKorean && entry.korean && (
            <p className="vocab-korean">
              <span className="vocab-korean-label">한국어:</span>
              {entry.korean}
            </p>
          )}
          {toggles.showAssociations && entry.associations && entry.associations.length > 0 && (
            <p className="vocab-associations">
              <span className="vocab-associations-label">Related:</span>
              {entry.associations.map((a, i) => (
                <span key={i} className="assoc-tag">{a}</span>
              ))}
            </p>
          )}
        </div>
      )}
    </article>
  )
}

export default function VocabDisplay({ vocabList, isLoading, errorMsg, toggles, wordCount }) {
  return (
    <section className="vocab-area" aria-label="Vocabulary list" aria-live="polite">

      {/* Error banner */}
      {errorMsg && !isLoading && (
        <div className="error-banner" role="alert">
          <AlertIcon />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="vocab-loading" aria-label="Loading vocabulary list…" role="status">
          {Array.from({ length: Math.min(wordCount, 8) }, (_, i) => (
            <SkeletonRow key={i} index={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && vocabList.length === 0 && !errorMsg && (
        <div className="vocab-empty" aria-label="No vocabulary generated yet">
          <div className="vocab-empty-icon" aria-hidden="true">✏️</div>
          <p className="vocab-empty-text">
            Enter a topic, choose your word count,<br />
            and hit <strong>Generate Homework</strong> to begin.
          </p>
        </div>
      )}

      {/* Vocab list */}
      {!isLoading && vocabList.length > 0 && (
        <div className="vocab-list" role="list" aria-label={`${vocabList.length} vocabulary words`}>
          {vocabList.map((entry, i) => (
            <VocabCard key={`${entry.word}-${i}`} entry={entry} index={i} toggles={toggles} />
          ))}
        </div>
      )}
    </section>
  )
}

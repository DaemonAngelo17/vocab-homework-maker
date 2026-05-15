/* ───────────────────────────────────────────────────
   FlashcardList — Renders the parsed vocab into 
   animated, "floating" cards with handwritten titles.
─────────────────────────────────────────────────── */

function Flashcard({ card, index, toggles }) {
  // We use CSS custom properties for the staggered delay
  const style = { '--card-index': index }

  return (
    <article className="flashcard" style={style} aria-label={`Flashcard for ${card.word}`}>
      <div className="flashcard-header">
        <span className="card-number">#{index + 1}</span>
        <h3 className="card-word-handwritten">{card.word}</h3>
        {toggles.showPos && card.pos && (
          <span className="card-pos-pill">{card.pos}</span>
        )}
      </div>

      <div className="flashcard-body">
        {toggles.showDefinition && card.definition && (
          <div className="card-row">
            <span className="card-label">Definition</span>
            <p className="card-text">{card.definition}</p>
          </div>
        )}

        {toggles.showKorean && card.korean && (
          <div className="card-row">
            <span className="card-label">Korean</span>
            <p className="card-text highlight-blue">{card.korean}</p>
          </div>
        )}

        {toggles.showAssociations && card.associations && card.associations.length > 0 && (
          <div className="card-row">
            <span className="card-label">Associations</span>
            <div className="card-tags">
              {card.associations.map((assoc, i) => (
                <span key={i} className="card-tag">{assoc}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Decorative card element */}
      <div className="card-decoration" />
    </article>
  )
}

export default function FlashcardList({ cards, toggles }) {
  if (!cards || cards.length === 0) return null

  return (
    <div className="flashcard-grid" role="list" aria-label="Vocabulary flashcards">
      {cards.map((card, i) => (
        <Flashcard key={`${card.word}-${i}`} card={card} index={i} toggles={toggles} />
      ))}
    </div>
  )
}

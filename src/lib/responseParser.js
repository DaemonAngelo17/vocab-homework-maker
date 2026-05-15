/* ───────────────────────────────────────────────────
   responseParser.js — Robustly parses raw AI text into
   structured vocabulary objects based on label patterns.
─────────────────────────────────────────────────── */

/**
 * parseAIResponse — Extracts word entries from raw text.
 * Expects format similar to:
 * 1. **Word:** serenity
 *    **Part of Speech:** noun
 *    ...
 *
 * @param {string} rawText
 * @returns {Array<{word, pos?, definition?, korean?, associations?}>}
 */
export function parseAIResponse(rawText) {
  if (!rawText.trim()) return []

  // Split by numbered list pattern (e.g. "1. ", "1) ", "Word 1:")
  // We use a lookahead to keep the numbers if needed, but here we just split
  const entries = rawText.split(/(?:\n|^)\s*\d+[.)]\s+/).filter(Boolean)
  
  return entries.map(entry => {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean)
    const obj = {}

    lines.forEach(line => {
      // 1. Check for "Word (POS) - Definition" pattern (Common AI format)
      const inlineMatch = line.match(/^([^(]+)\s*(?:\(([^)]+)\))?\s*[-:]\s*(.*)$/)
      if (inlineMatch && !obj.word) {
        obj.word = inlineMatch[1].trim()
        if (inlineMatch[2]) obj.pos = inlineMatch[2].trim()
        if (inlineMatch[3]) obj.definition = inlineMatch[3].trim()
        return
      }

      // 2. Check for explicit labels
      if (line.match(/\*\*Word:\*\*/i) || line.match(/Word:/i)) {
        obj.word = line.replace(/\*\*Word:\*\*/i, '').replace(/Word:/i, '').trim()
      } 
      else if (line.match(/\*\*Part of Speech:\*\*/i) || line.match(/Part of Speech:/i) || line.match(/\*\*POS:\*\*/i)) {
        obj.pos = line.replace(/\*\*Part of Speech:\*\*/i, '').replace(/Part of Speech:/i, '').replace(/\*\*POS:\*\*/i, '').trim()
      }
      else if (line.match(/\*\*Definition:\*\*/i) || line.match(/Definition:/i)) {
        obj.definition = line.replace(/\*\*Definition:\*\*/i, '').replace(/Definition:/i, '').trim()
      }
      else if (line.match(/\*\*Korean:\*\*/i) || line.match(/Korean:/i)) {
        obj.korean = line.replace(/\*\*Korean:\*\*/i, '').replace(/Korean:/i, '').trim()
      }
      else if (line.match(/\*\*Associations:\*\*/i) || line.match(/Associations:/i) || line.match(/\*\*Related:\*\*/i)) {
        const rawAssoc = line.replace(/\*\*Associations:\*\*/i, '').replace(/Associations:/i, '').replace(/\*\*Related:\*\*/i, '').trim()
        obj.associations = rawAssoc.split(',').map(s => s.trim()).filter(Boolean)
      }
      // 3. Fallback: If it's the first non-empty line and no word yet
      else if (!obj.word && line.length > 0) {
        obj.word = line.replace(/^\W+/, '').trim()
      }
    })

    return obj
  }).filter(o => o.word) // Must have a word to be valid
}

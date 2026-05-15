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

  // Split by any line that starts with a number followed by . or ) or :
  // We use a regex that handles potential group headers by splitting and then 
  // cleaning up each entry.
  const entries = rawText
    .split(/(?:\n|^)\s*\d+[\s.)-:]+\s*/)
    .map(e => e.trim())
    .filter(Boolean)
  
  return entries.map(entry => {
    const lines = entry.split('\n').map(l => l.trim()).filter(Boolean)
    const obj = {}

    lines.forEach(line => {
      // Ignore lines that look like group headers (e.g. "Group 1", "Week 2")
      if (line.match(/^(?:Group|Week|Unit|Set|Category|List)\s+\d+/i)) return

      // 1. Check for EXPLICIT LABELS first (more accurate)
      if (line.match(/\*\*Word:\*\*/i) || line.match(/^Word:/i)) {
        obj.word = line.replace(/\*\*Word:\*\*/i, '').replace(/^Word:/i, '').replace(/[*:]/g, '').trim()
        return
      } 
      
      if (line.match(/\*\*Part of Speech:\*\*/i) || line.match(/Part of Speech:/i) || line.match(/\*\*POS:\*\*/i)) {
        obj.pos = line.replace(/\*\*Part of Speech:\*\*/i, '').replace(/Part of Speech:/i, '').replace(/\*\*POS:\*\*/i, '').replace(/[*:]/g, '').trim()
        return
      }
      
      if (line.match(/\*\*Definition:\*\*/i) || line.match(/Definition:/i)) {
        obj.definition = line.replace(/\*\*Definition:\*\*/i, '').replace(/Definition:/i, '').replace(/[*:]/g, '').trim()
        return
      }
      
      if (line.match(/\*\*Korean:\*\*/i) || line.match(/Korean:/i)) {
        obj.korean = line.replace(/\*\*Korean:\*\*/i, '').replace(/Korean:/i, '').replace(/[*:]/g, '').trim()
        return
      }
      
      if (line.match(/\*\*Associations:\*\*/i) || line.match(/Associations:/i) || line.match(/\*\*Related:\*\*/i)) {
        const rawAssoc = line.replace(/\*\*Associations:\*\*/i, '').replace(/Associations:/i, '').replace(/\*\*Related:\*\*/i, '').replace(/[*:]/g, '').trim()
        obj.associations = rawAssoc.split(',').map(s => s.trim()).filter(Boolean)
        return
      }

      // 2. Check for "Word (POS) - Definition" pattern (only if no word yet)
      if (!obj.word) {
        const inlineMatch = line.match(/^([^(]+)\s*(?:\(([^)]+)\))?\s*[-:]\s*(.*)$/)
        // Ensure inlineMatch didn't just pick up a label
        if (inlineMatch && !inlineMatch[1].match(/^(?:Word|Definition|Korean|Associations|POS)$/i)) {
          obj.word = inlineMatch[1].replace(/[*]/g, '').trim()
          if (inlineMatch[2]) obj.pos = inlineMatch[2].replace(/[*]/g, '').trim()
          if (inlineMatch[3]) obj.definition = inlineMatch[3].replace(/[*]/g, '').trim()
          return
        }
      }

      // 3. Fallback: If it's the first non-empty line and no word yet
      if (!obj.word && line.length > 0) {
        obj.word = line.replace(/^\W+/, '').replace(/[*:]/g, '').trim()
      }
    })

    return obj
  }).filter(o => o.word && o.word.length > 1) 
}

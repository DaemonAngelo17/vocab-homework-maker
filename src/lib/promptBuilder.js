/* ───────────────────────────────────────────────────
   promptBuilder.js — Dynamically generates a detailed,
   structured prompt for any AI chat frontend.
─────────────────────────────────────────────────── */

/**
 * Returns the chat URL for the selected engine.
 */
export const ENGINE_URLS = {
  gemini: 'https://gemini.google.com/app',
  openai: 'https://chatgpt.com',
  claude:  'https://claude.ai/new',
}

export const ENGINE_LABELS = {
  gemini: 'Gemini',
  openai: 'ChatGPT',
  claude:  'Claude',
}

/**
 * buildPrompt — generates a rich, detailed AI prompt string.
 *
 * @param {{ topic: string, wordCount: number, toggles: object }} opts
 * @returns {string}
 */
export function buildPrompt({ topic, wordCount, toggles }) {
  const { showPos, showDefinition, showKorean, showAssociations } = toggles

  // ── Describe the requested output fields ──────────
  const fieldLines = []
  fieldLines.push(`   • **English Word** (always included)`)
  if (showPos)          fieldLines.push(`   • **Part of Speech** (e.g. noun, verb, adjective, adverb, idiom)`)
  if (showDefinition)   fieldLines.push(`   • **Definition** — a clear, learner-friendly English explanation (1–2 sentences max)`)
  if (showKorean)       fieldLines.push(`   • **Korean Translation** — the most natural Korean equivalent written in Hangul (한국어)`)
  if (showAssociations) fieldLines.push(`   • **Word Associations** — 3 to 5 closely related or thematically linked English words, comma-separated`)

  // ── Build the example block ────────────────────────
  const exampleLines = [`**Word:** serenity`]
  if (showPos)          exampleLines.push(`**Part of Speech:** noun`)
  if (showDefinition)   exampleLines.push(`**Definition:** The state of being calm, peaceful, and untroubled; a feeling of deep tranquility.`)
  if (showKorean)       exampleLines.push(`**Korean:** 평온 (平穩)`)
  if (showAssociations) exampleLines.push(`**Associations:** peace, tranquility, stillness, calm, harmony`)

  // ── Build the formatting rules ─────────────────────
  const formatRules = []
  formatRules.push(`- Number each word entry clearly (1. 2. 3. … ${wordCount}.)`)
  formatRules.push(`- Separate each word entry with a blank line for easy readability.`)
  formatRules.push(`- Use **bold labels** for each field (e.g. **Word:**, **Definition:**).`)
  formatRules.push(`- Do NOT include any introduction, preamble, or closing remarks — output the list only.`)
  formatRules.push(`- Do NOT repeat or reuse any word.`)
  formatRules.push(`- Ensure vocabulary is appropriate for intermediate-to-advanced ESL learners (B1–C1 level).`)
  formatRules.push(`- Words must be directly and meaningfully related to the topic.`)
  if (showDefinition) {
    formatRules.push(`- Definitions must be written in plain English — avoid using the word being defined inside the definition.`)
  }
  if (showKorean) {
    formatRules.push(`- Korean translations must be natural and contextually accurate — avoid literal/mechanical translations.`)
  }
  if (showAssociations) {
    formatRules.push(`- Word associations must be in English, not translations.`)
  }

  // ── Assemble the full prompt ───────────────────────
  const prompt = `
# 📚 Vocabulary Homework Generator Prompt

---

## Your Role

You are an expert ESL (English as a Second Language) vocabulary tutor and curriculum designer. Your task is to generate a high-quality, structured vocabulary homework sheet for a language learner.

---

## Task

Generate exactly **${wordCount} English vocabulary word${wordCount === 1 ? '' : 's'}** related to the topic:

> **"${topic}"**

---

## Required Fields Per Word

For each of the ${wordCount} words, include the following fields:

${fieldLines.join('\n')}

---

## Formatting Rules

${formatRules.join('\n')}

---

## Example Entry Format

${exampleLines.join('\n')}

---

## Begin the List Now

Generate exactly ${wordCount} word${wordCount === 1 ? '' : 's'} on the topic of **"${topic}"** following all the rules above.
`.trim()

  return prompt
}

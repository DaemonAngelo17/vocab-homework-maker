/* ───────────────────────────────────────────────────
   aiService.js — Handles API calls to OpenAI, Gemini,
   and Claude with structured JSON output parsing.
─────────────────────────────────────────────────── */

/**
 * Builds the system + user prompt for vocab generation.
 */
function buildPrompt(topic, wordCount, toggles) {
  const fields = ['word']
  if (toggles.showPos)          fields.push('pos (part of speech, e.g. noun, verb, adjective)')
  if (toggles.showDefinition)   fields.push('definition (clear, concise English definition)')
  if (toggles.showKorean)       fields.push('korean (Korean translation in Hangul)')
  if (toggles.showAssociations) fields.push('associations (array of 3–5 related words)')

  const schema = {
    word: 'string',
    ...(toggles.showPos          ? { pos: 'string' } : {}),
    ...(toggles.showDefinition   ? { definition: 'string' } : {}),
    ...(toggles.showKorean       ? { korean: 'string' } : {}),
    ...(toggles.showAssociations ? { associations: '["word1","word2","word3"]' } : {}),
  }

  return {
    system: `You are a professional ESL vocabulary teacher assistant. 
Your task is to generate a vocabulary list for English language learners.
Always respond with ONLY a valid JSON array — no markdown, no extra text.
Each element in the array must be an object with these fields: ${fields.join(', ')}.
Example schema for one word: ${JSON.stringify(schema)}`,
    user: `Generate exactly ${wordCount} English vocabulary words related to the topic: "${topic}".
Return ONLY the JSON array. No markdown code fences. No explanations.`,
  }
}

/**
 * Parse the raw string response from any AI into a JS array.
 * Handles markdown fences, stray text, etc.
 */
function parseResponse(raw) {
  // Strip markdown code fences if present
  let text = raw.trim()
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  // Find first '[' and last ']'
  const start = text.indexOf('[')
  const end   = text.lastIndexOf(']')
  if (start === -1 || end === -1) throw new Error('No JSON array found in AI response.')

  const jsonStr = text.slice(start, end + 1)
  try {
    const arr = JSON.parse(jsonStr)
    if (!Array.isArray(arr)) throw new Error('Response is not a JSON array.')
    return arr
  } catch {
    throw new Error('Failed to parse AI response as JSON. Please try again.')
  }
}

/* ─── OpenAI ─────────────────────────────────────── */
async function callOpenAI({ apiKey, prompt, signal }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user',   content: prompt.user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`OpenAI error ${res.status}: ${err?.error?.message || res.statusText}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

/* ─── Google Gemini ──────────────────────────────── */
async function callGemini({ apiKey, prompt, signal }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const res = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: prompt.system }],
      },
      contents: [
        { role: 'user', parts: [{ text: prompt.user }] },
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || res.statusText
    throw new Error(`Gemini error ${res.status}: ${msg}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

/* ─── Anthropic Claude ────────────────────────────── */
async function callClaude({ apiKey, prompt, signal }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      system: prompt.system,
      messages: [
        { role: 'user', content: prompt.user },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || res.statusText
    throw new Error(`Claude error ${res.status}: ${msg}`)
  }

  const data = await res.json()
  return data.content?.[0]?.text ?? ''
}

/* ─── Main Export ─────────────────────────────────── */
const ENGINE_MAP = {
  openai: callOpenAI,
  gemini: callGemini,
  claude: callClaude,
}

/**
 * generateVocab — unified entry point
 * @param {{ engine, apiKey, topic, wordCount, toggles, signal }} opts
 * @returns {Promise<Array<{word, pos?, definition?, korean?, associations?}>>}
 */
export async function generateVocab({ engine, apiKey, topic, wordCount, toggles, signal }) {
  const callFn = ENGINE_MAP[engine]
  if (!callFn) throw new Error(`Unknown AI engine: ${engine}`)

  const prompt = buildPrompt(topic, wordCount, toggles)
  const rawText = await callFn({ apiKey, prompt, signal })
  return parseResponse(rawText)
}

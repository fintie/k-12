// Minimal utilities used by QuestionBuilder
// Exports: normalize, parseCSV, safeSplit, toQuestionFromCSVRow, downloadFile, todayISO

function uid(prefix = '') {
  const s = Math.random().toString(36).slice(2, 8)
  const t = Date.now().toString(36).slice(-4)
  return (prefix ? prefix + '_' : '') + s + t
}

const ALLOWED_TYPES = new Set(['single', 'multiple', 'fill', 'short'])
// Canonical difficulties now use: easy | moderate | advanced
const ALLOWED_DIFFICULTY = new Set(['easy', 'moderate', 'advanced'])

export function normalize(raw = {}) {
  const type = ('' + (raw.type || 'single')).toLowerCase().trim()
  const qType = ALLOWED_TYPES.has(type) ? type : 'single'

  const base = {
    id: raw.id || uid('q'),
    prompt: (raw.prompt || '').toString().trim(),
    type: qType,
    explanation: (raw.explanation || '').toString().trim(),
    metadata: {
      grade: (raw.metadata?.grade ?? raw.grade ?? '').toString().trim(),
      subject: (raw.metadata?.subject ?? raw.subject ?? '').toString().trim(),
      difficulty: (() => {
        let d = (raw.metadata?.difficulty ?? raw.difficulty ?? 'easy').toString().toLowerCase().trim()
        // Accept synonyms: medium -> moderate; hard/advance/advanced -> advanced
        if (d === 'medium') d = 'moderate'
        if (d === 'hard' || d === 'advance' || d === 'advanced') d = 'advanced'
        return ALLOWED_DIFFICULTY.has(d) ? d : 'easy'
      })(),
      tags: normalizeTags(raw.metadata?.tags ?? raw.tags ?? []),
    },
  }

  if (qType === 'single' || qType === 'multiple') {
    const optIn = raw.options ?? []
    const strings = Array.isArray(optIn)
      ? optIn.map(o => (typeof o === 'string' ? o : (o?.text ?? '')))
      : []

    let options = strings
      .map(s => s.toString().trim())
      .filter(Boolean)
      .map((text) => ({ id: uid('opt'), text, correct: false }))

    if (Array.isArray(optIn) && optIn.length && typeof optIn[0] === 'object' && optIn[0] !== null && optIn[0].text !== undefined) {
      options = optIn.map(o => ({
        id: o.id || uid('opt'),
        text: (o.text || '').toString().trim(),
        correct: !!o.correct,
      })).filter(o => o.text)
    }

    const correctIdx = parseCorrectIndices(raw.correct)
    if (correctIdx.length) {
      options = options.map((o, i) => ({ ...o, correct: correctIdx.includes(i + 1) }))
    }

    if (qType === 'single' && !options.some(o => o.correct) && options.length) {
      options = options.map((o, i) => ({ ...o, correct: i === 0 }))
    }

    return { ...base, options }
  }

  const answersIn = raw.answers ?? []
  const answers = Array.isArray(answersIn)
    ? answersIn.map(a => (a ?? '').toString().trim()).filter(Boolean)
    : safeSplit((answersIn || '').toString(), '|').map(s => s.trim()).filter(Boolean)

  return { ...base, answers }
}

function normalizeTags(input) {
  if (Array.isArray(input)) return input.map(t => (t ?? '').toString().trim()).filter(Boolean)
  const s = (input || '').toString()
  return s.split(/[|,]/g).map(x => x.trim()).filter(Boolean)
}

function parseCorrectIndices(input) {
  if (!input && input !== 0) return []
  const s = ('' + input).trim()
  if (!s) return []
  const parts = s.split(/[;,|]/g)
  const nums = parts.map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n) && n > 0)
  return Array.from(new Set(nums)).sort((a, b) => a - b)
}

export function parseCSV(text, sep = ',') {
  if (!text) return { headers: [], rows: [] }
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
  const rawLines = text.split(/\r?\n/)
  const lines = rawLines.filter(l => l.trim().length > 0)
  if (!lines.length) return { headers: [], rows: [] }

  const headers = safeSplit(lines[0], sep).map(h => h.replace(/^\ufeff/, '').trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = safeSplit(lines[i], sep)
    while (cols.length < headers.length) cols.push('')
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').replace(/\r$/, '')
    })
    rows.push(obj)
  }
  return { headers, rows }
}

export function safeSplit(line, sep = ',') {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1]
        if (next === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === sep) {
        out.push(cur)
        cur = ''
      } else {
        cur += ch
      }
    }
  }
  out.push(cur)
  return out
}

export function toQuestionFromCSVRow(row) {
  const type = (row.type || 'single').toString().trim().toLowerCase()
  const base = {
    type,
    prompt: (row.prompt || '').toString(),
    explanation: (row.explanation || '').toString(),
    subject: (row.subject || '').toString(),
    grade: (row.grade || '').toString(),
    difficulty: (row.difficulty || '').toString(),
    tags: (row.tags || '').toString(),
  }

  const opts = (row.options || '').toString()
  const answers = (row.answers || '').toString()
  const correct = (row.correct || '').toString()

  const raw = {
    ...base,
    options: safeSplit(opts, '|'),
    answers: safeSplit(answers, '|'),
    correct,
  }

  return normalize(raw)
}

export function downloadFile(filename, content, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

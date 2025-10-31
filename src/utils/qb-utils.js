// Minimal utilities used by QuestionBuilder and shared question bank
// Exports: normalize, parseCSV, safeSplit, toQuestionFromCSVRow, downloadFile, todayISO
// New: QB_STORAGE_KEY, loadQuestionsFromStorage, saveQuestionsToStorage

function uid(prefix = '') {
  const s = Math.random().toString(36).slice(2, 8)
  const t = Date.now().toString(36).slice(-4)
  return (prefix ? prefix + '_' : '') + s + t
}

const ALLOWED_TYPES = new Set(['single', 'multiple', 'fill', 'short'])
// Canonical difficulties now use: easy | moderate | advanced
const ALLOWED_DIFFICULTY = new Set(['easy', 'moderate', 'advanced'])

function cleanString(value) {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

function normalizeMediaPath(value) {
  const str = cleanString(value)
  if (!str) return ''
  if (str.startsWith('data:')) return str
  return str.replace(/\\/g, '/')
}

function extractImageSource(value) {
  const str = cleanString(value)
  if (!str) return ''
  const dataIdx = str.indexOf('data:')
  if (dataIdx >= 0) return str.slice(dataIdx)
  return normalizeMediaPath(str)
}
function splitLabelAndImage(segment) {
  const trimmed = cleanString(segment)
  if (!trimmed) return { label: '', image: '' }

  const dataIdx = trimmed.indexOf('data:')
  if (dataIdx >= 0) {
    const before = trimmed.slice(0, dataIdx)
    const labelMatch = before.match(/([A-Za-z]{1,3})\s*$/)
    const label = labelMatch ? labelMatch[1].toUpperCase() : ''
    const image = trimmed.slice(dataIdx)
    return { label, image }
  }

  const separatorIndex = Math.max(trimmed.indexOf(':'), trimmed.indexOf('='))
  if (separatorIndex > 0) {
    const labelCandidate = trimmed.slice(0, separatorIndex).trim()
    const remainder = trimmed.slice(separatorIndex + 1).trim()
    if (/^[A-Za-z]{1,3}$/.test(labelCandidate)) {
      return { label: labelCandidate.toUpperCase(), image: remainder }
    }
  }

  return { label: '', image: trimmed }
}


function optionLabelForIndex(index) {
  let n = index
  let label = ''
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label
    n = Math.floor(n / 26) - 1
  }
  return label || 'A'
}

export function normalize(raw = {}) {
  const type = ('' + (raw.type || 'single')).toLowerCase().trim()
  const qType = ALLOWED_TYPES.has(type) ? type : 'single'

  const promptImage = normalizeMediaPath(raw.promptImage ?? raw.prompt_image ?? raw.stemImage ?? raw.stem_image)
  const questionImage = normalizeMediaPath(raw.questionImage ?? raw.question_image ?? '')

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
    promptImage,
    questionImage,
  }

  if (qType === 'single' || qType === 'multiple') {
    const optRaw = raw.options
    const optionArray = Array.isArray(optRaw)
      ? optRaw
      : typeof optRaw === 'string'
        ? safeSplit(optRaw, '|')
        : []

    const textOptions = optionArray.map((entry, idx) => {
      if (typeof entry === 'string') {
        return {
          id: uid('opt'),
          text: cleanString(entry),
          label: optionLabelForIndex(idx),
          image: '',
          correct: false,
        }
      }
      if (entry && typeof entry === 'object') {
        return {
          id: entry.id || uid('opt'),
          text: cleanString(entry.text ?? entry.label ?? ''),
          label: cleanString(entry.label ?? entry.option ?? '').toUpperCase() || optionLabelForIndex(idx),
          image: extractImageSource(entry.image ?? entry.url ?? ''),
          correct: !!entry.correct,
        }
      }
      return {
        id: uid('opt'),
        text: '',
        label: optionLabelForIndex(idx),
        image: '',
        correct: false,
      }
    })

    const imageEntries = parseOptionImagesInput(raw.optionImages ?? raw.option_images)
    const labeledImages = new Map()
    const unlabeledImages = []
    imageEntries.forEach((entry, idx) => {
      const label = cleanString(entry?.label ?? '').toUpperCase()
      const image = extractImageSource(entry?.image ?? entry?.url ?? '')
      if (!image) return
      if (label) {
        if (!labeledImages.has(label)) labeledImages.set(label, image)
      } else {
        unlabeledImages.push(image)
      }
    })

    const usedLabels = new Set()
    const options = []
    const maxLen = Math.max(textOptions.length, labeledImages.size + unlabeledImages.length)

    for (let i = 0; i < maxLen; i++) {
      const baseOpt = textOptions[i] || {
        id: uid('opt'),
        text: '',
        label: optionLabelForIndex(i),
        image: '',
        correct: false,
      }

      let label = cleanString(baseOpt.label || '').toUpperCase()
      if (!label) label = optionLabelForIndex(i)
      if (usedLabels.has(label)) {
        let fallback = optionLabelForIndex(options.length)
        while (usedLabels.has(fallback)) {
          fallback = optionLabelForIndex(options.length + 1)
        }
        label = fallback
      }
      usedLabels.add(label)

      let image = ''
      if (labeledImages.has(label)) {
        image = labeledImages.get(label)
        labeledImages.delete(label)
      } else if (baseOpt.image) {
        image = baseOpt.image
      } else if (unlabeledImages.length) {
        image = unlabeledImages.shift()
      }

      options.push({
        id: baseOpt.id || uid('opt'),
        text: baseOpt.text || '',
        label,
        image,
        correct: !!baseOpt.correct,
      })
    }

    for (const [label, image] of labeledImages.entries()) {
      if (!image) continue
      let finalLabel = label
      while (usedLabels.has(finalLabel)) {
        finalLabel = optionLabelForIndex(options.length)
      }
      usedLabels.add(finalLabel)
      options.push({
        id: uid('opt'),
        text: '',
        label: finalLabel,
        image,
        correct: false,
      })
    }

    while (unlabeledImages.length) {
      let label = optionLabelForIndex(options.length)
      while (usedLabels.has(label)) {
        label = optionLabelForIndex(options.length + 1)
      }
      usedLabels.add(label)
      options.push({
        id: uid('opt'),
        text: '',
        label,
        image: unlabeledImages.shift(),
        correct: false,
      })
    }

    const correctIdx = parseCorrectIndices(raw.correct)
    const correctLabels = new Set()
    const correctRaw = cleanString(raw.correct || '')
    correctRaw.split(/[;,|]/g).forEach(part => {
      const trimmed = part.trim().toUpperCase()
      if (/^[A-Z]+$/.test(trimmed)) correctLabels.add(trimmed)
    })
    const answerRaw = cleanString(raw.answer || '')
    answerRaw.split(/[;,|]/g).forEach(part => {
      const trimmed = part.trim().toUpperCase()
      if (/^[A-Z]+$/.test(trimmed)) correctLabels.add(trimmed)
    })

    options.forEach((opt, idx) => {
      const indexMatch = correctIdx.includes(idx + 1)
      const labelMatch = correctLabels.has(opt.label?.toUpperCase())
      opt.correct = opt.correct || indexMatch || labelMatch
    })

    if (qType === 'single' && !options.some(o => o.correct) && options.length) {
      options[0].correct = true
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
  const rawLines = text.split(/\\r?\\n/)
  const lines = rawLines.filter(l => l.trim().length > 0)
  if (!lines.length) return { headers: [], rows: [] }

  const headers = safeSplit(lines[0], sep).map(h => h.replace(/^\\ufeff/, '').trim().toLowerCase())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = safeSplit(lines[i], sep)
    while (cols.length < headers.length) cols.push('')
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (cols[idx] ?? '').replace(/\\r$/, '')
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

function parseOptionImagesInput(input) {
  if (!input && input !== 0) return [];

  const toEntry = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value === 'string') {
      const { label, image } = splitLabelAndImage(value);
      const normalized = extractImageSource(image);
      if (!normalized) return null;
      return {
        label: label ? label.toUpperCase() : '',
        image: normalized,
      };
    }
    if (typeof value === 'object') {
      const label = cleanString(value.label ?? value.option ?? value.key ?? '');
      const image = extractImageSource(value.image ?? value.url ?? value.path ?? '');
      const text = cleanString(value.text ?? '');
      if (!image && !text) return null;
      const entry = {
        label: label ? label.toUpperCase() : '',
        image,
        text,
      };
      if (value.id) entry.id = value.id;
      if (value.correct !== undefined) entry.correct = !!value.correct;
      return entry;
    }
    return null;
  };

  if (Array.isArray(input)) {
    return input.map(toEntry).filter(Boolean);
  }

  if (typeof input === 'string') {
    return safeSplit(input, '|').map(toEntry).filter(Boolean);
  }

  return [];
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

// Shared Question Bank helpers (localStorage-backed)
export const QB_STORAGE_KEY = 'qb_questions_v1'

export function loadQuestionsFromStorage() {
  try {
    const raw = localStorage.getItem(QB_STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.map(item => normalize(item))
  } catch {
    return []
  }
}

export function saveQuestionsToStorage(list = []) {
  try {
    const norm = Array.isArray(list) ? list.map(item => normalize(item)) : []
    localStorage.setItem(QB_STORAGE_KEY, JSON.stringify(norm))
    return true
  } catch {
    return false
  }
}






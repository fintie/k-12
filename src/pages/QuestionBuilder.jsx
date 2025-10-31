import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { downloadFile, normalize, parseCSV, safeSplit, todayISO, toQuestionFromCSVRow } from '@/utils/qb-utils'

const TYPES = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multiple', label: 'Multiple Choice' },
  { value: 'fill', label: 'Fill-in' },
  { value: 'short', label: 'Short Answer' },
]

const DIFF = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'advanced', label: 'Advanced' },
]

const SUBJECTS = ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Pre-Algebra', 'Trigonometry']

function sanitizeMediaPath(input) {
  if (input === undefined || input === null) return ''
  const trimmed = String(input).trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('data:')) return trimmed
  return trimmed.replace(/\\/g, '/')
}

function splitLabelAndImageSegment(segment) {
  const trimmed = String(segment ?? '').trim()
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

function optionLabelForIndex(idx) {
  let n = idx
  let label = ''
  while (n >= 0) {
    label = String.fromCharCode((n % 26) + 65) + label
    n = Math.floor(n / 26) - 1
  }
  return label || 'A'
}

function normalizeImageValue(input) {
  const sanitized = sanitizeMediaPath(input)
  if (!sanitized) return ''
  const dataIdx = sanitized.indexOf('data:')
  if (dataIdx >= 0) return sanitized.slice(dataIdx)
  return sanitized
}

function parseOptionImagesField(value) {
  if (!value && value !== 0) return []

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return null
        const label = (item.label || '').toString().trim().toUpperCase()
        const image = normalizeImageValue(item.image ?? item.url ?? item.path ?? '')
        if (!image) return null
        return { label, image }
      })
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        return parseOptionImagesField(parsed)
      } catch {
        // fall through to legacy parsing
      }
    }
    return safeSplit(trimmed, '|')
      .map(chunk => {
        const { label, image } = splitLabelAndImageSegment(chunk)
        const normalized = normalizeImageValue(image)
        if (!normalized) return null
        return { label: label ? label.toUpperCase() : '', image: normalized }
      })
      .filter(Boolean)
  }

  return []
}

function stringifyOptionImages(options = []) {
  if (!Array.isArray(options)) return []
  return options
    .filter(opt => opt && opt.image)
    .map((opt, idx) => ({
      label: (opt.label || optionLabelForIndex(idx)).toUpperCase(),
      image: normalizeImageValue(opt.image),
    }))
}

function ImagePicker({ id, label, value, onChange, description, allowClear = true }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const applyValue = useCallback((next) => {
    if (typeof onChange === 'function') onChange(next || '')
  }, [onChange])

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.type || !file.type.startsWith('image/')) {
      alert('Only image files are supported')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      applyValue(reader.result?.toString() || '')
    }
    reader.onerror = () => {
      alert('Failed to load image. Please try again.')
    }
    reader.readAsDataURL(file)
  }, [applyValue])

  const handleItems = useCallback((items) => {
    if (!items) return false
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile()
        if (file) {
          handleFile(file)
          return true
        }
      }
    }
    return false
  }, [handleFile])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setDragOver(false)
    const dt = event.dataTransfer
    if (handleItems(dt?.items)) return
    if (dt?.files?.length) {
      handleFile(dt.files[0])
    }
  }, [handleFile, handleItems])

  const handlePaste = useCallback((event) => {
    if (handleItems(event.clipboardData?.items)) {
      event.preventDefault()
    }
  }, [handleItems])

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const preview = value ? value.toString() : ''

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) handleFile(file)
          event.target.value = ""
        }}
      />
      {!value && (
        <div
          id={id}
          className={`border border-dashed rounded-md px-4 py-3 text-sm text-center transition-colors ${dragOver ? "bg-indigo-50 border-indigo-400" : "bg-slate-50 border-slate-300"}`}
          onDragOver={(event) => { event.preventDefault(); setDragOver(true) }}
          onDragLeave={(event) => { event.preventDefault(); setDragOver(false) }}
          onDrop={handleDrop}
          onPaste={handlePaste}
          tabIndex={0}
        >
          <div className="font-medium text-slate-700">{label}</div>
          <div className="mt-1 text-xs text-slate-500">Drag, paste, or choose an image</div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={openFileDialog}>Choose image</Button>
          </div>
        </div>
      )}
      {value && (
        <div className="flex items-center justify-between gap-3 rounded border bg-white p-2">
          <div className="h-20 w-20 overflow-hidden rounded border bg-slate-50">
            <img src={preview} alt={`${label} preview`} className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" variant="outline" onClick={openFileDialog}>Replace image</Button>
            {allowClear && (
              <Button type="button" size="sm" variant="ghost" onClick={() => applyValue("")}>Remove</Button>
            )}
          </div>
        </div>
      )}
      {description && <p className="text-xs text-slate-500">{description}</p>}
    </div>
  )
}

function emptyForm(type = 'single') {
  return {
    type,
    prompt: '',
    promptImage: '',
    questionImage: '',
    options: '',
    optionImages: [],
    answers: '',
    correct: '',
    explanation: '',
    subject: '',
    grade: '',
    difficulty: 'easy',
    tags: '',
  }
}

export default function QuestionBuilder() {
  // Local persistence keys
  const LS = {
    form: 'qb_form_v1',
    questions: 'qb_questions_v1',
    replaceMode: 'qb_replace_v1',
    tab: 'qb_tab_v1',
    editing: 'qb_editing_v1',
    filterSubject: 'qb_filter_subject_v1',
    filterDifficulty: 'qb_filter_difficulty_v1',
  }

  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(LS.questions)
      if (saved) {
        const list = JSON.parse(saved)
        if (Array.isArray(list)) return list.map(item => normalize(item))
      }
    } catch {}
    return []
  })
  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem(LS.tab) || 'import' } catch { return 'import' }
  })
  const [replaceMode, setReplaceMode] = useState(() => {
    try { const v = localStorage.getItem(LS.replaceMode); return v ? v === 'true' : false } catch { return false }
  })
  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(LS.form)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed.optionImages === 'string') {
          parsed.optionImages = parseOptionImagesField(parsed.optionImages)
        }
        return { ...emptyForm('single'), ...parsed }
      }
    } catch {}
    return emptyForm('single')
  })
  const [editingId, setEditingId] = useState(() => {
    try { return localStorage.getItem(LS.editing) || null } catch { return null }
  })
  const fileRef = useRef()

  // Manage filters
  const [filterSubject, setFilterSubject] = useState(() => {
    try { return localStorage.getItem(LS.filterSubject) || '' } catch { return '' }
  })
  const [filterDifficulty, setFilterDifficulty] = useState(() => {
    try { return localStorage.getItem(LS.filterDifficulty) || '' } catch { return '' }
  })

  const onChange = useCallback((field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      try { localStorage.setItem(LS.form, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const payload = useMemo(() => ({ questions }), [questions])
  const subjectsForFilter = useMemo(() => {
    const set = new Set(SUBJECTS)
    questions.forEach(q => {
      const s = q?.metadata?.subject
      if (s) set.add(s)
    })
    return Array.from(set)
  }, [questions])
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const sOk = !filterSubject || (q.metadata?.subject || '') === filterSubject
      const dOk = !filterDifficulty || (q.metadata?.difficulty || '') === filterDifficulty
      return sOk && dOk
    })
  }, [questions, filterSubject, filterDifficulty])

  const optionImageEntries = useMemo(() => parseOptionImagesField(form.optionImages), [form.optionImages])

  const optionTextEntries = useMemo(() => {
    return safeSplit(form.options || '', '|').map((raw, idx) => ({
      label: optionLabelForIndex(idx),
      text: (raw || '').toString().trim(),
    }))
  }, [form.options])

  const optionTextMap = useMemo(() => {
    const map = new Map()
    optionTextEntries.forEach(entry => {
      map.set(entry.label.toUpperCase(), entry.text)
    })
    return map
  }, [optionTextEntries])

  const optionImageMap = useMemo(() => {
    const map = new Map()
    optionImageEntries.forEach(entry => {
      const key = (entry.label || '').toUpperCase()
      if (key && entry.image) map.set(key, entry.image)
    })
    return map
  }, [optionImageEntries])

  const imageLabels = useMemo(() => {
    const base = Math.max(optionTextEntries.length, optionImageEntries.length + 1, 1)
    return Array.from({ length: base }, (_, idx) => optionLabelForIndex(idx))
  }, [optionTextEntries.length, optionImageEntries.length])

  const [manualOptionImageLabel, setManualOptionImageLabel] = useState('')

  const firstMissingImageLabel = useMemo(() => {
    return imageLabels.find((label) => {
      const key = label.toUpperCase()
      return !optionImageMap.has(key)
    }) || ''
  }, [imageLabels, optionImageMap])

  const activeOptionImageLabel = useMemo(() => {
    const manual = (manualOptionImageLabel || '').toUpperCase()
    if (manual && imageLabels.includes(manual)) {
      return manual
    }
    return firstMissingImageLabel
  }, [firstMissingImageLabel, imageLabels, manualOptionImageLabel])

  const activeOptionHasImage = Boolean(activeOptionImageLabel && optionImageMap.has(activeOptionImageLabel))
  const activeOptionText = activeOptionImageLabel ? (optionTextMap.get(activeOptionImageLabel) || '') : ''

  useEffect(() => {
    if (!manualOptionImageLabel) return
    if (!imageLabels.includes(manualOptionImageLabel)) {
      setManualOptionImageLabel('')
    }
  }, [imageLabels, manualOptionImageLabel, setManualOptionImageLabel])

  const setOptionImage = useCallback((label, src) => {
    const upper = label.toUpperCase()
    const sanitized = normalizeImageValue(src)
    const entries = [...optionImageEntries]
    const existingIndex = entries.findIndex(entry => (entry.label || '').toUpperCase() === upper)

    if (!sanitized) {
      if (existingIndex !== -1) {
        entries.splice(existingIndex, 1)
      }
    } else if (existingIndex !== -1) {
      entries[existingIndex] = { label: upper, image: sanitized }
    } else {
      entries.push({ label: upper, image: sanitized })
    }

    onChange('optionImages', entries)
    setManualOptionImageLabel('')
  }, [onChange, optionImageEntries, setManualOptionImageLabel])


  // Persist on change
  useEffect(() => { try { localStorage.setItem(LS.form, JSON.stringify(form)) } catch {} }, [form])
  // Ensure latest draft is saved on unmount (e.g., fast navigation)
  useEffect(() => {
    return () => {
      try { localStorage.setItem(LS.form, JSON.stringify(form)) } catch {}
    }
  }, [form])
  useEffect(() => { try { localStorage.setItem(LS.questions, JSON.stringify(questions)) } catch {} }, [questions])
  useEffect(() => { try { localStorage.setItem(LS.replaceMode, String(replaceMode)) } catch {} }, [replaceMode])
  useEffect(() => { try { localStorage.setItem(LS.tab, activeTab) } catch {} }, [activeTab])
  useEffect(() => { try { editingId ? localStorage.setItem(LS.editing, editingId) : localStorage.removeItem(LS.editing) } catch {} }, [editingId])
  useEffect(() => { try { localStorage.setItem(LS.filterSubject, filterSubject) } catch {} }, [filterSubject])
  useEffect(() => { try { localStorage.setItem(LS.filterDifficulty, filterDifficulty) } catch {} }, [filterDifficulty])

function addOrUpdate() {
  const raw = {
    ...form,
    options: safeSplit(form.options || '', '|'),
    answers: safeSplit(form.answers || '', '|'),
    optionImages: parseOptionImagesField(form.optionImages),
    promptImage: sanitizeMediaPath(form.promptImage),
    questionImage: sanitizeMediaPath(form.questionImage),
  }
  const q = normalize(raw)
  if (editingId) {
    setQuestions(prev => prev.map(it => it.id === editingId ? { ...q, id: editingId } : it))
    setEditingId(null)
    } else {
      setQuestions(prev => [...prev, q])
  }
  const cleared = emptyForm(form.type)
  setForm(cleared)
  try { localStorage.setItem(LS.form, JSON.stringify(cleared)) } catch {}
}

  function onEdit(q) {
    // Enter edit mode and jump to the Add Question tab
    setEditingId(q.id)
    setActiveTab('import')
    const type = q.type
    const options = Array.isArray(q.options) ? q.options.map(o => o.text).join('|') : ''
    const correct = Array.isArray(q.options) ? q.options.flatMap((o, idx) => o.correct ? [String(idx + 1)] : []).join(',') : ''
  const answers = Array.isArray(q.answers) ? q.answers.join('|') : ''
  const tags = (q.metadata?.tags || []).join(',')
  const optionImages = stringifyOptionImages(q.options || [])
  setForm({
    type,
    prompt: q.prompt || '',
    promptImage: sanitizeMediaPath(q.promptImage),
    questionImage: sanitizeMediaPath(q.questionImage),
    options,
    optionImages,
    answers,
    correct,
    explanation: q.explanation || '',
    subject: q.metadata?.subject || '',
    grade: q.metadata?.grade || '',
      difficulty: q.metadata?.difficulty || 'easy',
      tags,
    })
    // Ensure the form is visible to the user
    try { localStorage.setItem('qb_tab_v1', 'import') } catch {}
    setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
    }, 0)
  }

  function onDelete(id) {
    if (confirm('Delete this question?')) {
      setQuestions(prev => prev.filter(q => q.id !== id))
      if (editingId === id) {
        setEditingId(null)
        setForm(emptyForm('single'))
      }
    }
  }

  async function onImportFile(ev) {
    const file = ev.target.files && ev.target.files[0]
    if (!file) return
    const text = await file.text()
    try {
      let imported = []
      const name = file.name.toLowerCase()
      const looksJSON = name.endsWith('.json') || text.trim().startsWith('{') || text.trim().startsWith('[')
      if (looksJSON) {
        const data = JSON.parse(text)
        const list = Array.isArray(data) ? data : Array.isArray(data.questions) ? data.questions : []
        imported = list.map(q => normalize(q))
      } else {
        const sep = name.endsWith('.tsv') ? '\t' : ','
        const { rows } = parseCSV(text, sep)
        imported = rows.map(r => toQuestionFromCSVRow(r)).filter(q => q.prompt)
      }
      if (!imported.length) { alert('No questions found.'); ev.target.value = ''; return }
      setQuestions(prev => replaceMode ? imported : [...prev, ...imported])
      ev.target.value = ''
    } catch (err) {
      console.error(err)
      alert('Import failed. Ensure valid JSON/CSV.')
      ev.target.value = ''
    }
  }

  function onExportJSON() {
    const name = `question_set_${todayISO()}.json`
    downloadFile(name, JSON.stringify(payload, null, 2), 'application/json')
  }

  async function onCopyJSON() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
      alert('JSON copied.')
    } catch (e) {
      alert('Copy failed: clipboard permission.')
    }
  }

function onDownloadCSVTemplate() {
  const header = ['type','prompt','options','answers','explanation','subject','grade','difficulty','tags','correct']
  const row1 = ['single','What is 2+3?','4|5|6','', 'Addition basics','Math','3','easy','arithmetic,addition','2']
  const row2 = ['fill','Solve x^2 = 9','', '3|-3','Square roots','Math','7','moderate','algebra,equations','']
  const escape = (v) => {
      const s = String(v ?? '')
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const csv = [header, row1, row2].map(arr => arr.map(escape).join(',')).join('\n')
  downloadFile('question_template.csv', csv, 'text/csv')
}

  const clearAllCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      const proceed = window.confirm('This will remove all saved questions and drafts. Continue?')
      if (!proceed) return
    }
    if (typeof localStorage === 'undefined') return
    const keys = [
      'qb_form_v1',
      'qb_questions_v1',
      'qb_replace_v1',
      'qb_tab_v1',
      'qb_editing_v1',
      'qb_filter_subject_v1',
      'qb_filter_difficulty_v1',
    ]
    try {
      keys.forEach((key) => {
        try { localStorage.removeItem(key) } catch {}
      })
    } catch {}
    setQuestions([])
    setForm(emptyForm('single'))
    setReplaceMode(false)
    setActiveTab('import')
    setEditingId(null)
    setFilterSubject('')
    setFilterDifficulty('')
    setManualOptionImageLabel('')
    try { alert('Saved Question Builder data cleared.') } catch {}
  }, [setManualOptionImageLabel])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Builder</h1>
          <p className="text-slate-600 mt-1">Create questions or import via JSON/CSV template</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearAllCache} className="self-start sm:self-auto">
          Clear saved data
        </Button>
      </div>

      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Import new questions
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Manage questions
          </button>
        </nav>
      </div>

      {activeTab === 'import' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Question' : 'Add New Question'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
              <Label className="mb-1 block">Type</Label>
              <select
                className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={form.type}
                onChange={e => {
                  const next = emptyForm(e.target.value)
                  setForm(next)
                  try { localStorage.setItem('qb_form_v1', JSON.stringify(next)) } catch {}
                }}
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
                </div>
                <div>
                  <Label className="mb-1 block">Difficulty</Label>
                  <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.difficulty} onChange={e => onChange('difficulty', e.target.value)}>
                    {DIFF.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="mb-1 block">Subject</Label>
                  <Select value={form.subject} onValueChange={(v) => onChange('subject', v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1 block">Grade</Label>
                  <Input value={form.grade} onChange={e => onChange('grade', e.target.value)} placeholder="e.g., 7" />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Prompt</Label>
                  <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} value={form.prompt} onChange={e => onChange('prompt', e.target.value)} placeholder="Enter the question prompt" />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Prompt Image</Label>
                  <ImagePicker
                    id="prompt-image"
                    label="Prompt image"
                    value={form.promptImage}
                    onChange={(src) => onChange('promptImage', src)}
                    description="Upload, drag, or paste an image to pair with the prompt."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Reference Image</Label>
                  <ImagePicker
                    id="question-image"
                    label="Reference image"
                    value={form.questionImage}
                    onChange={(src) => onChange('questionImage', src)}
                    description="Ideal for full-question screenshots or supporting diagrams."
                  />
                </div>
                {(form.type === 'single' || form.type === 'multiple') && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Options (| separated)</Label>
                      <Input value={form.options} onChange={e => onChange('options', e.target.value)} placeholder="A|B|C|D" />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <Label className="mb-1 block">Option images (optional)</Label>
                        <p className="text-xs text-slate-500">
                          Add option visuals via upload, drag & drop, or paste from your clipboard. Images can stand alone without option text; ordering follows upload order.
                        </p>
                      </div>
                      <div className="space-y-3">
                        {imageLabels.map((optLabel) => {
                          const labelKey = optLabel.toUpperCase()
                          const currentImage = optionImageMap.get(labelKey)
                          if (!currentImage) return null
                          const optText = optionTextMap.get(labelKey) || ''
                          return (
                            <div key={optLabel} className="flex items-center justify-between gap-3 rounded-md border bg-white p-3">
                              <div className="flex items-center gap-3">
                                <div className="h-16 w-16 overflow-hidden rounded border bg-slate-50">
                                  <img src={currentImage} alt={`Option ${optLabel}`} className="h-full w-full object-contain" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-700">Option {optLabel}</div>
                                  {optText && <div className="text-xs text-slate-500 truncate">{optText}</div>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={() => setManualOptionImageLabel(optLabel.toUpperCase())}>Replace</Button>
                                <Button type="button" size="sm" variant="ghost" onClick={() => setOptionImage(optLabel, '')}>Remove</Button>
                              </div>
                            </div>
                          )
                        })}
                        {activeOptionImageLabel && (
                          <div className="rounded-md border border-dashed bg-slate-50 p-3 space-y-2">
                            <div className="text-sm font-medium text-slate-700">
                              {activeOptionHasImage ? `Replace image for option ${activeOptionImageLabel}` : `Option ${activeOptionImageLabel}`}
                              {activeOptionText ? `: ${activeOptionText}` : ''}
                            </div>
                            <ImagePicker
                              id={`option-image-${activeOptionImageLabel}`}
                              label={activeOptionHasImage ? `Choose a new image for option ${activeOptionImageLabel}` : `Add image for option ${activeOptionImageLabel}`}
                              value=""
                              onChange={(src) => setOptionImage(activeOptionImageLabel, src)}
                              allowClear={false}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Correct indices (1-based; , ; |)</Label>
                      <Input value={form.correct} onChange={e => onChange('correct', e.target.value)} placeholder={form.type === 'single' ? 'e.g., 2' : 'e.g., 1,3'} />
                    </div>
                  </>
                )}
                {(form.type === 'fill' || form.type === 'short') && (
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">Accepted answers (| separated)</Label>
                    <Input value={form.answers} onChange={e => onChange('answers', e.target.value)} placeholder={form.type === 'fill' ? '3|-3' : 'keywords or rubric'} />
                  </div>
                )}
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Explanation</Label>
                  <textarea className="w-full border rounded px-3 py-2 text-sm" rows={2} value={form.explanation} onChange={e => onChange('explanation', e.target.value)} placeholder="Explain the correct answer(s)" />
                </div>
                <div className="md:col-span-2">
                  <Label className="mb-1 block">Tags (comma or |)</Label>
                  <Input value={form.tags} onChange={e => onChange('tags', e.target.value)} placeholder="algebra,equations" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={addOrUpdate}>{editingId ? 'Save Changes' : 'Add Question'}</Button>
                {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm('single')) }}>Cancel</Button>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Import (.json/.csv) data into the builder.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 items-center">
                <label className="inline-flex items-center gap-2 text-sm px-3 py-2 border rounded cursor-pointer">
                  <span>Import (.json/.csv)</span>
                  <input type="file" ref={fileRef} accept=".json,.csv,.tsv,application/json,text/csv" onChange={onImportFile} className="hidden" />
                </label>
                <label className="ml-2 inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={replaceMode} onChange={e => { setReplaceMode(e.target.checked); try { localStorage.setItem('qb_replace_v1', String(e.target.checked)) } catch {} }} />
                  Replace existing on import
                </label>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'manage' && (
          <Card>
            <CardHeader>
              <CardTitle>Manage Questions ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end gap-3 mb-4">
                <div className="min-w-[200px]">
                  <Label className="mb-1 block text-xs">Subject</Label>
                  <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)}>
                    <option value="">All subjects</option>
                    {subjectsForFilter.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="min-w-[200px]">
                  <Label className="mb-1 block text-xs">Difficulty</Label>
                  <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                    <option value="">All levels</option>
                    {DIFF.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-6">
                  <Button variant="outline" onClick={() => { setFilterSubject(''); setFilterDifficulty('') }}>Reset</Button>
                </div>
                <div className="pt-6 text-sm text-slate-500">Filtered: {filteredQuestions.length}</div>
              </div>
              {questions.length === 0 && (
                <div className="text-sm text-slate-600">No questions yet. Import via CSV/JSON in the Import tab.</div>
              )}
              <ul className="space-y-3">
                {filteredQuestions.map((q, idx) => (
                  <li key={q.id} className="border rounded p-3 bg-white">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-sm text-slate-500">#{idx + 1} - {q.type} - {q.metadata?.subject || '-'} - {q.metadata?.difficulty || 'easy'}</div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(q)}>Edit</Button>
                        <Button variant="outline" size="sm" onClick={() => onDelete(q.id)}>Delete</Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      {(q.questionImage || q.promptImage) && (
                        <div className="flex flex-wrap gap-4 mb-2">
                          {q.questionImage && (
                            <img
                              src={q.questionImage}
                              alt="Question reference"
                              className="max-h-40 rounded border bg-white object-contain"
                              onError={(event) => {
                                console.warn('Question image failed to render', {
                                  questionId: q.id,
                                  type: 'reference',
                                  preview: (q.questionImage || '').slice(0, 120),
                                })
                                event.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                          {q.promptImage && (
                            <img
                              src={q.promptImage}
                              alt="Prompt visual"
                              className="max-h-40 rounded border bg-white object-contain"
                              onError={(event) => {
                                console.warn('Question image failed to render', {
                                  questionId: q.id,
                                  type: 'prompt',
                                  preview: (q.promptImage || '').slice(0, 120),
                                })
                                event.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                        </div>
                      )}
                      {q.prompt && <div className="font-medium mb-1">{q.prompt}</div>}
                      {(q.type === 'single' || q.type === 'multiple') && (
                        <ol className="list-decimal ml-5 space-y-1">
                          {q.options.map((o) => (
                            <li key={o.id} className={o.correct ? 'font-semibold text-green-700' : ''}>
                              <div className="flex flex-col gap-1">
                                {o.image && (
                                  <img
                                    src={o.image}
                                    alt={`Option ${o.label || ''}`.trim() || 'Option image'}
                                    className="max-h-32 w-auto rounded border bg-white object-contain"
                                    onError={(event) => {
                                      console.warn('Option image failed to render', {
                                        questionId: q.id,
                                        label: o.label,
                                        preview: (o.image || '').slice(0, 120),
                                      })
                                      event.currentTarget.style.display = 'none'
                                    }}
                                  />
                                )}
                                <span>
                                  {o.text || (o.image ? `(Image ${o.label || ''})` : '')}
                                  {o.correct && <span className="ml-2 text-xs border rounded-full px-2 py-0.5">correct</span>}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                      {(q.type === 'fill' || q.type === 'short') && q.answers?.length > 0 && (
                        <div className="text-sm text-slate-700 mt-1">Accepted: {q.answers.join(' | ')}</div>
                      )}
                      {q.metadata?.tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {q.metadata.tags.map((t, i) => <span key={i} className="text-xs border rounded-full px-2 py-0.5 bg-slate-50">{t}</span>)}
                        </div>
                      )}
                      {q.explanation && (
                        <div className="mt-2 text-sm text-slate-700"><span className="font-medium">Explanation:</span> {q.explanation}</div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
      )}
    </div>
  )
}













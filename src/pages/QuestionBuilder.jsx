import React, { useEffect, useMemo, useRef, useState } from 'react'
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

function emptyForm(type = 'single') {
  return {
    type,
    prompt: '',
    options: '',
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
      if (saved) return { ...emptyForm('single'), ...JSON.parse(saved) }
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

    function onChange(field, value) {
      setForm(prev => {
        const next = { ...prev, [field]: value }
        try { localStorage.setItem('qb_form_v1', JSON.stringify(next)) } catch {}
        return next
      })
    }

function addOrUpdate() {
    const raw = {
      ...form,
      options: safeSplit(form.options || '', '|'),
      answers: safeSplit(form.answers || '', '|'),
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
    try { localStorage.setItem('qb_form_v1', JSON.stringify(cleared)) } catch {}
  }

  function onEdit(q) {
    setEditingId(q.id)
    const type = q.type
    const options = Array.isArray(q.options) ? q.options.map(o => o.text).join('|') : ''
    const correct = Array.isArray(q.options) ? q.options.flatMap((o, idx) => o.correct ? [String(idx + 1)] : []).join(',') : ''
    const answers = Array.isArray(q.answers) ? q.answers.join('|') : ''
    const tags = (q.metadata?.tags || []).join(',')
    setForm({
      type,
      prompt: q.prompt || '',
      options,
      answers,
      correct,
      explanation: q.explanation || '',
      subject: q.metadata?.subject || '',
      grade: q.metadata?.grade || '',
      difficulty: q.metadata?.difficulty || 'easy',
      tags,
    })
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Builder</h1>
          <p className="text-slate-600 mt-1">Create questions or import via JSON/CSV template</p>
        </div>
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
                {(form.type === 'single' || form.type === 'multiple') && (
                  <>
                    <div className="md:col-span-2">
                      <Label className="mb-1 block">Options (| separated)</Label>
                      <Input value={form.options} onChange={e => onChange('options', e.target.value)} placeholder="A|B|C|D" />
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
                      <div className="font-medium mb-1">{q.prompt}</div>
                      {(q.type === 'single' || q.type === 'multiple') && (
                        <ol className="list-decimal ml-5 space-y-1">
                          {q.options.map((o) => (
                            <li key={o.id} className={o.correct ? 'font-semibold text-green-700' : ''}>
                              {o.text} {o.correct && <span className="ml-2 text-xs border rounded-full px-2 py-0.5">correct</span>}
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










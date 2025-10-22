import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { loadQuestionsFromStorage } from '@/utils/qb-utils'
import { 
  Eye,
  Clock,
  BookOpen,
  Target,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Play,
  Edit,
  Trash2
} from 'lucide-react'

const ExamBuilder = () => {
  const LS = {
    tab: 'exam_builder_tab_v1',
    step: 'exam_builder_step_v1',
    data: 'exam_builder_data_v1',
    saved: 'exam_builder_saved_v1',
  }

  const defaultExamData = {
    title: '',
    description: '',
    subject: '',
    difficulty: '',
    timeLimit: 60,
    totalQuestions: 10,
    questionTypes: [],
    topics: [],
    instructions: '',
    allowRetakes: false,
    showResults: true,
    randomizeQuestions: true,
    selectedQuestionIds: []
  }

  const [activeTab, setActiveTab] = useState(() => {
    try { return localStorage.getItem(LS.tab) || 'create' } catch { return 'create' }
  })
  const [currentStep, setCurrentStep] = useState(() => {
    try { const v = parseInt(localStorage.getItem(LS.step) || '1', 10); return (v >=1 && v <=5) ? v : 1 } catch { return 1 }
  })
  const [examData, setExamData] = useState(() => {
    try {
      const raw = localStorage.getItem(LS.data)
      if (raw) {
        const parsed = JSON.parse(raw)
        return { ...defaultExamData, ...parsed }
      }
    } catch {}
    return { ...defaultExamData }
  })

  const [bankQuestions, setBankQuestions] = useState([])

  useEffect(() => {
    setBankQuestions(loadQuestionsFromStorage())
  }, [])

  const [savedExams, setSavedExams] = useState(() => {
    try {
      const raw = localStorage.getItem(LS.saved)
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) return list
      }
    } catch {}
    return [
      {
        id: 1,
        title: 'Algebra Midterm Review',
        subject: 'Algebra',
        questions: 15,
        timeLimit: 45,
        created: '2024-01-15',
        status: 'draft'
      },
      {
        id: 2,
        title: 'Geometry Basics Quiz',
        subject: 'Geometry',
        questions: 10,
        timeLimit: 30,
        created: '2024-01-10',
        status: 'published'
      },
      {
        id: 3,
        title: 'Statistics Final Prep',
        subject: 'Statistics',
        questions: 20,
        timeLimit: 60,
        created: '2024-01-08',
        status: 'draft'
      }
    ]
  })

  const subjects = ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Pre-Algebra', 'Trigonometry']
  const difficulties = ['Easy (0-40)', 'Moderate (40-80)', 'Advanced (80-100)']
  const questionTypes = ['Multiple Choice', 'Short Answer', 'True/False', 'Fill in the Blank', 'Essay']
  
  const algebraTopics = ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Factoring', 'Systems of Equations', 'Inequalities']
  const geometryTopics = ['Area and Perimeter', 'Volume', 'Angles', 'Triangles', 'Circles', 'Coordinate Geometry']
  const statisticsTopics = ['Mean and Median', 'Standard Deviation', 'Probability', 'Distributions', 'Hypothesis Testing', 'Correlation']

  const getTopicsForSubject = (subject) => {
    switch(subject) {
      case 'Algebra': return algebraTopics
      case 'Geometry': return geometryTopics
      case 'Statistics': return statisticsTopics
      default: return []
    }
  }

  // Persist core states so switching pages doesn't lose progress
  useEffect(() => { try { localStorage.setItem(LS.tab, activeTab) } catch {} }, [activeTab])
  useEffect(() => { try { localStorage.setItem(LS.step, String(currentStep)) } catch {} }, [currentStep])
  useEffect(() => { try { localStorage.setItem(LS.data, JSON.stringify(examData)) } catch {} }, [examData])
  useEffect(() => { try { localStorage.setItem(LS.saved, JSON.stringify(savedExams)) } catch {} }, [savedExams])

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Exam title and description' },
    { id: 2, title: 'Configuration', description: 'Subject, difficulty, and timing' },
    { id: 3, title: 'Content', description: 'Question types and topics' },
    { id: 4, title: 'Settings', description: 'Advanced options' },
    { id: 5, title: 'Review', description: 'Final review and save' }
  ]

  const handleInputChange = (field, value) => {
    setExamData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayToggle = (field, value) => {
    setExamData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const saveExam = () => {
    const newExam = {
      id: savedExams.length + 1,
      title: examData.title,
      subject: examData.subject,
      questions: (examData.selectedQuestionIds?.length || 0) || examData.totalQuestions,
      timeLimit: examData.timeLimit,
      created: new Date().toISOString().split('T')[0],
      status: 'draft'
    }
    setSavedExams([...savedExams, newExam])
    // Reset form
    const cleared = { ...defaultExamData }
    setExamData(cleared)
    setCurrentStep(1)
    try { localStorage.setItem(LS.data, JSON.stringify(cleared)); localStorage.setItem(LS.step, '1') } catch {}
  }

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                value={examData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter exam title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={examData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the exam..."
                className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
              />
            </div>
            <div>
              <Label htmlFor="instructions">Instructions for Students</Label>
              <textarea
                id="instructions"
                value={examData.instructions}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                placeholder="Special instructions or notes for students..."
                className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Subject *</Label>
                <Select value={examData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty Level *</Label>
                <Select value={examData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  value={examData.timeLimit}
                  onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                  min="5"
                  max="180"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="totalQuestions">Total Questions</Label>
                <Input
                  id="totalQuestions"
                  type="number"
                  value={examData.totalQuestions}
                  onChange={(e) => handleInputChange('totalQuestions', parseInt(e.target.value))}
                  min="1"
                  max="50"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Question Types *</Label>
              <p className="text-sm text-slate-600 mb-3">Select the types of questions to include</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {questionTypes.map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={examData.questionTypes.includes(type)}
                      onCheckedChange={() => handleArrayToggle('questionTypes', type)}
                    />
                    <Label htmlFor={type} className="cursor-pointer">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            {examData.subject && (
              <div>
                <Label className="text-base font-medium">Topics to Cover</Label>
                <p className="text-sm text-slate-600 mb-3">Select specific topics for {examData.subject}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getTopicsForSubject(examData.subject).map(topic => (
                    <div key={topic} className="flex items-center space-x-2">
                      <Checkbox
                        id={topic}
                        checked={examData.topics.includes(topic)}
                        onCheckedChange={() => handleArrayToggle('topics', topic)}
                      />
                      <Label htmlFor={topic} className="cursor-pointer">{topic}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared question bank selection */}
            <div>
              <Label className="text-base font-medium">Select Questions from Question Builder</Label>
              <p className="text-sm text-slate-600 mb-3">Choose from your saved questions. Filters use your selections in Step 2.</p>

              {bankQuestions.length === 0 ? (
                <div className="text-sm text-slate-600">No questions found. Add some in Question Builder.</div>
              ) : (
                <QuestionBankPicker
                  bankQuestions={bankQuestions}
                  examData={examData}
                  setExamData={setExamData}
                />
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowRetakes">Allow Retakes</Label>
                  <p className="text-sm text-slate-600">Students can retake this exam</p>
                </div>
                <Checkbox
                  id="allowRetakes"
                  checked={examData.allowRetakes}
                  onCheckedChange={(checked) => handleInputChange('allowRetakes', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showResults">Show Results Immediately</Label>
                  <p className="text-sm text-slate-600">Display results after submission</p>
                </div>
                <Checkbox
                  id="showResults"
                  checked={examData.showResults}
                  onCheckedChange={(checked) => handleInputChange('showResults', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="randomizeQuestions">Randomize Question Order</Label>
                  <p className="text-sm text-slate-600">Questions appear in random order</p>
                </div>
                <Checkbox
                  id="randomizeQuestions"
                  checked={examData.randomizeQuestions}
                  onCheckedChange={(checked) => handleInputChange('randomizeQuestions', checked)}
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Exam Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Title:</strong> {examData.title}</div>
                <div><strong>Subject:</strong> {examData.subject}</div>
                <div><strong>Difficulty:</strong> {examData.difficulty}</div>
                <div><strong>Time Limit:</strong> {examData.timeLimit} minutes</div>
                <div><strong>Total Questions:</strong> {examData.totalQuestions} {examData.selectedQuestionIds?.length ? `(Selected: ${examData.selectedQuestionIds.length})` : ''}</div>
                <div><strong>Question Types:</strong> {examData.questionTypes.join(', ')}</div>
                <div><strong>Topics:</strong> {examData.topics.join(', ')}</div>
                <div><strong>Allow Retakes:</strong> {examData.allowRetakes ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button onClick={saveExam} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button variant="outline" className="flex-1">
                <Play className="mr-2 h-4 w-4" />
                Save & Publish
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exam Builder</h1>
          <p className="text-slate-600 mt-1">Create custom exams with specific parameters and question types</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Create New Exam
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Manage Exams
          </button>
        </nav>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          {/* Progress Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Exam</CardTitle>
              <CardDescription>Step {currentStep} of {steps.length}: {steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
                <div className="flex justify-between text-sm">
                  {steps.map((step, index) => (
                    <div key={step.id} className={`flex flex-col items-center ${
                      currentStep >= step.id ? 'text-indigo-600' : 'text-slate-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                        currentStep >= step.id ? 'bg-indigo-600 text-white' : 'bg-slate-200'
                      }`}>
                        {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                      </div>
                      <span className="hidden sm:block">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={prevStep} 
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                
                {currentStep < 5 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !examData.title) ||
                      (currentStep === 2 && (!examData.subject || !examData.difficulty)) ||
                      (currentStep === 3 && examData.questionTypes.length === 0)
                    }
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Exams</CardTitle>
            <CardDescription>Manage your created exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedExams.map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{exam.title}</h3>
                      <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                        {exam.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                      <span className="flex items-center">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {exam.subject}
                      </span>
                      <span className="flex items-center">
                        <Target className="h-3 w-3 mr-1" />
                        {exam.questions} questions
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {exam.timeLimit} min
                      </span>
                      <span>Created: {exam.created}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExamBuilder

// Inline helper: pick and filter from shared question bank
function QuestionBankPicker({ bankQuestions, examData, setExamData }) {
  const toDiffKey = (label) => {
    if (!label) return ''
    const s = String(label).toLowerCase()
    if (s.startsWith('easy')) return 'easy'
    if (s.startsWith('moderate')) return 'moderate'
    if (s.startsWith('advanced')) return 'advanced'
    return ''
  }

  const filtered = useMemo(() => {
    const diffKey = toDiffKey(examData.difficulty)
    return bankQuestions.filter(q => {
      const subjectOk = !examData.subject || (q?.metadata?.subject || '') === examData.subject
      const diffOk = !diffKey || (q?.metadata?.difficulty || '') === diffKey
      return subjectOk && diffOk
    })
  }, [bankQuestions, examData.subject, examData.difficulty])

  const selectedSet = useMemo(() => new Set(examData.selectedQuestionIds || []), [examData.selectedQuestionIds])

  const toggleId = (id) => {
    setExamData(prev => {
      const cur = new Set(prev.selectedQuestionIds || [])
      if (cur.has(id)) cur.delete(id); else cur.add(id)
      return { ...prev, selectedQuestionIds: Array.from(cur) }
    })
  }

  const autoFill = () => {
    const remainingSlots = Math.max(0, (examData.totalQuestions || 0) - (examData.selectedQuestionIds?.length || 0))
    if (remainingSlots === 0) return
    const pool = filtered.filter(q => !selectedSet.has(q.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const pick = shuffled.slice(0, remainingSlots).map(q => q.id)
    setExamData(prev => ({ ...prev, selectedQuestionIds: [...(prev.selectedQuestionIds || []), ...pick] }))
  }

  return (
    <div className="mt-2 border rounded-lg p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-sm">
        <div>Available: {filtered.length} • Selected: {examData.selectedQuestionIds?.length || 0}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setExamData(prev => ({ ...prev, selectedQuestionIds: [] }))}>Clear</Button>
          <Button size="sm" onClick={autoFill}>Auto-fill</Button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-sm text-slate-600">No matching questions. Adjust subject/difficulty in Step 2.</div>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-auto">
          {filtered.map((q, idx) => (
            <li key={q.id} className="flex items-start gap-3 p-2 border rounded">
              <input
                type="checkbox"
                className="mt-1"
                checked={selectedSet.has(q.id)}
                onChange={() => toggleId(q.id)}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{idx + 1}. {q.prompt}</div>
                <div className="text-xs text-slate-500 mt-1">{q.type} • {q.metadata?.subject || '-'} • {q.metadata?.difficulty || 'easy'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Eye, 
  Edit,
  Save,
  Copy,
  BookOpen,
  Target,
  Clock,
  CheckCircle,
  X,
  Calculator,
  Type,
  List,
  ToggleLeft,
  FileText,
  Search
} from 'lucide-react'

const QuestionBuilder = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [questionType, setQuestionType] = useState('')
  const [questionData, setQuestionData] = useState({
    title: '',
    subject: '',
    topic: '',
    difficulty: '',
    questionText: '',
    explanation: '',
    hints: [''],
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    timeLimit: 60,
    tags: []
  })

  const [savedQuestions, setSavedQuestions] = useState([
    {
      id: 1,
      title: 'Quadratic Formula Application',
      subject: 'Algebra',
      topic: 'Quadratic Equations',
      type: 'Multiple Choice',
      difficulty: 'Moderate',
      points: 2,
      created: '2024-01-15',
      status: 'published'
    },
    {
      id: 2,
      title: 'Triangle Area Calculation',
      subject: 'Geometry',
      topic: 'Area and Perimeter',
      type: 'Short Answer',
      difficulty: 'Easy',
      points: 1,
      created: '2024-01-12',
      status: 'draft'
    },
    {
      id: 3,
      title: 'Probability of Events',
      subject: 'Statistics',
      topic: 'Probability',
      type: 'True/False',
      difficulty: 'Advanced',
      points: 3,
      created: '2024-01-10',
      status: 'published'
    }
  ])

  const subjects = ['Algebra', 'Geometry', 'Statistics', 'Calculus', 'Pre-Algebra', 'Trigonometry']
  const difficulties = ['Easy (0-40)', 'Moderate (40-80)', 'Advanced (80-100)']
  const questionTypes = ['Multiple Choice', 'Short Answer', 'True/False', 'Fill in the Blank', 'Essay']
  
  const topicsBySubject = {
    'Algebra': ['Linear Equations', 'Quadratic Equations', 'Polynomials', 'Factoring', 'Systems of Equations', 'Inequalities'],
    'Geometry': ['Area and Perimeter', 'Volume', 'Angles', 'Triangles', 'Circles', 'Coordinate Geometry'],
    'Statistics': ['Mean and Median', 'Standard Deviation', 'Probability', 'Distributions', 'Hypothesis Testing', 'Correlation']
  }

  const handleInputChange = (field, value) => {
    setQuestionData(prev => ({ ...prev, [field]: value }))
  }

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionData.options]
    newOptions[index] = value
    setQuestionData(prev => ({ ...prev, options: newOptions }))
  }

  const handleHintChange = (index, value) => {
    const newHints = [...questionData.hints]
    newHints[index] = value
    setQuestionData(prev => ({ ...prev, hints: newHints }))
  }

  const addHint = () => {
    setQuestionData(prev => ({ ...prev, hints: [...prev.hints, ''] }))
  }

  const removeHint = (index) => {
    if (questionData.hints.length > 1) {
      const newHints = questionData.hints.filter((_, i) => i !== index)
      setQuestionData(prev => ({ ...prev, hints: newHints }))
    }
  }

  const addOption = () => {
    if (questionData.options.length < 6) {
      setQuestionData(prev => ({ ...prev, options: [...prev.options, ''] }))
    }
  }

  const removeOption = (index) => {
    if (questionData.options.length > 2) {
      const newOptions = questionData.options.filter((_, i) => i !== index)
      setQuestionData(prev => ({ ...prev, options: newOptions }))
    }
  }

  const saveQuestion = () => {
    const newQuestion = {
      id: savedQuestions.length + 1,
      title: questionData.title,
      subject: questionData.subject,
      topic: questionData.topic,
      type: questionType,
      difficulty: questionData.difficulty,
      points: questionData.points,
      created: new Date().toISOString().split('T')[0],
      status: 'draft'
    }
    setSavedQuestions([...savedQuestions, newQuestion])
    
    // Reset form
    setQuestionData({
      title: '',
      subject: '',
      topic: '',
      difficulty: '',
      questionText: '',
      explanation: '',
      hints: [''],
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      timeLimit: 60,
      tags: []
    })
    setQuestionType('')
  }

  const renderQuestionTypeForm = () => {
    switch(questionType) {
      case 'Multiple Choice':
        return (
          <div className="space-y-4">
            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2 mt-2">
                {questionData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {questionData.options.length > 2 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeOption(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {questionData.options.length < 6 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label>Correct Answer</Label>
              <Select value={questionData.correctAnswer} onValueChange={(value) => handleInputChange('correctAnswer', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select correct answer" />
                </SelectTrigger>
                <SelectContent>
                  {questionData.options.map((option, index) => (
                    option && (
                      <SelectItem key={index} value={String.fromCharCode(65 + index)}>
                        {String.fromCharCode(65 + index)}: {option.substring(0, 30)}{option.length > 30 ? '...' : ''}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'Short Answer':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="correctAnswer">Correct Answer</Label>
              <Input
                id="correctAnswer"
                value={questionData.correctAnswer}
                onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                placeholder="Enter the correct answer"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Acceptable Variations (optional)</Label>
              <textarea
                placeholder="Enter alternative acceptable answers, one per line"
                className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-20"
              />
            </div>
          </div>
        )

      case 'True/False':
        return (
          <div>
            <Label>Correct Answer</Label>
            <Select value={questionData.correctAnswer} onValueChange={(value) => handleInputChange('correctAnswer', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )

      case 'Fill in the Blank':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
              <p className="text-sm text-blue-700">
                Use [BLANK] in your question text to indicate where students should fill in answers.
                Example: "The value of x in the equation 2x + 5 = 13 is [BLANK]."
              </p>
            </div>
            <div>
              <Label htmlFor="correctAnswer">Correct Answer(s)</Label>
              <Input
                id="correctAnswer"
                value={questionData.correctAnswer}
                onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                placeholder="Enter correct answer(s), separated by commas"
                className="mt-1"
              />
            </div>
          </div>
        )

      case 'Essay':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="rubric">Grading Rubric</Label>
              <textarea
                id="rubric"
                placeholder="Describe the grading criteria and key points students should address..."
                className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
              />
            </div>
            <div>
              <Label htmlFor="sampleAnswer">Sample Answer (optional)</Label>
              <textarea
                id="sampleAnswer"
                placeholder="Provide a sample answer or key points..."
                className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
              />
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
          <h1 className="text-3xl font-bold text-slate-900">Question Builder</h1>
          <p className="text-slate-600 mt-1">Create new math questions for practice and exams</p>
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
            Create Question
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'library'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Question Library
          </button>
        </nav>
      </div>

      {activeTab === 'create' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Question</CardTitle>
              <CardDescription>Build a custom math question with detailed parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="title">Question Title *</Label>
                  <Input
                    id="title"
                    value={questionData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter question title..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Question Type *</Label>
                  <Select value={questionType} onValueChange={setQuestionType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select question type" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center">
                            {type === 'Multiple Choice' && <List className="h-3 w-3 mr-2" />}
                            {type === 'Short Answer' && <Type className="h-3 w-3 mr-2" />}
                            {type === 'True/False' && <ToggleLeft className="h-3 w-3 mr-2" />}
                            {type === 'Fill in the Blank' && <Calculator className="h-3 w-3 mr-2" />}
                            {type === 'Essay' && <FileText className="h-3 w-3 mr-2" />}
                            {type}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label>Subject *</Label>
                  <Select value={questionData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
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
                  <Label>Topic</Label>
                  <Select 
                    value={questionData.topic} 
                    onValueChange={(value) => handleInputChange('topic', value)}
                    disabled={!questionData.subject}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {questionData.subject && topicsBySubject[questionData.subject]?.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Difficulty *</Label>
                  <Select value={questionData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
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

              {/* Question Content */}
              <div>
                <Label htmlFor="questionText">Question Text *</Label>
                <textarea
                  id="questionText"
                  value={questionData.questionText}
                  onChange={(e) => handleInputChange('questionText', e.target.value)}
                  placeholder="Enter the question text. You can use LaTeX for mathematical expressions: $x^2 + 2x + 1 = 0$"
                  className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tip: Use LaTeX notation for math expressions. Example: $\\frac{x^2}{2} + 3x - 5 = 0$
                </p>
              </div>

              {/* Question Type Specific Fields */}
              {questionType && renderQuestionTypeForm()}

              {/* Additional Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    value={questionData.points}
                    onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                    min="1"
                    max="10"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                  <Input
                    id="timeLimit"
                    type="number"
                    value={questionData.timeLimit}
                    onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value))}
                    min="10"
                    max="600"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="algebra, equations, solving"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Hints */}
              <div>
                <Label className="text-base font-medium">Hints (optional)</Label>
                <p className="text-sm text-slate-600 mb-3">Provide helpful hints for students</p>
                <div className="space-y-2">
                  {questionData.hints.map((hint, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-500 w-12">#{index + 1}</span>
                      <Input
                        value={hint}
                        onChange={(e) => handleHintChange(index, e.target.value)}
                        placeholder={`Hint ${index + 1}`}
                        className="flex-1"
                      />
                      {questionData.hints.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeHint(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addHint}
                    className="mt-2"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Hint
                  </Button>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <Label htmlFor="explanation">Explanation</Label>
                <textarea
                  id="explanation"
                  value={questionData.explanation}
                  onChange={(e) => handleInputChange('explanation', e.target.value)}
                  placeholder="Provide a detailed explanation of the solution..."
                  className="mt-1 w-full p-3 border border-slate-300 rounded-md resize-none h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={saveQuestion}
                  disabled={!questionData.title || !questionType || !questionData.subject || !questionData.difficulty || !questionData.questionText}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Question
                </Button>
                <Button variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button variant="outline">
                  <Copy className="mr-2 h-4 w-4" />
                  Save as Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search questions by title, subject, or topic..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {questionTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Question Library */}
          <Card>
            <CardHeader>
              <CardTitle>Question Library</CardTitle>
              <CardDescription>Manage your created questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedQuestions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{question.title}</h3>
                        <Badge variant={question.status === 'published' ? 'default' : 'secondary'}>
                          {question.status}
                        </Badge>
                        <Badge variant="outline">{question.type}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                        <span className="flex items-center">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {question.subject} - {question.topic}
                        </span>
                        <span className="flex items-center">
                          <Target className="h-3 w-3 mr-1" />
                          {question.difficulty}
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {question.points} pts
                        </span>
                        <span>Created: {question.created}</span>
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
                        <Copy className="h-3 w-3" />
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
        </div>
      )}
    </div>
  )
}

export default QuestionBuilder


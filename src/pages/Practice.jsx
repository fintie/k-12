import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Timer,
  Target,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react'

const Practice = () => {
  const [difficulty, setDifficulty] = useState([60]) // Default to moderate
  const [selectedSubject, setSelectedSubject] = useState('algebra')
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    streak: 0,
    timeSpent: 0
  })
  const [timer, setTimer] = useState(0)
  const [isActive, setIsActive] = useState(false)

  const subjects = [
    { id: 'algebra', name: 'Algebra', color: 'bg-blue-500' },
    { id: 'geometry', name: 'Geometry', color: 'bg-green-500' },
    { id: 'statistics', name: 'Statistics', color: 'bg-purple-500' },
    { id: 'calculus', name: 'Calculus', color: 'bg-orange-500' },
  ]

  const getDifficultyInfo = (level) => {
    if (level <= 40) return { 
      label: 'Easy', 
      color: 'bg-green-500', 
      description: 'Build understanding with straightforward questions that reinforce core concepts' 
    }
    if (level <= 80) return { 
      label: 'Moderate', 
      color: 'bg-orange-500', 
      description: 'Apply your knowledge to solve questions that test a deeper understanding of concepts' 
    }
    return { 
      label: 'Advanced', 
      color: 'bg-red-500', 
      description: 'Challenge yourself with complex questions that present concepts in deep and innovative ways' 
    }
  }

  const generateQuestion = () => {
    const difficultyLevel = difficulty[0]
    const diffInfo = getDifficultyInfo(difficultyLevel)
    
    // Sample questions based on difficulty and subject
    const questionBank = {
      algebra: {
        easy: [
          {
            question: "Solve for x: 2x + 5 = 13",
            type: "input",
            answer: "4",
            explanation: "Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4"
          },
          {
            question: "What is the value of 3x when x = 7?",
            type: "input",
            answer: "21",
            explanation: "Substitute x = 7 into 3x: 3(7) = 21"
          }
        ],
        moderate: [
          {
            question: "Solve the system of equations: 2x + y = 8 and x - y = 1",
            type: "multiple",
            options: ["x = 3, y = 2", "x = 2, y = 3", "x = 4, y = 0", "x = 1, y = 6"],
            answer: "x = 3, y = 2",
            explanation: "Add the equations: 3x = 9, so x = 3. Substitute back: y = 2"
          },
          {
            question: "Factor completely: x² - 5x + 6",
            type: "multiple",
            options: ["(x - 2)(x - 3)", "(x + 2)(x + 3)", "(x - 1)(x - 6)", "(x + 1)(x + 6)"],
            answer: "(x - 2)(x - 3)",
            explanation: "Find two numbers that multiply to 6 and add to -5: -2 and -3"
          }
        ],
        advanced: [
          {
            question: "Find the domain of f(x) = √(x² - 4) / (x - 3)",
            type: "multiple",
            options: ["x ≥ 2 or x ≤ -2, x ≠ 3", "x > 2, x ≠ 3", "All real numbers except 3", "x ≥ 0, x ≠ 3"],
            answer: "x ≥ 2 or x ≤ -2, x ≠ 3",
            explanation: "The expression under the square root must be non-negative: x² - 4 ≥ 0, and the denominator cannot be zero: x ≠ 3"
          }
        ]
      },
      geometry: {
        easy: [
          {
            question: "What is the area of a rectangle with length 8 and width 5?",
            type: "input",
            answer: "40",
            explanation: "Area = length × width = 8 × 5 = 40 square units"
          }
        ],
        moderate: [
          {
            question: "In a right triangle, if one leg is 3 and the hypotenuse is 5, what is the other leg?",
            type: "input",
            answer: "4",
            explanation: "Using the Pythagorean theorem: a² + b² = c², so 3² + b² = 5², which gives b = 4"
          }
        ],
        advanced: [
          {
            question: "Find the volume of a cone with radius 6 and height 8.",
            type: "multiple",
            options: ["96π", "144π", "288π", "192π"],
            answer: "96π",
            explanation: "Volume = (1/3)πr²h = (1/3)π(6²)(8) = (1/3)π(36)(8) = 96π"
          }
        ]
      }
    }

    const difficultyKey = difficultyLevel <= 40 ? 'easy' : difficultyLevel <= 80 ? 'moderate' : 'advanced'
    const questions = questionBank[selectedSubject]?.[difficultyKey] || questionBank.algebra.easy
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)]
    
    setCurrentQuestion({
      ...randomQuestion,
      difficulty: diffInfo.label,
      subject: selectedSubject
    })
    setUserAnswer('')
    setSelectedOption('')
    setShowResult(false)
    setIsActive(true)
    setTimer(0)
  }

  const checkAnswer = () => {
    if (!currentQuestion) return
    
    const answer = currentQuestion.type === 'input' ? userAnswer.trim() : selectedOption
    const correct = answer.toLowerCase() === currentQuestion.answer.toLowerCase()
    
    setIsCorrect(correct)
    setShowResult(true)
    setIsActive(false)
    
    setSessionStats(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0,
      timeSpent: prev.timeSpent + timer
    }))
  }

  const nextQuestion = () => {
    generateQuestion()
  }

  // Timer effect
  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1)
      }, 1000)
    } else if (!isActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, timer])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const diffInfo = getDifficultyInfo(difficulty[0])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Practice Problems</h1>
          <p className="text-slate-600 mt-1">Sharpen your skills with targeted practice</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Timer className="h-4 w-4" />
            <span>{formatTime(timer)}</span>
          </div>
          {sessionStats.total > 0 && (
            <Badge variant="outline">
              {sessionStats.correct}/{sessionStats.total} correct
            </Badge>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Practice Settings</CardTitle>
          <CardDescription>Customize your practice session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Selection */}
          <div>
            <Label className="text-base font-medium">Subject</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {subjects.map((subject) => (
                <Button
                  key={subject.id}
                  variant={selectedSubject === subject.id ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${subject.color} mr-2`}></div>
                  {subject.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Difficulty Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-medium">Difficulty Level</Label>
              <Badge className={`${diffInfo.color} text-white`}>
                {diffInfo.label} ({difficulty[0]})
              </Badge>
            </div>
            <Slider
              value={difficulty}
              onValueChange={setDifficulty}
              max={100}
              min={0}
              step={5}
              className="mb-2"
            />
            <p className="text-sm text-slate-600">{diffInfo.description}</p>
          </div>

          {/* Start Button */}
          <Button 
            onClick={generateQuestion} 
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {currentQuestion ? 'New Question' : 'Start Practice'}
          </Button>
        </CardContent>
      </Card>

      {/* Question Display */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{currentQuestion.subject}</Badge>
                <Badge className={`${getDifficultyInfo(difficulty[0]).color} text-white`}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Target className="h-4 w-4" />
                <span>Question {sessionStats.total + 1}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium text-slate-900">
              {currentQuestion.question}
            </div>

            {/* Answer Input */}
            {!showResult && (
              <div className="space-y-4">
                {currentQuestion.type === 'input' ? (
                  <div>
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                <Button 
                  onClick={checkAnswer} 
                  disabled={currentQuestion.type === 'input' ? !userAnswer.trim() : !selectedOption}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Check Answer
                </Button>
              </div>
            )}

            {/* Result Display */}
            {showResult && (
              <div className={`p-4 rounded-lg border-2 ${
                isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Correct Answer:</strong> {currentQuestion.answer}
                  </p>
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-700">{currentQuestion.explanation}</p>
                  </div>
                </div>

                <Button onClick={nextQuestion} className="w-full mt-4">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Next Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Stats */}
      {sessionStats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600">Accuracy</p>
                  <p className="text-xl font-bold">
                    {Math.round((sessionStats.correct / sessionStats.total) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-slate-600">Current Streak</p>
                  <p className="text-xl font-bold">{sessionStats.streak}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-slate-600">Total Time</p>
                  <p className="text-xl font-bold">{formatTime(sessionStats.timeSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Practice


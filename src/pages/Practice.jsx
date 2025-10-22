import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { loadQuestionsFromStorage } from '@/utils/qb-utils'
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  Timer,
  Target,
  TrendingUp
} from 'lucide-react'

const Practice = () => {
  const LS = { key: 'practice_state_v1' }

  // Build initial state from localStorage to avoid losing data on route switches
  const initial = (() => {
    try {
      const raw = localStorage.getItem(LS.key)
      if (raw) {
        const s = JSON.parse(raw)
        const diff = Array.isArray(s?.difficulty) ? s.difficulty : [60]
        const subj = typeof s?.selectedSubject === 'string' ? s.selectedSubject : 'algebra'
        const wasActive = !!s?.isActive
        const base = Number(s?.timer) || 0
        const last = Number(s?.lastTickAt) || 0
        const delta = wasActive && last ? Math.max(0, Math.floor((Date.now() - last) / 1000)) : 0
        const resumedTimer = base + delta
        return {
          difficulty: diff,
          selectedSubject: subj,
          currentQuestion: s?.currentQuestion || null,
          userAnswer: s?.userAnswer || '',
          selectedOption: s?.selectedOption || '',
          selectedOptions: Array.isArray(s?.selectedOptions) ? s.selectedOptions : [],
          showResult: !!s?.showResult,
          isCorrect: !!s?.isCorrect,
          sessionStats: s?.sessionStats || { correct: 0, total: 0, streak: 0, timeSpent: 0 },
          timer: resumedTimer,
          isActive: wasActive,
          ended: !!s?.ended,
          history: Array.isArray(s?.history) ? s.history : [],
          exhaustedMap: (s?.exhaustedMap && typeof s.exhaustedMap === 'object') ? s.exhaustedMap : { easy: false, moderate: false, advanced: false },
          lastTickAt: Date.now(),
        }
      }
    } catch {}
    return {
      difficulty: [60],
      selectedSubject: 'algebra',
      currentQuestion: null,
      userAnswer: '',
      selectedOption: '',
      selectedOptions: [],
      showResult: false,
      isCorrect: false,
      sessionStats: { correct: 0, total: 0, streak: 0, timeSpent: 0 },
      timer: 0,
      isActive: false,
      ended: false,
      history: [],
      exhaustedMap: { easy: false, moderate: false, advanced: false },
      lastTickAt: Date.now(),
    }
  })()

  const [difficulty, setDifficulty] = useState(initial.difficulty)
  const [selectedSubject, setSelectedSubject] = useState(initial.selectedSubject)
  const [currentQuestion, setCurrentQuestion] = useState(initial.currentQuestion)
  const [userAnswer, setUserAnswer] = useState(initial.userAnswer)
  const [selectedOption, setSelectedOption] = useState(initial.selectedOption)
  const [selectedOptions, setSelectedOptions] = useState(initial.selectedOptions)
  const [showResult, setShowResult] = useState(initial.showResult)
  const [isCorrect, setIsCorrect] = useState(initial.isCorrect)
  const [sessionStats, setSessionStats] = useState(initial.sessionStats)
  const [timer, setTimer] = useState(initial.timer)           // seconds on current question/session tick
  const [isActive, setIsActive] = useState(initial.isActive) // ticking?
  const [ended, setEnded] = useState(initial.ended)          // show analysis when true
  const [lastTickAt, setLastTickAt] = useState(initial.lastTickAt) // epoch ms, for resume after navigation
  const [history, setHistory] = useState(initial.history)    // answered question records
  const [exhaustedMap, setExhaustedMap] = useState(initial.exhaustedMap)

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

  // Initial state is sourced from localStorage through lazy state initializers above

  const subjectNameMap = {
    algebra: 'Algebra',
    geometry: 'Geometry',
    statistics: 'Statistics',
    calculus: 'Calculus',
  }

  // Helper: map slider value to canonical difficulty key (hoisted function avoids TDZ issues)
  function getDiffKey(val) {
    return val <= 40 ? 'easy' : (val <= 80 ? 'moderate' : 'advanced')
  }

  const getBasePool = (bank, wantedSubject, diffKey) => {
    const pool = bank.filter(q => (q?.metadata?.subject || '') === wantedSubject && (q?.metadata?.difficulty || '') === diffKey)
    if (pool.length > 0) return pool
    const diffOnly = bank.filter(q => (q?.metadata?.difficulty || '') === diffKey)
    return diffOnly
  }

  const matchCount = useMemo(() => {
    const bank = loadQuestionsFromStorage()
    const diffKey = getDiffKey(difficulty[0])
    const wantedSubject = subjectNameMap[selectedSubject] || 'Algebra'
    const base = getBasePool(bank, wantedSubject, diffKey)
    return base.length
  }, [difficulty, selectedSubject])

  const generateQuestion = () => {
    const difficultyLevel = difficulty[0]
    const diffInfo = getDifficultyInfo(difficultyLevel)
    const diffKey = getDiffKey(difficultyLevel)
    const wantedSubject = subjectNameMap[selectedSubject] || 'Algebra'

    const bank = loadQuestionsFromStorage()

    const basePool = getBasePool(bank, wantedSubject, diffKey)
    let available = basePool
    if (available.length === 0) {
      alert('No questions available for the selected subject/difficulty. Please add some in Question Builder and try again.')
      return
    }

    // Prefer unseen and not the current question; then seen but not current; finally fallback to current if it's the only choice
    const historyIds = new Set(history.map(h => h.id))
    const curId = currentQuestion?.id
    const unseenExceptCurrent = available.filter(q => !historyIds.has(q.id) && q.id !== curId)
    const seenExceptCurrent = available.filter(q => historyIds.has(q.id) && q.id !== curId)
    const onlyCurrent = available.filter(q => q.id === curId)
    const pickFrom = unseenExceptCurrent.length ? unseenExceptCurrent : (seenExceptCurrent.length ? seenExceptCurrent : onlyCurrent)
    const q = pickFrom[Math.floor(Math.random() * pickFrom.length)]

    const mc = q.type === 'single' || q.type === 'multiple'
    const correctIds = mc ? q.options.filter(o => o.correct).map(o => o.id) : []
    const qDiffKey = (q?.metadata?.difficulty || diffKey)
    const qDiffLabel = qDiffKey === 'easy' ? 'Easy' : qDiffKey === 'moderate' ? 'Moderate' : 'Advanced'

    setCurrentQuestion({
      id: q.id,
      question: q.prompt,
      type: q.type,
      options: mc ? q.options.map(o => ({ id: o.id, text: o.text })) : [],
      correctOptionIds: correctIds,
      answers: Array.isArray(q.answers) ? q.answers : [],
      explanation: q.explanation || '',
      difficulty: qDiffLabel,
      diffKey: qDiffKey,
      subject: q?.metadata?.subject || wantedSubject
    })
    setUserAnswer('')
    setSelectedOption('')
    setSelectedOptions([])
    setShowResult(false)
    setIsActive(true)
    setEnded(false)
    setTimer(0)
    setLastTickAt(Date.now())
  }

  const checkAnswer = () => {
    if (!currentQuestion) return

    let correct = false
    if (currentQuestion.type === 'single') {
      correct = currentQuestion.correctOptionIds?.length === 1 && currentQuestion.correctOptionIds[0] === selectedOption
    } else if (currentQuestion.type === 'multiple') {
      const sel = new Set(selectedOptions)
      const corr = new Set(currentQuestion.correctOptionIds || [])
      if (sel.size === corr.size) {
        correct = Array.from(corr).every(id => sel.has(id))
      } else {
        correct = false
      }
    } else if (currentQuestion.type === 'fill' || currentQuestion.type === 'short') {
      const ans = (userAnswer || '').trim().toLowerCase()
      correct = (currentQuestion.answers || []).some(a => (a || '').trim().toLowerCase() === ans)
    }

    setIsCorrect(correct)
    setShowResult(true)

    setSessionStats(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      total: prev.total + 1,
      streak: correct ? prev.streak + 1 : 0,
      timeSpent: prev.timeSpent
    }))

    // Record history for analysis
    try {
      const record = {
        id: currentQuestion.id,
        subject: currentQuestion.subject,
        diffKey: currentQuestion.diffKey,
        type: currentQuestion.type,
        prompt: currentQuestion.question,
        options: currentQuestion.options,
        correctOptionIds: currentQuestion.correctOptionIds,
        answers: currentQuestion.answers,
        explanation: currentQuestion.explanation,
        userAnswer: (currentQuestion.type === 'single') ? [selectedOption] :
                    (currentQuestion.type === 'multiple') ? [...selectedOptions] :
                    [userAnswer],
        timeTaken: timer,
        isCorrect: correct,
        ts: Date.now(),
      }
      setHistory(prev => [...prev, record])
    } catch {}

    // After answering, check if there are any unseen questions left under the current filters
    try {
      const diffKey = getDiffKey(difficulty[0])
      const wantedSubject = subjectNameMap[selectedSubject] || 'Algebra'
      const bank = loadQuestionsFromStorage()
      const base = getBasePool(bank, wantedSubject, diffKey)
      const seenIds = new Set([...history.map(h => h.id), currentQuestion.id])
      const unseenLeft = base.filter(q => !seenIds.has(q.id))
      if (unseenLeft.length === 0) {
        if (!exhaustedMap[diffKey]) {
          alert('All questions for this difficulty are completed. Select a new difficulty (and subject if you like) or continue by repeating questions.')
          setExhaustedMap(prev => ({ ...prev, [diffKey]: true }))
        }
      }
    } catch {}
  }

  const nextQuestion = () => {
    // accumulate the elapsed time (including review period) before starting next
    setSessionStats(prev => ({ ...prev, timeSpent: prev.timeSpent + timer }))
    generateQuestion()
  }

  const endPractice = () => {
    // Stop ticking and show analysis; include current timer into aggregated time
    setIsActive(false)
    setEnded(true)
    setSessionStats(prev => ({ ...prev, timeSpent: (prev.timeSpent || 0) + timer }))
    // Clear current question block so only analysis is shown
    setCurrentQuestion(null)
    setShowResult(false)
  }

  // Timer effect (keeps running over navigation via lastTickAt resume logic)
  useEffect(() => {
    let interval = null
    if (isActive) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
        setLastTickAt(Date.now())
      }, 1000)
    } else if (!isActive && timer !== 0) {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive])

  // Persist state frequently so navigation doesn't clear Practice
  useEffect(() => {
    const persistSnapshot = () => {
      try {
        const payload = {
          difficulty,
          selectedSubject,
          currentQuestion,
          userAnswer,
          selectedOption,
          selectedOptions,
          showResult,
          isCorrect,
          sessionStats,
          timer,
          isActive,
          ended,
          history,
          exhaustedMap,
          lastTickAt: Date.now(),
        }
        localStorage.setItem(LS.key, JSON.stringify(payload))
      } catch {}
    }

    // Immediate persist on any change
    persistSnapshot()

    // Persist on visibility change (navigate away, tab switch)
    const onVis = () => { if (document.visibilityState === 'hidden') persistSnapshot() }
    window.addEventListener('visibilitychange', onVis)

    // Persist on unmount
    return () => {
      try { persistSnapshot() } catch {}
      window.removeEventListener('visibilitychange', onVis)
    }
  }, [difficulty, selectedSubject, currentQuestion, userAnswer, selectedOption, selectedOptions, showResult, isCorrect, sessionStats, timer, isActive, ended, history, exhaustedMap, lastTickAt])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const diffInfo = getDifficultyInfo(difficulty[0])

  // Map difficulty key to color utility for stable tag rendering
  function diffKeyToColor(key) {
    switch (key) {
      case 'easy': return 'bg-green-500'
      case 'moderate': return 'bg-orange-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-slate-500'
    }
  }

  // Helper: map slider value to canonical difficulty key
  

  const sessionInProgress = !ended && (isActive || !!currentQuestion || sessionStats.total > 0)

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
          {(isActive || !!currentQuestion || sessionStats.total > 0 || ended) && (
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
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                onClick={generateQuestion} 
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                size="lg"
                disabled={matchCount === 0 || sessionInProgress || ended}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Practice
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={endPractice}
                disabled={ended || (!currentQuestion && sessionStats.total === 0 && !isActive)}
              >
                End Practice
              </Button>
            </div>
            {matchCount === 0 && (
              <p className="text-xs text-amber-600">
                No questions available for the current subject and difficulty. Please add some in Question Builder and try again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Display */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{currentQuestion.subject}</Badge>
                <Badge className={`${diffKeyToColor(currentQuestion.diffKey)} text-white`}>
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
                {(currentQuestion.type === 'fill' || currentQuestion.type === 'short') ? (
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
                ) : currentQuestion.type === 'single' ? (
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const checked = selectedOptions.includes(option.id)
                      return (
                        <div key={index} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mopt-${index}`}
                            checked={checked}
                            onCheckedChange={() => {
                              setSelectedOptions(prev => {
                                const set = new Set(prev)
                                if (set.has(option.id)) set.delete(option.id); else set.add(option.id)
                                return Array.from(set)
                              })
                            }}
                          />
                          <Label htmlFor={`mopt-${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                        </div>
                      )
                    })}
                  </div>
                )}

                <Button 
                  onClick={checkAnswer} 
                  disabled={
                    (currentQuestion.type === 'fill' || currentQuestion.type === 'short') ? !userAnswer.trim() :
                    (currentQuestion.type === 'single' ? !selectedOption : selectedOptions.length === 0)
                  }
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
                    <strong>Correct Answer:</strong> {
                      currentQuestion.type === 'single' || currentQuestion.type === 'multiple'
                        ? currentQuestion.options.filter(o => (currentQuestion.correctOptionIds || []).includes(o.id)).map(o => o.text).join(' | ')
                        : (currentQuestion.answers || []).join(' | ')
                    }
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

      {/* Session Analysis */}
      {ended && (
        <Card>
          <CardHeader>
            <CardTitle>Practice Analysis</CardTitle>
            <CardDescription>Summary of this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><strong>Subject:</strong> {subjectNameMap[selectedSubject]}</div>
            <div><strong>Questions Answered:</strong> {sessionStats.total}</div>
            <div><strong>Correct:</strong> {sessionStats.correct} ({sessionStats.total ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0}%)</div>
            <div><strong>Total Time:</strong> {formatTime(sessionStats.timeSpent || timer)}</div>
            <div><strong>Avg Time / Question:</strong> {sessionStats.total ? formatTime(Math.floor((sessionStats.timeSpent || timer) / sessionStats.total)) : '0:00'}</div>
            <div className="pt-2">
              <Button onClick={() => { setEnded(false); setCurrentQuestion(null); setShowResult(false); setIsCorrect(false); setUserAnswer(''); setSelectedOption(''); setSelectedOptions([]); setSessionStats({ correct: 0, total: 0, streak: 0, timeSpent: 0 }); setHistory([]); setExhaustedMap({ easy: false, moderate: false, advanced: false }); setTimer(0); setIsActive(false); }}>Start New Session</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {ended && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Answers and solutions from this session</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {history.map((h, idx) => {
                const isMC = h.type === 'single' || h.type === 'multiple'
                const correctTexts = isMC
                  ? h.options.filter(o => (h.correctOptionIds || []).includes(o.id)).map(o => o.text)
                  : (h.answers || [])
                const userTexts = isMC
                  ? h.options.filter(o => (h.userAnswer || []).includes(o.id)).map(o => o.text)
                  : (h.userAnswer || [])
                return (
                  <li key={idx} className="border rounded p-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <div>#{idx + 1} • {h.type} • {h.subject}</div>
                      <div>{formatTime(h.timeTaken || 0)}</div>
                    </div>
                    <div className="font-medium mb-2">{h.prompt}</div>
                    {isMC && (
                      <ol className="list-decimal ml-5 text-sm space-y-1">
                        {h.options.map(o => (
                          <li key={o.id} className={h.correctOptionIds?.includes(o.id) ? 'text-green-700 font-medium' : ''}>{o.text}</li>
                        ))}
                      </ol>
                    )}
                    <div className="mt-2 text-sm">
                      <strong>Your Answer:</strong> {userTexts.join(' | ') || '-'}
                    </div>
                    <div className="text-sm">
                      <strong>Correct Answer:</strong> {correctTexts.join(' | ') || '-'}
                    </div>
                    {h.explanation && (
                      <div className="text-sm text-slate-700 mt-1"><strong>Explanation:</strong> {h.explanation}</div>
                    )}
                    <div className={`mt-2 text-xs inline-block px-2 py-0.5 rounded-full ${h.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Session Stats */}
      {(isActive || !!currentQuestion || sessionStats.total > 0 || ended) && (
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
                  <p className="text-xl font-bold">{formatTime(sessionStats.timeSpent + (isActive ? timer : 0))}</p>
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


import { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import { Mail, Sparkles, Target, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const tracks = {
  oc: {
    label: 'OC Learning Checkup',
    shortLabel: 'OC',
    audience: 'Years 3-4 students preparing for Opportunity Class entry.',
    goal: 'Identify readiness, thinking gaps, and next-step practice priorities for OC entry.',
  },
  selective: {
    label: 'Selective Learning Checkup',
    shortLabel: 'Selective',
    audience: 'Years 5-6 students aiming for Selective School placement.',
    goal: 'Spot academic strengths, exam risks, and the highest-leverage improvement areas.',
  },
  hsc: {
    label: 'HSC Learning Checkup',
    shortLabel: 'HSC',
    audience: 'Years 10-12 students planning for HSC performance uplift.',
    goal: 'Assess subject confidence, study habits, and exam-readiness priorities for HSC.',
  },
}

const gradeOptions = {
  oc: ['Year 3', 'Year 4'],
  selective: ['Year 5', 'Year 6'],
  hsc: ['Year 10', 'Year 11', 'Year 12'],
}

const scoreOptions = ['Below average', 'Average', 'Above average', 'Top performer', 'Not sure yet']
const studyTimeOptions = ['< 2 hours', '2-4 hours', '4-6 hours', '6-10 hours', '10+ hours']
const tutoringOptions = ['No tutoring yet', 'Occasional tutoring', 'Weekly tutoring', 'Intensive coaching']

const focusAreas = {
  oc: ['Reading comprehension', 'Mathematical reasoning', 'Problem solving', 'Writing confidence', 'Exam focus'],
  selective: ['English reading', 'Mathematics', 'Thinking skills', 'Writing', 'Exam strategy'],
  hsc: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Study discipline', 'Exam technique'],
}

const assessmentQuestions = {
  oc: [
    {
      id: 'oc-reading-main-idea',
      skill: 'Reading comprehension',
      question: 'A passage says a child kept rereading a question before answering. What does this most likely show?',
      options: ['The child was bored', 'The child was checking meaning carefully', 'The child knew every answer', 'The child wanted to finish quickly'],
      answer: 'The child was checking meaning carefully',
    },
    {
      id: 'oc-vocab',
      skill: 'Reading comprehension',
      question: 'Which word is closest in meaning to "brief"?',
      options: ['Short', 'Bright', 'Heavy', 'Late'],
      answer: 'Short',
    },
    {
      id: 'oc-number-pattern',
      skill: 'Mathematical reasoning',
      question: 'What is the next number in the pattern: 3, 6, 12, 24, ?',
      options: ['30', '36', '42', '48'],
      answer: '48',
    },
    {
      id: 'oc-fractions',
      skill: 'Mathematical reasoning',
      question: 'Which fraction is equal to one half?',
      options: ['2/3', '3/6', '3/4', '4/6'],
      answer: '3/6',
    },
    {
      id: 'oc-word-problem',
      skill: 'Problem solving',
      question: 'Mia has 18 stickers. She gives 5 to a friend and buys 7 more. How many does she have?',
      options: ['20', '21', '30', '6'],
      answer: '20',
    },
    {
      id: 'oc-logic',
      skill: 'Problem solving',
      question: 'All glims are blue. Some blue things are round. What must be true?',
      options: ['All glims are round', 'Some glims are round', 'All glims are blue', 'No blue things are glims'],
      answer: 'All glims are blue',
    },
    {
      id: 'oc-writing',
      skill: 'Writing confidence',
      question: 'Which sentence has the clearest detail?',
      options: ['The dog was nice', 'The dog was very good', 'The golden dog waited quietly beside the gate', 'There was a dog'],
      answer: 'The golden dog waited quietly beside the gate',
    },
    {
      id: 'oc-punctuation',
      skill: 'Writing confidence',
      question: 'Choose the correctly punctuated sentence.',
      options: ['Because it rained we stayed inside.', 'Because it rained, we stayed inside.', 'Because, it rained we stayed inside.', 'Because it rained we, stayed inside.'],
      answer: 'Because it rained, we stayed inside.',
    },
    {
      id: 'oc-focus',
      skill: 'Exam focus',
      question: 'During a timed test, what should a student do if one question is taking too long?',
      options: ['Stop the test', 'Guess every remaining answer', 'Mark it and move on, then return later', 'Spend all remaining time on it'],
      answer: 'Mark it and move on, then return later',
    },
    {
      id: 'oc-checking',
      skill: 'Exam focus',
      question: 'What is the best way to check a maths answer?',
      options: ['Only read the final number', 'Use a different method or estimate', 'Change it at random', 'Skip checking'],
      answer: 'Use a different method or estimate',
    },
  ],
  selective: [
    {
      id: 'sel-inference',
      skill: 'English reading',
      question: 'If a character "hesitated before opening the letter", what can we infer?',
      options: ['They may be nervous', 'They cannot read', 'They are asleep', 'They wrote the letter'],
      answer: 'They may be nervous',
    },
    {
      id: 'sel-tone',
      skill: 'English reading',
      question: 'Which word best describes a sentence that gently makes fun of a mistake?',
      options: ['Literal', 'Ironic', 'Random', 'Silent'],
      answer: 'Ironic',
    },
    {
      id: 'sel-percent',
      skill: 'Mathematics',
      question: 'A $80 item is discounted by 25%. What is the sale price?',
      options: ['$20', '$55', '$60', '$75'],
      answer: '$60',
    },
    {
      id: 'sel-ratio',
      skill: 'Mathematics',
      question: 'The ratio of red to blue beads is 2:3. If there are 20 red beads, how many blue beads are there?',
      options: ['24', '30', '36', '40'],
      answer: '30',
    },
    {
      id: 'sel-logic-grid',
      skill: 'Thinking skills',
      question: 'If A is taller than B, and B is taller than C, which statement must be true?',
      options: ['C is tallest', 'A is taller than C', 'B is taller than A', 'A and C are equal'],
      answer: 'A is taller than C',
    },
    {
      id: 'sel-analogy',
      skill: 'Thinking skills',
      question: 'Bird is to nest as bee is to:',
      options: ['Hive', 'Tree', 'Feather', 'Honey'],
      answer: 'Hive',
    },
    {
      id: 'sel-writing-structure',
      skill: 'Writing',
      question: 'What should a strong persuasive introduction usually include?',
      options: ['Only a joke', 'A clear position and preview of reasons', 'The conclusion', 'A list of random facts'],
      answer: 'A clear position and preview of reasons',
    },
    {
      id: 'sel-writing-evidence',
      skill: 'Writing',
      question: 'Which sentence uses evidence best?',
      options: ['It is bad because I say so', 'Many students benefit because daily reading improves vocabulary', 'Everyone knows it', 'It is just better'],
      answer: 'Many students benefit because daily reading improves vocabulary',
    },
    {
      id: 'sel-timing',
      skill: 'Exam strategy',
      question: 'What is the best first step before starting a timed section?',
      options: ['Ignore the instructions', 'Scan the number of questions and time available', 'Start with the last question always', 'Spend five minutes worrying'],
      answer: 'Scan the number of questions and time available',
    },
    {
      id: 'sel-review',
      skill: 'Exam strategy',
      question: 'After a practice test, what gives the most useful improvement information?',
      options: ['Score only', 'Error types and time spent per section', 'How tired you felt only', 'The colour of the paper'],
      answer: 'Error types and time spent per section',
    },
  ],
  hsc: [
    {
      id: 'hsc-thesis',
      skill: 'English',
      question: 'What is the main purpose of a thesis statement in an essay?',
      options: ['To list every quote', 'To state the argument clearly', 'To repeat the question only', 'To add a bibliography'],
      answer: 'To state the argument clearly',
    },
    {
      id: 'hsc-evidence',
      skill: 'English',
      question: 'Which approach best supports a literature paragraph?',
      options: ['Technique, evidence, explanation, link', 'Plot summary only', 'Personal opinion only', 'Quotes with no analysis'],
      answer: 'Technique, evidence, explanation, link',
    },
    {
      id: 'hsc-algebra',
      skill: 'Mathematics',
      question: 'Solve: 3x + 5 = 20.',
      options: ['x = 3', 'x = 5', 'x = 8', 'x = 15'],
      answer: 'x = 5',
    },
    {
      id: 'hsc-gradient',
      skill: 'Mathematics',
      question: 'What is the gradient of the line y = 4x - 7?',
      options: ['-7', '4', '7', 'x'],
      answer: '4',
    },
    {
      id: 'hsc-science-validity',
      skill: 'Sciences',
      question: 'In an experiment, what improves validity?',
      options: ['Changing many variables at once', 'Testing what the method claims to test', 'Ignoring controls', 'Using unclear measurements'],
      answer: 'Testing what the method claims to test',
    },
    {
      id: 'hsc-science-reliability',
      skill: 'Sciences',
      question: 'What usually improves reliability of results?',
      options: ['Repeating trials', 'Using fewer measurements', 'Changing equipment each time', 'Removing all data'],
      answer: 'Repeating trials',
    },
    {
      id: 'hsc-humanities-source',
      skill: 'Humanities',
      question: 'When analysing a historical source, which pair is most important?',
      options: ['Colour and font', 'Origin and purpose', 'Page number and staple', 'Length and spelling only'],
      answer: 'Origin and purpose',
    },
    {
      id: 'hsc-humanities-argument',
      skill: 'Humanities',
      question: 'A strong humanities response should usually include:',
      options: ['A claim supported by evidence', 'Only definitions', 'Only dates', 'No judgement'],
      answer: 'A claim supported by evidence',
    },
    {
      id: 'hsc-study',
      skill: 'Study discipline',
      question: 'Which study method is usually most effective for long-term retention?',
      options: ['Rereading notes once', 'Spaced retrieval practice', 'Highlighting everything', 'Studying only the night before'],
      answer: 'Spaced retrieval practice',
    },
    {
      id: 'hsc-exam',
      skill: 'Exam technique',
      question: 'In an HSC exam, what should you do before writing a long response?',
      options: ['Start immediately with no plan', 'Plan key points and allocate time', 'Write as slowly as possible', 'Avoid reading the question'],
      answer: 'Plan key points and allocate time',
    },
  ],
}

const initialForm = (track) => ({
  parentName: '',
  studentName: '',
  email: '',
  phone: '',
  grade: gradeOptions[track][0],
  currentLevel: '',
  targetGoal: '',
  strengthArea: '',
  weakArea: focusAreas[track][0],
  studyTime: '',
  tutoringHistory: '',
  concern: '',
  assessmentAnswers: {},
})

const reportHighlights = [
  'An online test-style checkup tailored to the selected exam path',
  'Likely strength areas and risk areas based on the submitted answers',
  'A learning summary report sent to the parent email',
]

function buildSubmissionPayload(track, values) {
  return {
    track,
    trackLabel: tracks[track].label,
    ...values,
    assessmentResult: getAssessmentResult(track, values.assessmentAnswers),
    submittedAt: new Date().toISOString(),
  }
}

function getAssessmentResult(track, answers = {}) {
  const questions = assessmentQuestions[track]
  const skillTotals = {}
  const skillCorrect = {}
  let correct = 0

  questions.forEach((question) => {
    skillTotals[question.skill] = (skillTotals[question.skill] || 0) + 1
    if (answers[question.id] === question.answer) {
      correct += 1
      skillCorrect[question.skill] = (skillCorrect[question.skill] || 0) + 1
    }
  })

  const skillScores = Object.keys(skillTotals).map((skill) => ({
    skill,
    correct: skillCorrect[skill] || 0,
    total: skillTotals[skill],
  }))

  const weakestSkill = [...skillScores].sort((a, b) => a.correct / a.total - b.correct / b.total)[0]
  const strongestSkill = [...skillScores].sort((a, b) => b.correct / b.total - a.correct / a.total)[0]

  return {
    correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
    level:
      correct >= 8
        ? 'Strong'
        : correct >= 6
          ? 'On track'
          : correct >= 4
            ? 'Developing'
            : 'Needs foundation support',
    strongestSkill,
    weakestSkill,
    skillScores,
  }
}

function buildLocalReport(payload) {
  const student = payload.studentName || 'the student'
  const result = payload.assessmentResult
  const focusArea = result?.weakestSkill?.skill || payload.weakArea || payload.concern || 'study consistency'
  const strengthArea = result?.strongestSkill?.skill || payload.strengthArea || 'general classroom learning'
  const targetGoal = payload.targetGoal || 'stronger academic progress'
  const studyTime = payload.studyTime || 'not specified'
  const scoreLine = result
    ? `Online assessment score: ${result.correct}/${result.total} (${result.percentage}%) - ${result.level}`
    : `Current level: ${payload.currentLevel || 'Not specified'}`
  const skillLines = result?.skillScores?.map(
    (item) => `- ${item.skill}: ${item.correct}/${item.total}`
  ) || []

  return [
    `${payload.trackLabel} Learning Summary Report for ${student}`,
    '',
    scoreLine,
    `Target goal: ${targetGoal}`,
    '',
    'Summary:',
    `${student} completed a 10-question online checkup for ${payload.trackLabel}. The result suggests a ${result?.level?.toLowerCase() || 'developing'} skills profile, with the next improvement focus on ${focusArea.toLowerCase()}.`,
    '',
    'Skill breakdown:',
    ...skillLines,
    '',
    'Strongest area:',
    `- ${strengthArea} appears to be the strongest base to build on.`,
    '',
    'Priority risk:',
    `- ${focusArea} is the clearest area affecting readiness right now.`,
    `- Current weekly study time: ${studyTime}.`,
    '',
    'Recommended next steps:',
    `1. Complete two focused practice sessions on ${focusArea.toLowerCase()} this week.`,
    '2. Review every incorrect answer and write down the reason for the mistake.',
    '3. Repeat one timed mini-test next week and compare accuracy, speed, and confidence.',
  ].join('\n')
}

async function sendEmailReport(payload, report) {
  const emailjsService = import.meta.env.VITE_EMAILJS_SERVICE_ID
  const emailjsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
  const emailjsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

  if (!emailjsService || !emailjsTemplate || !emailjsKey) {
    return false
  }

  await emailjsSend(
    emailjsService,
    emailjsTemplate,
    {
      to_email: payload.email,
      from_name: 'NextGenius',
      parent_name: payload.parentName,
      student_name: payload.studentName,
      subject: `${payload.trackLabel} Learning Summary Report`,
      message: report,
    },
    emailjsKey
  )
  return true
}

export default function LearningCheckup() {
  const [activeTrack, setActiveTrack] = useState('oc')
  const [forms, setForms] = useState({
    oc: initialForm('oc'),
    selective: initialForm('selective'),
    hsc: initialForm('hsc'),
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const currentForm = forms[activeTrack]

  const submitEndpoint = import.meta.env.VITE_LEARNING_CHECKUP_API_URL

  const introCards = useMemo(
    () => [
      {
        icon: Target,
        title: 'Clear exam positioning',
        body: 'Quickly understand whether a student is currently under-prepared, on track, or ready to accelerate.',
      },
      {
        icon: Sparkles,
        title: 'Email learning summary',
        body: 'After the online test, families receive a concise learning summary report by email.',
      },
      {
        icon: Mail,
        title: 'Simple parent outcome',
        body: 'No group funnel or consultation step is required: complete the test and receive the report.',
      },
    ],
    []
  )

  function updateForm(track, field, value) {
    setForms((prev) => ({
      ...prev,
      [track]: {
        ...prev[track],
        [field]: value,
      },
    }))
  }

  function updateAssessmentAnswer(track, questionId, value) {
    setForms((prev) => ({
      ...prev,
      [track]: {
        ...prev[track],
        assessmentAnswers: {
          ...(prev[track].assessmentAnswers || {}),
          [questionId]: value,
        },
      },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = buildSubmissionPayload(activeTrack, currentForm)

    if (!payload.email || !payload.email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email so we can send the AI report.' })
      return
    }

    const answeredCount = Object.keys(payload.assessmentAnswers || {}).length
    const questionCount = assessmentQuestions[activeTrack].length
    if (answeredCount < questionCount) {
      setStatus({
        type: 'error',
        message: `Please answer all ${questionCount} assessment questions before submitting.`,
      })
      return
    }

    setStatus({ type: 'loading', message: 'Submitting online test...' })

    try {
      if (submitEndpoint) {
        const response = await fetch(submitEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Failed to submit learning checkup')
        }

        const data = await response.json()
        setStatus({
          type: 'success',
          message: `Your online test is complete. The learning summary report has been prepared for ${payload.email}.`,
          report: data?.report || '',
        })
        return
      }

      const report = buildLocalReport(payload)
      const emailSent = await sendEmailReport(payload, report)

      if (emailSent) {
        setStatus({
          type: 'success',
          message: `Your online test is complete. The learning summary report has been sent to ${payload.email}.`,
          report,
        })
        return
      }

      setStatus({
        type: 'info',
        message: 'Your online test is complete. Email delivery is not configured on this site yet, so the learning summary report is shown below.',
        report,
      })
    } catch (error) {
      console.error(error)
      const report = buildLocalReport(payload)
      setStatus({
        type: 'info',
        message: 'Your online test is complete. The email service is temporarily unavailable, so the learning summary report is shown below.',
        report,
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-800 px-6 py-16 text-white shadow-xl lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-indigo-100">
              <Sparkles className="h-4 w-4" />
              Free AI Learning Checkup
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Free Selective / OC / HSC Learning Checkup
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-200">
              A fast parent-friendly checkup page that helps families understand where a student stands, what may be holding them back, and what the next study priorities should be.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#checkup-form" className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">
                Start the online test
              </a>
            </div>
          </div>
          <Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">What families receive</CardTitle>
              <CardDescription className="text-slate-200">
                Complete the online test and receive a learning summary report by email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportHighlights.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                  <TrendingUp className="mt-0.5 h-5 w-5 text-indigo-200" />
                  <p className="text-sm text-slate-100">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {introCards.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.body}</CardDescription>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </section>

      <section id="checkup-form" className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Student assessment form</CardTitle>
              <CardDescription>
                Choose the student pathway below. This first version is designed to be short, useful, and easy for parents to complete.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTrack} onValueChange={setActiveTrack} className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-slate-100 p-1">
                  {Object.entries(tracks).map(([key, value]) => (
                    <TabsTrigger key={key} value={key} className="py-2 text-sm">
                      {value.shortLabel}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(tracks).map(([key, value]) => (
                  <TabsContent key={key} value={key} className="mt-6">
                    <div className="mb-6 rounded-2xl bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">{value.label}</h3>
                      <p className="mt-2 text-sm text-slate-600">{value.audience}</p>
                      <p className="mt-1 text-sm text-slate-500">Goal: {value.goal}</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Parent name">
                          <Input value={forms[key].parentName} onChange={(e) => updateForm(key, 'parentName', e.target.value)} placeholder="e.g. Jenny Chen" />
                        </Field>
                        <Field label="Student name">
                          <Input value={forms[key].studentName} onChange={(e) => updateForm(key, 'studentName', e.target.value)} placeholder="e.g. Ethan" />
                        </Field>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Email for learning summary report">
                          <Input type="email" value={forms[key].email} onChange={(e) => updateForm(key, 'email', e.target.value)} placeholder="parent@example.com" />
                        </Field>
                        <Field label="Mobile (optional)">
                          <Input value={forms[key].phone} onChange={(e) => updateForm(key, 'phone', e.target.value)} placeholder="0412 345 678" />
                        </Field>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Current year level">
                          <Select value={forms[key].grade} onValueChange={(value) => updateForm(key, 'grade', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose year level" />
                            </SelectTrigger>
                            <SelectContent>
                              {gradeOptions[key].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Current performance level">
                          <Select value={forms[key].currentLevel} onValueChange={(value) => updateForm(key, 'currentLevel', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select current level" />
                            </SelectTrigger>
                            <SelectContent>
                              {scoreOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Target goal">
                          <Input value={forms[key].targetGoal} onChange={(e) => updateForm(key, 'targetGoal', e.target.value)} placeholder="e.g. OC test this year / top selective / Band 6" />
                        </Field>
                        <Field label="Biggest strength area">
                          <Input value={forms[key].strengthArea} onChange={(e) => updateForm(key, 'strengthArea', e.target.value)} placeholder="e.g. reading, algebra, essay ideas" />
                        </Field>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Weakest area right now">
                          <Select value={forms[key].weakArea} onValueChange={(value) => updateForm(key, 'weakArea', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select weak area" />
                            </SelectTrigger>
                            <SelectContent>
                              {focusAreas[key].map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Weekly self-study time">
                          <Select value={forms[key].studyTime} onValueChange={(value) => updateForm(key, 'studyTime', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose study time" />
                            </SelectTrigger>
                            <SelectContent>
                              {studyTimeOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <Field label="Tutoring history">
                        <Select value={forms[key].tutoringHistory} onValueChange={(value) => updateForm(key, 'tutoringHistory', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose tutoring history" />
                          </SelectTrigger>
                          <SelectContent>
                            {tutoringOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      <Field label="Main concern from parent / student">
                        <textarea
                          className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={forms[key].concern}
                          onChange={(e) => updateForm(key, 'concern', e.target.value)}
                          placeholder="What is the main problem right now? Low confidence, weak writing, poor exam technique, inconsistent study habits, etc."
                        />
                      </Field>

                      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">
                            10-question skills check
                          </h4>
                          <p className="mt-1 text-sm text-slate-600">
                            Answer these quick questions so the report can estimate the student&apos;s current skill level.
                          </p>
                        </div>
                        <div className="space-y-4">
                          {assessmentQuestions[key].map((question, index) => (
                            <div key={question.id} className="rounded-xl bg-slate-50 p-4">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                                <p className="font-medium text-slate-900">
                                  {index + 1}. {question.question}
                                </p>
                                <span className="shrink-0 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                                  {question.skill}
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {question.options.map((option) => {
                                  const selected = forms[key].assessmentAnswers?.[question.id] === option
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => updateAssessmentAnswer(key, question.id, option)}
                                      className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                                        selected
                                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/60'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                        After submission, the flow is: do the online test → receive the learning summary report by email.
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={status.type === 'loading'}>
                        {status.type === 'loading' ? 'Submitting...' : 'Submit online test'}
                      </Button>
                    </form>
                  </TabsContent>
                ))}
              </Tabs>

              {status.message ? (
                <div
                  className={`mt-6 rounded-2xl p-4 text-sm ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800'
                      : status.type === 'error'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {status.message}
                  {status.report ? (
                    <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-white/70 p-4 text-slate-800">
                      {status.report}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  Learning summary by email
                </CardTitle>
                <CardDescription>
                  The intended result is simple: finish the online test and receive the report by email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>Correct flow:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Complete the online test.</li>
                  <li>Generate a concise AI diagnostic report with study priorities.</li>
                  <li>Send the learning summary report to the parent email.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      {children}
    </label>
  )
}

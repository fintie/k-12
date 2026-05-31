import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Sparkles, Target, TrendingUp, Users } from 'lucide-react'

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
})

const reportHighlights = [
  'A short AI readiness summary tailored to the selected exam path',
  'Likely strength areas and risk areas based on the submitted answers',
  '3 practical next steps parents and students can act on immediately',
]

function buildSubmissionPayload(track, values) {
  return {
    track,
    trackLabel: tracks[track].label,
    ...values,
    submittedAt: new Date().toISOString(),
  }
}

export default function LearningCheckup() {
  const [activeTrack, setActiveTrack] = useState('oc')
  const [forms, setForms] = useState({
    oc: initialForm('oc'),
    selective: initialForm('selective'),
    hsc: initialForm('hsc'),
  })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const currentTrack = tracks[activeTrack]
  const currentForm = forms[activeTrack]

  const submitEndpoint = import.meta.env.VITE_LEARNING_CHECKUP_API_URL || '/api/learning-checkup'
  const fallbackRecipient = import.meta.env.VITE_SUBSCRIBE_RECIPIENT
  const whatsappUrl = import.meta.env.VITE_K12_WHATSAPP_URL || 'https://wa.me/'
  const communityUrl = import.meta.env.VITE_K12_COMMUNITY_URL || whatsappUrl

  const introCards = useMemo(
    () => [
      {
        icon: Target,
        title: 'Clear exam positioning',
        body: 'Quickly understand whether a student is currently under-prepared, on track, or ready to accelerate.',
      },
      {
        icon: Sparkles,
        title: 'AI-generated learning report',
        body: 'After submission, families can receive a concise AI checkup summary and suggested next steps by email.',
      },
      {
        icon: Users,
        title: 'Family follow-up channel',
        body: 'Guide parents into a WhatsApp or WeChat community for support, reminders, and program updates.',
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

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = buildSubmissionPayload(activeTrack, currentForm)

    if (!payload.email || !payload.email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email so we can send the AI report.' })
      return
    }

    setStatus({ type: 'loading', message: 'Submitting checkup...' })

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

        setStatus({
          type: 'success',
          message: 'Thanks — the checkup was submitted and the AI report workflow has been triggered for this email.',
        })
        return
      }

      if (fallbackRecipient) {
        const response = await fetch(`https://formsubmit.co/ajax/${fallbackRecipient}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            _subject: `${payload.trackLabel} learning checkup request`,
            message: JSON.stringify(payload, null, 2),
          }),
        })

        if (!response.ok) {
          throw new Error('Fallback submission failed')
        }

        setStatus({
          type: 'success',
          message: 'Submitted. The intake was captured and is ready to be used for an AI report email follow-up.',
        })
        return
      }

      setStatus({
        type: 'info',
        message: 'The page UI is ready, but the email/report endpoint is not configured yet. Connect VITE_LEARNING_CHECKUP_API_URL to activate automatic AI email reports.',
      })
    } catch (error) {
      console.error(error)
      setStatus({ type: 'error', message: 'Submission failed. Please try again or contact us on WhatsApp.' })
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
                Start the free checkup
              </a>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10">
                Talk on WhatsApp
              </a>
            </div>
          </div>
          <Card className="border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">What families receive</CardTitle>
              <CardDescription className="text-slate-200">
                A simple lead-generation and diagnosis flow you can extend later with full AI automation.
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
                        <Field label="Email for AI report">
                          <Input type="email" value={forms[key].email} onChange={(e) => updateForm(key, 'email', e.target.value)} placeholder="parent@example.com" />
                        </Field>
                        <Field label="WhatsApp / mobile (optional)">
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

                      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                        After submission, the intended flow is: capture intake → generate AI learning summary → email report → invite the family into WhatsApp / WeChat follow-up.
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={status.type === 'loading'}>
                        {status.type === 'loading' ? 'Submitting...' : 'Get free learning checkup'}
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
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  AI report by email
                </CardTitle>
                <CardDescription>
                  This page is already structured for automatic email delivery once the report endpoint is connected.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>Recommended production flow:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Store the intake with track + answers + email.</li>
                  <li>Generate a concise AI diagnostic report with study priorities.</li>
                  <li>Send the result to the family email automatically.</li>
                  <li>Optionally notify staff or push the lead into CRM/Sheets.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  Community follow-up
                </CardTitle>
                <CardDescription>
                  Give parents a fast next step after the form: join your WhatsApp or WeChat support channel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  <span>Open WhatsApp consultation</span>
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={communityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  <span>Join WeChat / parent community</span>
                  <Users className="h-4 w-4" />
                </a>
                <p className="text-xs text-slate-500">
                  Tip: wire these links to your real WhatsApp deep link or a QR/community landing page via env vars.
                </p>
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

import { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import {
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Star,
  GraduationCap,
  BadgeCheck,
  Mail,
  Clock3,
  BadgeDollarSign,
  Phone,
  Home,
  Video,
  PencilLine,
  Trophy,
  HeartHandshake,
} from 'lucide-react'

import heroImage from '../assets/new-tutors/classroom-1.jpg'
import galleryTwo from '../assets/new-tutors/classroom-2.jpg'
import galleryThree from '../assets/new-tutors/classroom-3.jpg'
import galleryFour from '../assets/new-tutors/classroom-4.jpg'
import galleryFive from '../assets/new-tutors/classroom-5.jpg'
import gallerySix from '../assets/new-tutors/classroom-6.jpg'
import gallerySeven from '../assets/new-tutors/classroom-7.jpg'

const profileHighlights = [
  'Friendly K-12 maths tutoring community',
  'Verified, premium-feeling tutor profiles',
  'Flexible online and Sydney tutoring options',
  'Better visibility with the right families',
]

const supportPillars = [
  {
    icon: BadgeCheck,
    title: 'Profile credibility',
    body: 'A stronger presentation helps families trust the tutor faster, with clearer signals around quality, communication, and subject fit.',
  },
  {
    icon: Users,
    title: 'Student matching',
    body: 'We want tutors to feel visible to the right families, not buried in a generic list without context or personality.',
  },
  {
    icon: GraduationCap,
    title: 'Teaching-first brand',
    body: 'The page should feel human and tutor-centric, with more warmth, proof, and personal teaching style.',
  },
  {
    icon: TrendingUp,
    title: 'Growth over time',
    body: 'Start with a strong profile format, then expand into subscriber leads, applications, and qualified student demand.',
  },
]

const subjectsByLevel = [
  {
    level: 'Primary and Year 7 to 10',
    subjects: ['General maths support', 'Numeracy confidence', 'Homework help', 'School assessments'],
  },
  {
    level: 'Year 11 to 12',
    subjects: ['Mathematics Standard', 'Mathematics Advanced', 'Extension pathways', 'Exam technique and revision'],
  },
  {
    level: 'Enrichment',
    subjects: ['Selective school preparation', 'Problem-solving extension', 'Study habits', 'Confidence building'],
  },
]

const services = [
  'One-to-one tuition',
  'Online help',
  'In-person support',
  'Homework guidance',
  'Exam preparation',
  'Parent progress updates',
]

const tutorBenefits = [
  'Show a more polished public profile with a warm, parent-friendly tone',
  'Highlight rate, services, subjects, and teaching strengths clearly',
  'Present achievements and educational background in a trustworthy way',
  'Attract families looking for the right fit, not just the cheapest option',
  'Make it easier for tutors to explain their approach and build confidence with parents',
  'Support premium tutor positioning instead of a plain directory listing',
]

const achievements = [
  'Strong HSC and senior maths subject outcomes',
  'Experience tutoring K-12 students with measurable progress',
  'Ability to explain difficult concepts in a calm, supportive way',
  'Clear communication with both students and parents',
]

const teachingStyle = [
  'Patient and confidence-building',
  'Adaptable to different learning styles',
  'Focused on exam technique and long-term understanding',
  'Supportive, clear, and structured from lesson to lesson',
]

const faqItems = [
  {
    question: 'Who is this page designed for?',
    answer: 'Tutors who want a stronger, more professional profile presence and a better way to attract maths students and families.',
  },
  {
    question: 'Can this support both online and in-person tutors?',
    answer: 'Yes. The profile style works for online-only tutors, hybrid tutors, or Sydney-based in-person tutoring options.',
  },
  {
    question: 'Why include a subscriber section?',
    answer: 'It helps build an early list of interested tutors so onboarding, profile creation, and lead matching can start with real demand.',
  },
]

const gallery = [
  { src: galleryTwo, alt: 'Classroom teaching session' },
  { src: galleryThree, alt: 'Tutor leading a lesson' },
  { src: galleryFour, alt: 'Students participating in class' },
  { src: galleryFive, alt: 'Focused student in classroom' },
  { src: gallerySix, alt: 'Interactive classroom moment' },
  { src: gallerySeven, alt: 'Student proud of math progress' },
]

const initialForm = {
  name: '',
  email: '',
}

export default function NewTutors() {
  const [formData, setFormData] = useState(initialForm)
  const [formStatus, setFormStatus] = useState({ type: 'idle', message: '' })

  const hasEmailConfig = useMemo(() => {
    return Boolean(
      import.meta.env.VITE_EMAILJS_SERVICE_ID &&
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
  }, [])

  const handleChange = (field) => (event) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubscribe = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      setFormStatus({ type: 'error', message: 'Please enter your name.' })
      return
    }

    if (!formData.email.trim()) {
      setFormStatus({ type: 'error', message: 'Please enter your email.' })
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(formData.email.trim())) {
      setFormStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    if (!hasEmailConfig) {
      setFormStatus({
        type: 'success',
        message: 'The tutor subscriber form is live, but EmailJS is not configured yet. Add the EmailJS env keys to receive tutor subscriber emails.',
      })
      return
    }

    try {
      await emailjsSend(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name.trim(),
          from_email: formData.email.trim(),
          enquiry_type: 'Tutor subscriber',
          message: `Tutor subscriber request from ${formData.name.trim()} (${formData.email.trim()})`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setFormData(initialForm)
      setFormStatus({ type: 'success', message: 'Thanks, you are on the tutor subscriber list.' })
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Something went wrong while submitting. Please try again.' })
    }
  }

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <Star className="h-4 w-4" />
              Tutor profile inspired layout
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              A tutor profile page that feels warm, credible, and parent-friendly
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              We are moving this page closer to a real tutor listing style, with profile strength, trust signals, subject clarity, and a clearer path for tutors to join.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#profile-card"
                className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
              >
                See profile layout
              </a>
              <a
                href="#subscribe"
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Join tutor list
              </a>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {profileHighlights.map((item) => (
                <div key={item} className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-slate-100 ring-1 ring-white/10">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-[320px] lg:min-h-full">
            <img src={heroImage} alt="Teacher leading a class" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {supportPillars.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          )
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]" id="profile-card">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                <BadgeCheck className="h-4 w-4" />
                Very responsive
              </div>
              <h2 className="mt-4 text-3xl font-bold text-slate-900">NextGenius Maths Tutor</h2>
              <p className="mt-2 text-slate-600">Private tutor profile preview for Sydney and online families</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> Sydney, NSW</span>
                <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-blue-600" /> Verified profile style</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
              <p className="text-sm text-slate-500">Rate</p>
              <p className="mt-1 inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
                <BadgeDollarSign className="h-6 w-6 text-blue-600" />
                $65+
              </p>
              <p className="text-sm text-slate-500">per hour</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Services</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {services.map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Tutor style</h3>
              <div className="mt-4 space-y-3">
                {teachingStyle.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <HeartHandshake className="mt-0.5 h-4 w-4 flex-none text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-900">About</h3>
            <p className="mt-4 text-slate-600 leading-7">
              This profile direction is designed to feel closer to a real tutor listing. It gives tutors space to explain their strengths, share their background, and show families how they teach. The tone should feel warm, trustworthy, and academically strong, especially for maths tutoring across K-12 and HSC pathways.
            </p>
            <p className="mt-4 text-slate-600 leading-7">
              We want tutors to look approachable and capable, not generic. That means clearly presenting subjects, service options, teaching style, educational background, and the kind of student support they provide.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
            <div className="flex items-center gap-3 text-blue-200">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">What families notice first</span>
            </div>
            <div className="mt-6 space-y-4 text-slate-200">
              <div className="flex items-start gap-3">
                <BookOpen className="mt-1 h-5 w-5 flex-none text-blue-300" />
                <span>Clear subject coverage and year-level support</span>
              </div>
              <div className="flex items-start gap-3">
                <Video className="mt-1 h-5 w-5 flex-none text-blue-300" />
                <span>Online, in-person, and flexible tutoring formats</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 flex-none text-blue-300" />
                <span>Responsiveness and easy communication with parents</span>
              </div>
              <div className="flex items-start gap-3">
                <Home className="mt-1 h-5 w-5 flex-none text-blue-300" />
                <span>A stronger local trust signal for Sydney families</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-bold text-slate-900">Why this profile format works better</h3>
            <div className="mt-5 space-y-4">
              {tutorBenefits.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-600" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-blue-50 p-8 shadow-sm">
          <div className="flex items-center gap-3 text-blue-700">
            <PencilLine className="h-5 w-5" />
            <h2 className="text-2xl font-bold text-slate-900">Subjects and year levels</h2>
          </div>
          <div className="mt-6 space-y-5">
            {subjectsByLevel.map((group) => (
              <div key={group.level} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">{group.level}</h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {group.subjects.map((subject) => (
                    <span key={subject} className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3 text-blue-700">
            <Trophy className="h-5 w-5" />
            <h2 className="text-2xl font-bold text-slate-900">Achievements and teaching strengths</h2>
          </div>
          <div className="mt-6 space-y-4">
            {achievements.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-slate-600 leading-7">
            This section can later become dynamic per tutor, with real marks, university background, specialist subjects, and personal achievements shown in a much more compelling way.
          </p>
        </div>
      </section>

      <section className="rounded-3xl bg-blue-50 p-8 sm:p-10" id="subscribe">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Join the tutor subscriber list</h2>
            <p className="mt-4 max-w-2xl text-slate-600 leading-7">
              If you want to be part of the tutor network, leave your details here. This lets us contact interested tutors when profile onboarding, tutor applications, or student matching opportunities open.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-sm text-slate-700">Build early interest before full tutor onboarding launches</span>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-sm text-slate-700">Collect potential tutor leads in a cleaner, more professional way</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 text-blue-700">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tutor subscriber</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Stay in the loop</h3>
            <p className="mt-3 text-slate-600 leading-7">
              Leave your name and email to receive updates about tutor opportunities.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Your name"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Subscribe as a tutor
              </button>
              {formStatus.message ? (
                <p className={`text-sm ${formStatus.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                  {formStatus.message}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {faqItems.map((item) => (
          <div key={item.question} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tutor-friendly visual direction</h2>
            <p className="mt-2 text-slate-600">Warm, credible, and more personal than a plain tutoring directory card.</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {gallery.map((image) => (
            <div key={image.src} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src={image.src} alt={image.alt} className="h-64 w-full object-cover transition duration-300 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

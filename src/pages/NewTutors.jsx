import { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import {
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Rocket,
  Star,
  GraduationCap,
  BadgeCheck,
  Mail,
  Clock3,
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
  'Online and Sydney-focused opportunities',
  'Flexible student matching and scheduling',
  'Professional brand and parent-facing support',
]

const tutorBenefits = [
  'Build a polished tutor profile that parents can trust',
  'Receive matched inquiries from families seeking maths support',
  'Focus on teaching while the platform supports visibility and growth',
  'Highlight your teaching style, strengths, and year-level expertise',
  'Join a curated tutor network instead of competing in a crowded directory',
  'Get early access to new student demand as the tutor network expands',
]

const idealTutorTraits = [
  'Warm, reliable, and confident communicating with both students and parents',
  'Strong maths teaching ability across primary, junior high school, or HSC levels',
  'Able to explain clearly, build confidence, and support long-term progress',
  'Comfortable teaching online and maintaining structured lesson follow-up',
  'Interested in being part of a high-quality tutoring brand, not just a one-off listing',
  'Bonus: selective school prep, extension maths, olympiad, or advanced senior maths experience',
]

const supportPillars = [
  {
    icon: BadgeCheck,
    title: 'Credible profile positioning',
    body: 'Present tutors with a more premium, trustworthy profile feel so parents quickly understand experience, teaching style, and subject fit.',
  },
  {
    icon: Users,
    title: 'Better family fit',
    body: 'Help the right families find the right tutor based on year level, goals, pace, and communication style.',
  },
  {
    icon: GraduationCap,
    title: 'Teaching-first brand',
    body: 'The page is designed to feel supportive and human, with less corporate language and more tutor personality.',
  },
  {
    icon: TrendingUp,
    title: 'Growth pathway',
    body: 'Start with strong tutor profiles, subscriber interest, and curated demand before scaling the network further.',
  },
]

const faqItems = [
  {
    question: 'Who is this for?',
    answer: 'Maths tutors who want to work with K-12 students and be part of a stronger, more trustworthy tutoring experience for families.',
  },
  {
    question: 'Do tutors need to be in Sydney?',
    answer: 'Sydney familiarity is helpful, especially for NSW curriculum and HSC alignment, but strong online tutors may also be a fit.',
  },
  {
    question: 'What makes this different from a directory listing?',
    answer: 'This is positioned more like a curated tutoring community with stronger profile presentation, better trust signals, and a clearer student-matching experience.',
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
  email: '',
}

export default function NewTutors() {
  const [email, setEmail] = useState(initialForm.email)
  const [formStatus, setFormStatus] = useState({ type: 'idle', message: '' })

  const hasEmailConfig = useMemo(() => {
    return Boolean(
      import.meta.env.VITE_EMAILJS_SERVICE_ID &&
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID &&
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
  }, [])

  const handleSubscribe = async (event) => {
    event.preventDefault()

    if (!email.trim()) {
      setFormStatus({ type: 'error', message: 'Please enter your email.' })
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      setFormStatus({ type: 'error', message: 'Please enter a valid email address.' })
      return
    }

    if (!hasEmailConfig) {
      setFormStatus({
        type: 'success',
        message: 'The subscriber form is ready, but EmailJS is not configured yet. Add the EmailJS env keys to start receiving tutor subscriber emails.',
      })
      return
    }

    try {
      await emailjsSend(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_email: email.trim(),
          enquiry_type: 'Tutor subscriber',
          message: `Tutor subscriber request from ${email.trim()}`,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setEmail(initialForm.email)
      setFormStatus({ type: 'success', message: 'Thanks, you are on the tutor subscriber list.' })
    } catch (error) {
      setFormStatus({ type: 'error', message: 'Something went wrong while submitting. Please try again.' })
    }
  }

  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <Star className="h-4 w-4" />
              Tutor community, not just another listing
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              A friendlier home for maths tutors who want the right students
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              We are shaping a tutor-first experience that feels more personal, credible, and supportive, so great tutors can stand out to families without sounding generic.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#subscribe"
                className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
              >
                Join tutor updates
              </a>
              <a
                href="#profile"
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                See tutor profile style
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

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4" id="profile">
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

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-blue-700">
            <span className="rounded-full bg-blue-50 px-3 py-1">Tutor profile direction</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Parent-friendly tone</span>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900">What a stronger tutor profile should feel like</h2>
          <p className="mt-4 text-slate-600 leading-7">
            Instead of a cold listing, this page should make tutors feel approachable, capable, and easy to trust. Families should quickly see teaching warmth, maths expertise, communication style, and the type of student support a tutor provides.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {tutorBenefits.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-600" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 text-blue-200">
            <GraduationCap className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tutor snapshot</span>
          </div>
          <h3 className="mt-4 text-2xl font-bold">Friendly, clear, and confidence-building</h3>
          <p className="mt-4 text-slate-200 leading-7">
            The best tutor profiles usually balance expertise with warmth. Parents want evidence of strong subject knowledge, but they also want someone their child will actually feel comfortable learning with.
          </p>
          <div className="mt-6 space-y-4 text-slate-200">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 flex-none text-blue-300" />
              <span>Sydney and NSW curriculum alignment helps increase trust for local families.</span>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-1 h-5 w-5 flex-none text-blue-300" />
              <span>Flexible online sessions make it easier to support busy school schedules.</span>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="mt-1 h-5 w-5 flex-none text-blue-300" />
              <span>Clear teaching style and subject strengths help families choose the right tutor faster.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-blue-50 p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Who we want in the tutor network</h2>
            <p className="mt-4 max-w-2xl text-slate-600 leading-7">
              We are looking for tutors who are strong in maths and genuinely good with people. This should feel welcoming for tutors who care about teaching quality, communication, and student confidence.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {idealTutorTraits.map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200" id="subscribe">
            <div className="flex items-center gap-3 text-blue-700">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tutor subscriber</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Join the tutor subscriber list</h3>
            <p className="mt-3 text-slate-600 leading-7">
              Leave your email to hear when tutor onboarding opens, when new student demand is available, and when profile applications go live.
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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

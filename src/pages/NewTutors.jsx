import { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import {
  CheckCircle2,
  Star,
  Mail,
  Clock3,
  PencilLine,
  Trophy,
} from 'lucide-react'

import heroImage from '../assets/new-tutors/classroom-1.jpg'
import galleryTwo from '../assets/new-tutors/classroom-2.jpg'
import galleryThree from '../assets/new-tutors/classroom-3.jpg'
import galleryFour from '../assets/new-tutors/classroom-4.jpg'
import galleryFive from '../assets/new-tutors/classroom-5.jpg'
import gallerySix from '../assets/new-tutors/classroom-6.jpg'
import gallerySeven from '../assets/new-tutors/classroom-7.jpg'

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

const achievements = [
  'Strong HSC and senior maths subject outcomes',
  'Experience tutoring K-12 students with measurable progress',
  'Ability to explain difficult concepts in a calm, supportive way',
  'Clear communication with both students and parents',
]

const faqItems = [
  {
    question: 'Who should apply?',
    answer: 'We welcome tutors who can support K-12 students with clear teaching, reliable communication, and strong subject knowledge.',
  },
  {
    question: 'What information should I prepare?',
    answer: 'Please prepare your teaching background, subjects, year levels, hourly rate, academic results, and a short introduction about how you teach.',
  },
  {
    question: 'What happens after I submit?',
    answer: 'We will review your registration details and contact suitable tutors about next steps.',
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
  fullName: '',
  email: '',
  location: '',
  hourlyRate: '',
  services: '',
  subjects: '',
  verifiedMarks: '',
  about: '',
  achievements: '',
  education: '',
  interests: '',
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

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.fullName.trim()) {
      setFormStatus({ type: 'error', message: 'Please enter your full name.' })
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
        message: 'The Tutor Registration form is ready, but EmailJS is not configured yet. Add the EmailJS env keys to receive real tutor registrations.',
      })
      return
    }

    try {
      await emailjsSend(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.fullName.trim(),
          from_email: formData.email.trim(),
          enquiry_type: 'Tutor Registration',
          message: JSON.stringify(formData, null, 2),
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )

      setFormData(initialForm)
      setFormStatus({ type: 'success', message: 'Thanks, your tutor registration has been submitted.' })
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
              Tutor Registration
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Register as a tutor with a profile families can trust
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#registration-form"
                className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
              >
                Start registration
              </a>
            </div>
          </div>
          <div className="min-h-[320px] lg:min-h-full">
            <img src={heroImage} alt="Teacher leading a class" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <img src={galleryTwo} alt="Tutor supporting students in class" className="h-72 w-full object-cover" />
          <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-900">Why tutors join</h2>
            <div className="mt-6 space-y-4">
              {[
                'Share your teaching experience and subject strengths clearly',
                'Show the year levels and learning support you offer',
                'Introduce your tutoring style and approach with confidence',
                'Apply for online or Sydney-based K-12 tutoring opportunities',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <img src={galleryThree} alt="Tutor leading a lesson" className="h-72 w-full object-cover" />
          <div className="p-8">
            <h2 className="text-3xl font-bold text-slate-900">What to prepare</h2>
            <div className="mt-6 space-y-4">
              {[
                'Your subjects, year levels, and tutoring services',
                'Your hourly rate and preferred teaching format',
                'Academic background, results, or achievements',
                'A short introduction about your teaching style',
              ].map((item) => (
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
        </div>
      </section>

      <section className="rounded-3xl bg-blue-50 p-8 sm:p-10" id="registration-form">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Tutor Registration Form</h2>
            <p className="mt-4 max-w-2xl text-slate-600 leading-7">
              Fill in your tutor details below so we can review your experience, subjects, and teaching background.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 max-w-xl">
              <img src={gallerySix} alt="Tutor working with students" className="h-48 w-full object-cover" />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 text-blue-700">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">Tutor Registration</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Register your tutor profile</h3>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                <input type="text" value={formData.fullName} onChange={handleChange('fullName')} placeholder="Your full name" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
                <input type="email" value={formData.email} onChange={handleChange('email')} placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Location</span>
                <input type="text" value={formData.location} onChange={handleChange('location')} placeholder="Redfern, Sydney, NSW" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Hourly rate</span>
                <input type="text" value={formData.hourlyRate} onChange={handleChange('hourlyRate')} placeholder="$65 per hour" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Services</span>
                <textarea value={formData.services} onChange={handleChange('services')} rows={3} placeholder="One-to-one tuition, home visits, online help, phone help" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Subjects and year levels</span>
                <textarea value={formData.subjects} onChange={handleChange('subjects')} rows={4} placeholder="Year 7-10 maths, Year 11-12 Mathematics Advanced, Extension Maths, selective school prep" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Verified marks or academic results</span>
                <textarea value={formData.verifiedMarks} onChange={handleChange('verifiedMarks')} rows={3} placeholder="Band 6 Maths Advanced, E4 Extension 1, E4 Extension 2" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">About</span>
                <textarea value={formData.about} onChange={handleChange('about')} rows={5} placeholder="Tell families about yourself, your experience, and how you teach." className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Achievements</span>
                <textarea value={formData.achievements} onChange={handleChange('achievements')} rows={4} placeholder="Academic prizes, tutoring milestones, competition results, performances, awards" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Education</span>
                <textarea value={formData.education} onChange={handleChange('education')} rows={4} placeholder="School, university, degree, graduation year, relevant study background" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Interests</span>
                <textarea value={formData.interests} onChange={handleChange('interests')} rows={3} placeholder="Reading, sports, music, creative writing, coding" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
              </label>

              <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800">
                Submit Tutor Registration
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
          {gallery.slice(0, 3).map((image) => (
            <div key={image.src} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src={image.src} alt={image.alt} className="h-64 w-full object-cover transition duration-300 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  MapPin,
  Rocket,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'

import heroImage from '../assets/new-tutors/classroom-2.jpg'
import featureImageOne from '../assets/new-tutors/classroom-1.jpg'
import featureImageTwo from '../assets/new-tutors/classroom-3.jpg'
import galleryOne from '../assets/new-tutors/classroom-4.jpg'
import galleryTwo from '../assets/new-tutors/classroom-5.jpg'
import galleryThree from '../assets/new-tutors/classroom-6.jpg'
import galleryFour from '../assets/new-tutors/classroom-7.jpg'

const highlightCards = [
  {
    icon: BookOpen,
    title: 'Structured K-12 math support',
    body: 'A focused learning platform built around math foundations, school support, homework review, and measurable progress.',
  },
  {
    icon: MapPin,
    title: 'Sydney tutor advantage',
    body: 'Local tutors bring curriculum familiarity, HSC relevance, stronger parent trust, and better one-on-one outcomes.',
  },
  {
    icon: TrendingUp,
    title: 'Progress families can see',
    body: 'Parents want trusted tutors, flexibility, clear reporting, and exam-focused support that turns into real results.',
  },
]

const demandAreas = [
  'Primary school math foundations',
  'Year 7-10 school support',
  'Year 11-12 HSC math preparation',
  'Premium one-on-one tutoring',
  'Parent reporting and communication',
]

const partnershipBenefits = [
  'Access to qualified student leads',
  'Less admin burden for tutors',
  'Structured tutoring workflow',
  'Stronger parent retention',
  'Recurring income potential',
  'Premium tutoring pathways',
]

const gallery = [galleryOne, galleryTwo, galleryThree, galleryFour]

const Homepage = () => {
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState(null)

  const subscribeMessage = useMemo(() => {
    if (subscribeStatus === 'sent') return 'Subscription successful, check your inbox.'
    if (subscribeStatus === 'invalid') return 'Please enter a valid email.'
    if (subscribeStatus === 'error') return 'Subscription failed. Check console for details.'
    return ''
  }, [subscribeStatus])

  async function handleSubscribe() {
    setSubscribeStatus('loading')
    if (!email || !email.includes('@')) {
      setSubscribeStatus('invalid')
      return
    }

    const apiUrl = import.meta.env.VITE_NEWSLETTER_API_URL
    const recipient = import.meta.env.VITE_SUBSCRIBE_RECIPIENT
    const emailjsService = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const emailjsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const emailjsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    try {
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        if (!res.ok) throw new Error('subscribe failed')
        setSubscribeStatus('sent')
        return
      }

      if (emailjsService && emailjsTemplate && emailjsKey) {
        const templateParams = {
          to_email: email,
          message: 'Subscribe and we will help set up your AI Agent Tutor account.',
        }
        await emailjsSend(emailjsService, emailjsTemplate, templateParams, emailjsKey)
        setSubscribeStatus('sent')
        return
      }

      if (recipient) {
        const res = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            message: 'Subscribe and we will help set up your AI Agent Tutor account.',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'subscribe failed')
        setSubscribeStatus('sent')
        return
      }

      setSubscribeStatus('error')
    } catch (err) {
      console.error('Subscribe error:', err)
      setSubscribeStatus('error')
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-900/30" />
        <img src={heroImage} alt="Students learning in class" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative mx-auto grid min-h-[540px] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100 backdrop-blur">
              <Star className="h-4 w-4" />
              NextGenius STEM x Sydney Tutors
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              A stronger K-12 math platform, powered by trusted Sydney tutors
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              We combine digital learning structure with high-quality local tutors to support math foundations,
              school performance, HSC preparation, and premium one-on-one growth.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/new-tutors"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-blue-400"
              >
                Explore New Tutors
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#subscribe"
                className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Join the waitlist
              </a>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl bg-white/10 p-6 backdrop-blur-sm">
            <div className="rounded-2xl bg-white/10 p-5">
              <h2 className="text-xl font-semibold">Why this matters</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Sydney has strong recurring demand for K-12 tutoring. Parents want trusted tutors, flexibility,
                measurable progress, and exam-focused outcomes, especially in math.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <h2 className="text-xl font-semibold">Recommended launch model</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Start with a curated cohort of 3 to 5 tutors and a 6 to 8 week pilot focused on K-12 math only.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <h2 className="text-xl font-semibold">Best first monetization step</h2>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Begin with revenue share, then expand into platform fees or premium matching once demand is proven.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {highlightCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.body}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <img src={featureImageOne} alt="Teacher presenting to students" className="h-72 w-full object-cover" />
          <div className="p-8">
            <h2 className="text-3xl font-bold">Where demand is strongest</h2>
            <div className="mt-6 space-y-4">
              {demandAreas.map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {index + 1}
                  </div>
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
          <img src={featureImageTwo} alt="Tutor engaging a classroom" className="h-72 w-full object-cover" />
          <div className="p-8">
            <h2 className="text-3xl font-bold">Tutor benefits</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {partnershipBenefits.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-600" />
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">Learning moments that build trust</h2>
              <p className="mt-2 text-slate-600">
                A stronger tutoring experience is built around engagement, clarity, and visible progress.
              </p>
            </div>
            <a href="/new-tutors" className="hidden items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 md:inline-flex">
              View the full New Tutors page
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {gallery.map((image, index) => (
              <div key={image} className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200">
                <img src={image} alt={`Classroom gallery ${index + 1}`} className="h-64 w-full object-cover transition duration-300 hover:scale-105" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8" id="subscribe">
        <div className="rounded-3xl bg-blue-50 p-8 sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm">
                <Rocket className="h-4 w-4" />
                Early access and tutor onboarding
              </div>
              <h2 className="mt-5 text-3xl font-bold text-slate-900 sm:text-4xl">
                Join the next phase of K-12 math support
              </h2>
              <p className="mt-4 max-w-2xl text-slate-600">
                Subscribe and we will help set up your AI Agent Tutor account, share pilot updates, and keep you informed as new tutor capacity opens.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleSubscribe}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                {subscribeStatus === 'loading' ? 'Sending...' : 'Subscribe'}
              </button>
              <p className="mt-3 min-h-5 text-sm text-slate-500">{subscribeMessage}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Platform plus tutors is stronger than either alone</h2>
              <p className="mt-4 max-w-3xl text-slate-200">
                NextGenius provides the platform layer, lead funnel, and structured workflow. Sydney tutors provide live teaching, trust, engagement, and personalized intervention.
              </p>
            </div>
            <a
              href="/new-tutors"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Learn more about New Tutors
              <Users className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Homepage

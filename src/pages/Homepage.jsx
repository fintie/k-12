import React, { useMemo, useState } from 'react'
import { send as emailjsSend } from '@emailjs/browser'
import { ArrowRight, Rocket, Users } from 'lucide-react'

import heroImage from '../assets/new-tutors/classroom-2.jpg'
import featureImageOne from '../assets/new-tutors/classroom-1.jpg'
import featureImageTwo from '../assets/new-tutors/classroom-3.jpg'
import galleryOne from '../assets/new-tutors/classroom-4.jpg'
import galleryTwo from '../assets/new-tutors/classroom-5.jpg'
import galleryThree from '../assets/new-tutors/classroom-6.jpg'
import galleryFour from '../assets/new-tutors/classroom-7.jpg'

const coreFeatures = [
  {
    emoji: '🎯',
    title: 'Personalized Learning',
    body: 'Smart assessment-based customized learning paths that help each student build confidence at the right pace.',
    image: galleryOne,
  },
  {
    emoji: '📊',
    title: 'Progress Tracking',
    body: 'Visual learning progress and knowledge mastery analysis so families can see improvement clearly.',
    image: galleryTwo,
  },
  {
    emoji: '👨🏫',
    title: 'Expert Tutors',
    body: 'Carefully selected tutors who combine subject strength with calm, supportive teaching.',
    image: galleryThree,
  },
  {
    emoji: '💻',
    title: 'Smart Platform',
    body: 'Interactive tools and seamless cross-device learning for home study, revision, and regular support.',
    image: galleryFour,
  },
]

const pricingPlans = [
  {
    name: 'Basic Plan',
    price: '$10',
    suffix: '/month',
    featured: false,
    items: ['20 sessions/month', 'Students needing foundation building', 'Basic concept explanations', 'Homework review service'],
  },
  {
    name: 'Advanced Plan',
    price: '$30',
    suffix: '/month',
    featured: true,
    badge: 'Most Popular',
    items: ['30 sessions/month', 'Students seeking breakthroughs', 'Advanced concept explanations', 'Mock exam services', 'Progress reports'],
  },
  {
    name: 'VIP One-on-One',
    price: '$50',
    suffix: '/session',
    featured: false,
    items: ['Customized session schedule', 'Personalized deep tutoring', 'Exclusive learning plan', '24/7 Q&A support', 'Regular parent communication'],
  },
]

const tutorTeam = [
  {
    emoji: '👨🏫',
    name: 'Mr. Wang - Math Lead',
    education: 'Master in Mathematics, University of Sydney',
    experience: '12 years K-12 math teaching',
    style: 'Inspires thinking, simplifies complexity',
  },
  {
    emoji: '👩🏫',
    name: 'Ms. Li - English Lead',
    education: 'English Major, National University of Singapore',
    experience: '8 years English teaching',
    style: 'Scenario-based teaching, practical focus',
  },
  {
    emoji: '👨🏫',
    name: 'Mr. Zhang - Science Tutor',
    education: 'Dual Degree in Science, University of Melbourne',
    experience: '10 years science teaching',
    style: 'Combines experiments with theory',
  },
]

const targetAudience = [
  { letter: 'E', title: 'Elementary', body: 'Grades 1-6, building interest and foundation', color: 'blue' },
  { letter: 'M', title: 'Middle School', body: 'Grades 7-9, knowledge system building', color: 'green' },
  { letter: 'H', title: 'High School', body: 'Grades 10-12, advanced knowledge learning', color: 'purple' },
  { letter: 'S', title: 'Special Needs', body: 'Competition prep, art students, international programs', color: 'orange' },
]

const advantages = [
  {
    title: 'Quality Assurance',
    body: 'All teachers pass 5-round strict selection, with a strong focus on quality and teaching fit.',
  },
  {
    title: 'Scientific System',
    body: 'Data-driven learning path planning helps students follow an efficient and structured progression.',
  },
  {
    title: 'Flexible Learning',
    body: 'Multi-device support makes it easier to learn anytime and fit tutoring around family schedules.',
  },
  {
    title: 'Transparent Progress',
    body: 'Real-time progress tracking keeps results visible and easier to discuss with parents.',
  },
  {
    title: 'Dedicated Support',
    body: 'Responsive support helps students and families stay on track when questions come up.',
  },
]

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
}

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-900/45 to-slate-900/15" />
        <img src={heroImage} alt="Students learning in class" className="absolute inset-0 h-full w-full object-cover" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">
          <h1 className="text-5xl font-bold text-white mb-6">
            Professional K-12 Math Learning Platform
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-slate-200">
            Providing personalized math learning experiences for every student, making math simpler, clearer, and more engaging.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/dashboard"
              className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="inline-block rounded-lg border border-white/30 px-8 py-3 text-lg font-semibold text-white hover:bg-white/10"
            >
              Learn More
            </a>
            <a
              href="/new-tutors"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-lg font-semibold text-slate-900 hover:bg-slate-100"
            >
              Tutor Registration
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8" id="features">
        <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">Core Features</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {coreFeatures.map((feature) => (
            <div key={feature.title} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <img src={feature.image} alt={feature.title} className="h-44 w-full object-cover" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl">
                  <span>{feature.emoji}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-lg bg-white p-8 shadow-lg ${plan.featured ? 'border-2 border-blue-500 md:scale-105' : ''}`}
              >
                {plan.badge ? (
                  <div className="mb-4 inline-block rounded-full bg-blue-500 px-4 py-1 text-sm font-semibold text-white">
                    {plan.badge}
                  </div>
                ) : null}
                <h3 className="mb-4 text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mb-6 text-4xl font-bold text-blue-600">
                  {plan.price}<span className="text-lg text-gray-500">{plan.suffix}</span>
                </p>
                <ul className="mb-8 space-y-3 text-gray-600">
                  {plan.items.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <button className={`w-full rounded-lg py-3 font-semibold ${plan.featured ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-gray-500"><em>Note: Contact customer service for specific prices, special promotions available now.</em></p>
        </div>
      </section>

      <section id="tutors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 text-center md:text-left md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Our Tutors</h2>
              <p className="mt-3 text-gray-600">Student-focused support, delivered by experienced tutors and subject specialists.</p>
            </div>
            <a href="/new-tutors" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              Tutor Registration
              <Users className="h-4 w-4" />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tutorTeam.map((tutor) => (
              <div key={tutor.name} className="rounded-2xl bg-slate-50 p-8 text-center ring-1 ring-slate-200">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-3xl">
                  <span>{tutor.emoji}</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">{tutor.name}</h3>
                <p className="mb-2 text-gray-600"><strong>Education:</strong> {tutor.education}</p>
                <p className="mb-2 text-gray-600"><strong>Experience:</strong> {tutor.experience}</p>
                <p className="text-gray-600"><strong>Teaching Style:</strong> {tutor.style}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Target Audience</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {targetAudience.map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold ${colorClasses[item.color]}`}>
                  {item.letter}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Advantages</h2>
          <div className="space-y-6">
            {advantages.map((item) => (
              <div key={item.title} className="flex items-start">
                <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <span className="font-bold text-green-600">✓</span>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8" id="subscribe">
        <div className="overflow-hidden rounded-3xl bg-blue-50 p-8 sm:p-10 lg:p-12">
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

      <footer className="bg-gray-900 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2026 MathTutor Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Homepage

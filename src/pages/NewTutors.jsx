import {
  Users,
  MapPin,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Rocket,
  Star,
} from 'lucide-react'

import heroImage from '../assets/new-tutors/classroom-1.jpg'
import galleryTwo from '../assets/new-tutors/classroom-2.jpg'
import galleryThree from '../assets/new-tutors/classroom-3.jpg'
import galleryFour from '../assets/new-tutors/classroom-4.jpg'
import galleryFive from '../assets/new-tutors/classroom-5.jpg'
import gallerySix from '../assets/new-tutors/classroom-6.jpg'
import gallerySeven from '../assets/new-tutors/classroom-7.jpg'

const strengths = [
  'K-12 math learning focus',
  'Structured learning support',
  'Personalized learning positioning',
  'Progress tracking',
  'Homework review support',
  'Premium one-on-one tutoring pathway',
  'Parent communication potential',
]

const demandAreas = [
  'Primary school math foundations',
  'Year 7-10 school support',
  'Year 11-12 HSC math preparation',
  'Premium one-on-one tutoring',
  'Parent reporting and communication',
]

const recruitPoints = [
  'Sydney-based or familiar with the NSW curriculum',
  'K-12 math tutoring experience',
  'Confident in online delivery',
  'Strong communication skills',
  'Able to provide progress updates',
  'Bonus: HSC, selective school prep, or advanced math specialization',
]

const pilotMetrics = [
  'Inquiry to trial conversion',
  'Trial to paid conversion',
  'Student retention',
  'Parent satisfaction',
  'Tutor utilization',
  'Average revenue per student',
  'Premium upgrade rate',
]

const roadmap = [
  'Confirm collaboration model',
  'Define tutor selection criteria',
  'Set pilot pricing and revenue share',
  'Recruit the first 3 to 5 tutors',
  'Launch a controlled 6 to 8 week pilot',
  'Review results and scale based on proven demand',
]

const gallery = [
  { src: galleryTwo, alt: 'Classroom teaching session' },
  { src: galleryThree, alt: 'Tutor leading a lesson' },
  { src: galleryFour, alt: 'Students participating in class' },
  { src: galleryFive, alt: 'Focused student in classroom' },
  { src: gallerySix, alt: 'Interactive classroom moment' },
  { src: gallerySeven, alt: 'Student proud of math progress' },
]

export default function NewTutors() {
  return (
    <div className="space-y-16">
      <section className="overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-100">
              <Star className="h-4 w-4" />
              NextGenius STEM x Sydney Tutors
            </span>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Building a trusted K-12 math tutoring network in Sydney
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-200">
              We are combining a digital learning platform with high-quality local tutors to deliver stronger trust,
              better outcomes, and a scalable tutoring model for families.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#pilot"
                className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white transition hover:bg-blue-400"
              >
                Explore the pilot
              </a>
              <a
                href="#recruit"
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View tutor criteria
              </a>
            </div>
          </div>
          <div className="min-h-[320px] lg:min-h-full">
            <img src={heroImage} alt="Teacher leading a class" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            icon: BookOpen,
            title: 'Why this matters',
            body: 'Sydney has strong recurring demand for K-12 tutoring, especially in math, where parents want trusted tutors, flexibility, measurable progress, and exam-focused outcomes.',
          },
          {
            icon: TrendingUp,
            title: 'Platform strengths',
            body: 'NextGenius already brings structured learning support, progress tracking, homework review, and a premium one-on-one tutoring pathway.',
          },
          {
            icon: MapPin,
            title: 'Value of local tutors',
            body: 'Sydney-based tutors add NSW curriculum familiarity, HSC relevance, stronger parent trust, and better premium conversion.',
          },
          {
            icon: Users,
            title: 'Best starting point',
            body: 'Start with a curated tutor cohort to maintain quality control, standardize service delivery, and build proof points before scaling.',
          },
        ].map((item) => {
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

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Existing platform strengths</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {strengths.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-green-600" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Where demand is strongest</h2>
          <div className="mt-6 space-y-4">
            {demandAreas.map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {index + 1}
                </div>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-blue-50 p-8 sm:p-10" id="recruit">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Who we want to recruit</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              We are looking for a small, high-quality Sydney cohort that can deliver trusted K-12 math support online and build strong family relationships from the start.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {recruitPoints.map((item) => (
                <div key={item} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-blue-600" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg" id="pilot">
            <div className="flex items-center gap-3 text-blue-200">
              <Rocket className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">6 to 8 week pilot</span>
            </div>
            <h3 className="mt-4 text-2xl font-bold">Start small, prove quality, then scale</h3>
            <ul className="mt-6 space-y-4 text-slate-200">
              <li>Onboard 3 to 5 tutors</li>
              <li>Focus on K-12 math only</li>
              <li>Run controlled student intake</li>
              <li>Test foundation support, school support, exam prep, and premium one-on-one demand</li>
            </ul>
            <div className="mt-8 rounded-2xl bg-white/10 p-5">
              <p className="text-sm leading-7 text-slate-100">
                Recommended monetization first step: start with a revenue share model, then expand into platform fees or premium matching after the pilot validates demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">How to measure the pilot</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {pilotMetrics.map((item) => (
              <div key={item} className="rounded-xl border border-slate-100 p-4 text-sm text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Implementation roadmap</h2>
          <div className="mt-6 space-y-4">
            {roadmap.map((item, index) => (
              <div key={item} className="flex gap-4">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700">{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Classroom gallery</h2>
            <p className="mt-2 text-slate-600">Visuals for both the New Tutors page and the refreshed home experience.</p>
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

      <section className="rounded-3xl bg-slate-900 px-8 py-10 text-white sm:px-10">
        <h2 className="text-3xl font-bold">Why this partnership can work</h2>
        <p className="mt-4 max-w-3xl text-slate-200">
          NextGenius provides the platform layer. Sydney tutors provide the trust and outcomes layer. Together, this creates a stronger and more scalable K-12 math tutoring model.
        </p>
      </section>
    </div>
  )
}

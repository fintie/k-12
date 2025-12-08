// src/pages/Homepage.jsx
import React, { useState } from 'react';

const Homepage = () => {
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  async function handleSubscribe() {
    setSubscribeStatus('loading');
    if (!email || !email.includes('@')) {
      setSubscribeStatus('invalid');
      return;
    }

    const apiUrl = import.meta.env.VITE_NEWSLETTER_API_URL;
    const recipient = import.meta.env.VITE_SUBSCRIBE_RECIPIENT;

    try {
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error('subscribe failed');
        setSubscribeStatus('sent');
        return;
      }

      if (recipient) {
        const res = await fetch(`https://formsubmit.co/ajax/${recipient}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, message: 'subscribe and we will set up your account for AI Agent Tutor Today' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'subscribe failed');
        setSubscribeStatus('sent');
        return;
      }

      window.location.href = `mailto:${email}?subject=Subscribe&body=subscribe and we will set up your account for AI Agent Tutor Today`;
      setSubscribeStatus('mailto');
    } catch (err) {
      setSubscribeStatus('error');
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">MathTutor Pro</h1>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Core Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#tutors" className="text-gray-600 hover:text-gray-900">Our Tutors</a>
              <a href="#pricing" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Start Learning
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Professional K-12 Math Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Providing personalized math learning experiences for every student, making math simple and fun
          </p>
          <div className="space-x-4">
            <a 
              href="/dashboard" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 inline-block"
            >
              Get Started
            </a>
            <a 
              href="#features" 
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 inline-block"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Subscribe Section (Homepage) */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Stay in the loop</h2>
          <p className="text-gray-600 mb-6">subscribe and we will set up your account for AI Agent Tutor Today</p>
          <div className="sm:flex sm:justify-center sm:space-x-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full sm:w-2/3 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={handleSubscribe} className="mt-3 sm:mt-0 w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700">
              {subscribeStatus === 'loading' ? 'Sending...' : 'Subscribe'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-3">{subscribeStatus === 'sent' ? 'Subscription successful — check your inbox.' : subscribeStatus === 'invalid' ? 'Please enter a valid email.' : subscribeStatus === 'error' ? 'Subscription failed. Try again later.' : ''}</p>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized Learning</h3>
              <p className="text-gray-600">Smart assessment-based customized learning paths</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
              <p className="text-gray-600">Visual learning progress and knowledge mastery analysis</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Tutors</h3>
              <p className="text-gray-600">Carefully selected certified teachers with rich experience</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Platform</h3>
              <p className="text-gray-600">Interactive tools and seamless cross-device learning</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Plan</h3>
              <p className="text-4xl font-bold text-blue-600 mb-6">$10<span className="text-lg text-gray-500">/month</span></p>
              <ul className="text-gray-600 space-y-3 mb-8">
                <li>• 20 sessions/month</li>
                <li>• Students needing foundation building</li>
                <li>• Basic concept explanations</li>
                <li>• Homework review service</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200">
                Choose Plan
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500 transform scale-105">
              <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced Plan</h3>
              <p className="text-4xl font-bold text-blue-600 mb-6">$30<span className="text-lg text-gray-500">/month</span></p>
              <ul className="text-gray-600 space-y-3 mb-8">
                <li>• 30 sessions/month</li>
                <li>• Students seeking breakthroughs</li>
                <li>• Advanced concept explanations</li>
                <li>• Mock exam services</li>
                <li>• Progress reports</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                Choose Plan
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">VIP One-on-One</h3>
              <p className="text-4xl font-bold text-blue-600 mb-6">$50<span className="text-lg text-gray-500">/session</span></p>
              <ul className="text-gray-600 space-y-3 mb-8">
                <li>• Customized session schedule</li>
                <li>• Personalized deep tutoring</li>
                <li>• Exclusive learning plan</li>
                <li>• 24/7 Q&A support</li>
                <li>• Regular parent communication</li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200">
                Choose Plan
              </button>
            </div>
          </div>
          <p className="text-center text-gray-500 mt-8"><em>Note: Contact customer service for specific prices, special promotions available now!</em></p>
        </div>
      </section>

      {/* Tutor Team */}
      <section id="tutors" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Tutors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mr. Wang - Math Lead</h3>
              <p className="text-gray-600 mb-2"><strong>Education:</strong> Master in Mathematics, University of Sydney</p>
              <p className="text-gray-600 mb-2"><strong>Experience:</strong> 12 years K-12 math teaching</p>
              <p className="text-gray-600"><strong>Teaching Style:</strong> Inspires thinking, simplifies complexity</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👩‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ms. Li - English Lead</h3>
              <p className="text-gray-600 mb-2"><strong>Education:</strong> English Major, National University of Singapore</p>
              <p className="text-gray-600 mb-2"><strong>Experience:</strong> 8 years English teaching</p>
              <p className="text-gray-600"><strong>Teaching Style:</strong> Scenario-based teaching, practical focus</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mr. Zhang - Science Tutor</h3>
              <p className="text-gray-600 mb-2"><strong>Education:</strong> Dual Degree in Science, University of Melbourne</p>
              <p className="text-gray-600 mb-2"><strong>Experience:</strong> 10 years science teaching</p>
              <p className="text-gray-600"><strong>Teaching Style:</strong> Combines experiments with theory</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Target Audience</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">E</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Elementary</h3>
              <p className="text-gray-600">Grades 1-6, building interest and foundation</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">M</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Middle School</h3>
              <p className="text-gray-600">Grades 7-9, knowledge system building</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-purple-600">H</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">High School</h3>
              <p className="text-gray-600">Grades 10-12, advanced knowledge learning</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">S</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Special Needs</h3>
              <p className="text-gray-600">Competition prep, art students, international programs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Website Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Advantages</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600">All teachers pass 5-round strict selection, only 15% acceptance rate</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scientific System</h3>
                <p className="text-gray-600">Data-driven learning path planning for optimal methods</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Learning</h3>
                <p className="text-gray-600">Multi-device support, learn anytime anywhere</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Progress</h3>
                <p className="text-gray-600">Real-time progress tracking for visible results</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-green-600 font-bold">✓</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                <p className="text-gray-600">7×12 customer service, timely problem resolution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">© 2025 MathTutor Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
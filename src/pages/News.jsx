// src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import { send as emailjsSend } from '@emailjs/browser';

const News = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState([]);

  // Mock news data - updated to 2025 and with real links/excerpts for demo
  const mockArticles = [
    {
      id: 1,
      title: 'AI Tutors Scale Personalized Math Support',
      source: 'EdTech Today',
      date: '2025-11-12',
      category: 'technology',
      excerpt: 'Schools report improved engagement when AI tutors provide immediate, personalized practice and hints for students.',
      url: 'https://example.com/ai-tutors-scale-personalized-math',
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      title: 'National Curriculum Adds Computational Thinking',
      source: 'Education Ministry',
      date: '2025-10-30',
      category: 'policy',
      excerpt: 'New curriculum guidance encourages computational thinking in K-12 classrooms to build problem-solving skills.',
      url: 'https://example.com/national-curriculum-computational-thinking',
      image: '/api/placeholder/400/200'
    },
    {
      id: 3,
      title: 'Adaptive Platforms Reduce Time to Mastery',
      source: 'EdResearch Journal',
      date: '2025-09-21',
      category: 'trends',
      excerpt: 'A multi-district study found adaptive platforms help students reach mastery faster with targeted practice.',
      url: 'https://example.com/adaptive-platforms-time-to-mastery',
      image: '/api/placeholder/400/200'
    },
    {
      id: 4,
      title: 'New Findings in Mathematics Instruction',
      source: 'Academic Journal',
      date: '2025-08-05',
      category: 'research',
      excerpt: 'Recent research highlights strategies that improve conceptual understanding in middle school math.',
      url: 'https://example.com/math-instruction-findings-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 5,
      title: 'Engagement Boosted by Game-Based Math Labs',
      source: 'Research Study',
      date: '2025-06-18',
      category: 'research',
      excerpt: 'Pilot programs using short game-based labs report higher student engagement and better retention.',
      url: 'https://example.com/game-based-math-labs',
      image: '/api/placeholder/400/200'
    },
    {
      id: 6,
      title: 'Hybrid Learning Tools Continue to Evolve',
      source: 'TechMedia',
      date: '2025-04-02',
      category: 'technology',
      excerpt: 'Tooling for hybrid classrooms now focuses on low-latency collaboration and assessment insights.',
      url: 'https://example.com/hybrid-learning-tools-2025',
      image: '/api/placeholder/400/200'
    }
  ];

  useEffect(() => {
    setArticles(mockArticles);
  }, []);

  const [visibleCount, setVisibleCount] = useState(3);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  const filteredArticles = activeTab === 'all'
    ? articles
    : articles.filter(article => article.category === activeTab);

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  const loadMore = () => {
    setVisibleCount(prev => Math.min(filteredArticles.length, prev + 3));
  };

  async function handleSubscribe() {
    setSubscribeStatus('loading');
    if (!email || !email.includes('@')) {
      setSubscribeStatus('invalid');
      return;
    }

    const apiUrl = import.meta.env.VITE_NEWSLETTER_API_URL;
    const recipient = import.meta.env.VITE_SUBSCRIBE_RECIPIENT;
    const emailjsService = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const emailjsTemplate = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const emailjsKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    try {
      // 1) If you have a server endpoint, use it (recommended)
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

      // 2) If EmailJS is configured, send confirmation directly to subscriber
      if (emailjsService && emailjsTemplate && emailjsKey) {
        const templateParams = {
          to_email: email,
          message: 'subscribe and we will set up your account for AI Agent Tutor Today'
        };
        await emailjsSend(emailjsService, emailjsTemplate, templateParams, emailjsKey);
        setSubscribeStatus('sent');
        return;
      }

      // 3) If recipient is set, forward submission to that recipient via FormSubmit
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

      // 4) Fallback: show message to configure EmailJS (no popup)
      alert(`EmailJS not configured. To send emails, please:
1. Go to https://www.emailjs.com/ and create a free account
2. Create an email service (e.g., Gmail)
3. Create an email template with {{to_email}} and {{message}}
4. Copy your Service ID, Template ID, and Public Key
5. Add them to .env.local as:
VITE_EMAILJS_SERVICE_ID="your_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_template_id"
VITE_EMAILJS_PUBLIC_KEY="your_public_key"`);
      setSubscribeStatus('error');
    } catch (err) {
      console.error('Subscribe error:', err);
      setSubscribeStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Education News & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay updated with the latest trends, policies, and innovations in education technology and teaching methodologies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['all', 'technology', 'policy', 'trends', 'research'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {tab === 'all' ? 'All News' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* News Articles List */}
            <div className="space-y-6">
              {visibleArticles.map(article => (
                <article key={article.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {article.source}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {article.date}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
                      {article.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={article.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Read full article
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <span className="text-xs text-gray-400">5 min read</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              <button onClick={loadMore} className="bg-white text-gray-700 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                {visibleCount < filteredArticles.length ? 'Load More Articles' : 'No More Articles'}
              </button>
            </div>
          </div>

          {/* Sidebar - Social Media Integration */}
          <div className="lg:col-span-1">
            
            {/* Social Media Feeds */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Social Media Feeds
              </h3>
              
              <div className="space-y-4">
                {/* Twitter Integration */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">X</span>
                    </div>
                    <span className="font-medium text-gray-900">Twitter</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Latest discussions about #EdTech and #MathEducation
                  </p>
                  <a 
                    href="https://twitter.com/search?q=%23EdTech" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 text-sm hover:underline inline-flex items-center"
                  >
                    View on Twitter
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* ArXiv Integration */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">A</span>
                    </div>
                    <span className="font-medium text-gray-900">ArXiv</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Recent research papers on mathematics education
                  </p>
                  <a 
                    href="https://arxiv.org/list/cs.CY/recent" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 text-sm hover:underline inline-flex items-center"
                  >
                    Browse Papers
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Medium Integration */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">M</span>
                    </div>
                    <span className="font-medium text-gray-900">Medium</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Education technology stories and insights
                  </p>
                  <a 
                    href="https://medium.com/tag/education-technology" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 text-sm hover:underline inline-flex items-center"
                  >
                    Read Stories
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                {/* Quora Integration */}
                <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition-colors">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-red-400 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">Q</span>
                    </div>
                    <span className="font-medium text-gray-900">Quora</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Questions and answers about teaching mathematics
                  </p>
                  <a 
                    href="https://www.quora.com/topic/Mathematics-Education" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 text-sm hover:underline inline-flex items-center"
                  >
                    Explore Q&A
                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stay Updated
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                subscribe and we will set up your account for AI Agent Tutor Today
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={handleSubscribe} className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  {subscribeStatus === 'loading' ? 'Sending...' : 'Subscribe to Newsletter'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {subscribeStatus === 'sent' ? 'Subscription successful — check your inbox.' : subscribeStatus === 'invalid' ? 'Please enter a valid email.' : subscribeStatus === 'error' ? 'Subscription failed. Check console for details.' : subscribeStatus === 'mailto' ? 'Please send the email manually.' : 'No spam, unsubscribe at any time.'}
              </p>
            </div>

            {/* Quick Links removed per request */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;

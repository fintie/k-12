// src/pages/News.jsx
import React, { useState, useEffect } from 'react';
import { send as emailjsSend } from '@emailjs/browser';

const News = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState([]);

  // Latest updates list across configured social/research platforms
  const mockArticles = [
    // arXiv (Feb–Mar 2026)
    {
      id: 1,
      title: 'Conversational AI Tutors',
      source: 'arXiv',
      date: '2026-02',
      category: 'research',
      excerpt: 'Discusses how conversational AI tutoring systems interact with students through dialogue rather than static exercises.',
      url: 'https://arxiv.org/abs/2602.19303',
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      title: 'Pedagogical Intelligence of AI Tutors Dataset',
      source: 'arXiv',
      date: '2026-03',
      category: 'research',
      excerpt: 'Introduces a large dataset (150k tutoring dialogues) to improve AI tutor training.',
      url: 'https://arxiv.org/abs/2603.02775',
      image: '/api/placeholder/400/200'
    },
    {
      id: 3,
      title: 'Human–AI Pedagogical Integration Framework',
      source: 'arXiv',
      date: '2026-02',
      category: 'research',
      excerpt: 'Shows how AI tutoring systems can improve learner satisfaction and performance.',
      url: 'https://arxiv.org/abs/2601.17434',
      image: '/api/placeholder/400/200'
    },
    {
      id: 4,
      title: 'FACET Teacher-Facing AI Agent Framework',
      source: 'arXiv',
      date: '2026-02',
      category: 'research',
      excerpt: 'Presents a multi-agent AI system to support teachers in creating differentiated learning materials.',
      url: 'https://arxiv.org/abs/2601.22788',
      image: '/api/placeholder/400/200'
    },
    {
      id: 5,
      title: 'AI Tutor Evaluation Toolkit',
      source: 'arXiv',
      date: '2026-02',
      category: 'research',
      excerpt: 'Toolkit to evaluate pedagogical quality of AI tutor responses.',
      url: 'https://arxiv.org/abs/2512.03688',
      image: '/api/placeholder/400/200'
    },
    // Medium (Feb–Mar 2026)
    {
      id: 6,
      title: 'AI in Your Classroom: A Teacher’s Guide',
      source: 'Medium',
      date: '2026-02',
      category: 'technology',
      excerpt: 'Explains adaptive AI learning systems and teacher productivity improvements.',
      url: 'https://medium.com/@taoist_hawk2000/ai-in-your-classroom-a-teachers-guide-to-navigating-education-s-biggest-shift-in-decades-0d9d91ddbd5e',
      image: '/api/placeholder/400/200'
    },
    {
      id: 7,
      title: 'Future Trends of Intelligent Tutoring Systems',
      source: 'Medium',
      date: '2026-03',
      category: 'technology',
      excerpt: 'Covers multimodal AI tutoring and explainable AI learning models.',
      url: 'https://medium.com/@drsoumyabanerjee/every-tomorrow-is-a-better-tomorrow-future-trends-of-intelligent-tutoring-system-ai-in-03a333d24c04',
      image: '/api/placeholder/400/200'
    },
    {
      id: 8,
      title: 'AI Tutor + Human Teacher: The Hybrid Classroom Model',
      source: 'Medium',
      date: '2026-03',
      category: 'technology',
      excerpt: 'Describes hybrid human–AI pedagogy and personalized feedback loops.',
      url: 'https://medium.com/@thebizaihub/ai-tutor-and-human-teacher-the-hybrid-classroom-model-that-works-b291509ed81a',
      image: '/api/placeholder/400/200'
    },
    {
      id: 9,
      title: 'AI Tools Every Computer Teacher Should Know in 2026',
      source: 'Medium',
      date: '2026-02',
      category: 'technology',
      excerpt: 'Lists AI teaching assistants like Khanmigo and AI lesson planners.',
      url: 'https://medium.com/@cybersquare/5-ai-tools-every-computer-teacher-should-know-in-2026-10e043df99d5',
      image: '/api/placeholder/400/200'
    },
    // Reddit (2026)
    {
      id: 10,
      title: 'AI Tutors vs Teachers Discussion',
      source: 'Reddit',
      date: '2026',
      category: 'trends',
      excerpt: 'Discussion on AI tutors replacing teachers and where each is most effective.',
      url: 'https://www.reddit.com/r/EdTech/comments/1h1u0hx/ai_tutors_vs_teachers/',
      image: '/api/placeholder/400/200'
    },
    {
      id: 11,
      title: 'AI Tools Teachers Actually Use in Class',
      source: 'Reddit',
      date: '2026',
      category: 'trends',
      excerpt: 'Teachers share AI tools they use in real classrooms and what helps most.',
      url: 'https://www.reddit.com/r/Teachers/comments/1hxg1x5/ai_tools_in_classroom/',
      image: '/api/placeholder/400/200'
    },
    {
      id: 12,
      title: 'Personalized Learning with AI Tutors',
      source: 'Reddit',
      date: '2026',
      category: 'trends',
      excerpt: 'Community thread on AI tutor personalization and learning outcomes.',
      url: 'https://www.reddit.com/r/MachineLearning/comments/1hz4hjo/ai_tutor_personalized_learning/',
      image: '/api/placeholder/400/200'
    },
    // X (2026)
    {
      id: 13,
      title: 'AI Tutor Architecture Thread',
      source: 'X',
      date: '2026-03',
      category: 'trends',
      excerpt: 'Thread on agent-based tutoring systems and LLM-driven curriculum generation.',
      url: 'https://x.com/ylecun/status/1759894858103382272',
      image: '/api/placeholder/400/200'
    },
    {
      id: 14,
      title: 'AI Teaching Agents Discussion',
      source: 'X',
      date: '2026-03',
      category: 'trends',
      excerpt: 'Discussion on AI teaching agents and classroom copilots for teachers.',
      url: 'https://x.com/karpathy/status/1762820732125038753',
      image: '/api/placeholder/400/200'
    },
    {
      id: 15,
      title: 'AI Education Tools Overview',
      source: 'X',
      date: '2026-02',
      category: 'trends',
      excerpt: 'Overview of AI education tools and their classroom impact.',
      url: 'https://x.com/AndrewYNg/status/1756123998486929644',
      image: '/api/placeholder/400/200'
    },
    // Quora (2026)
    {
      id: 16,
      title: 'Will AI Replace Human Tutors?',
      source: 'Quora',
      date: '2026',
      category: 'policy',
      excerpt: 'Q&A on whether AI will replace private tutors and what remains uniquely human.',
      url: 'https://www.quora.com/Will-AI-replace-human-tutors',
      image: '/api/placeholder/400/200'
    },
    {
      id: 17,
      title: 'How Is Machine Learning Used in Education?',
      source: 'Quora',
      date: '2026',
      category: 'policy',
      excerpt: 'Answers explain where machine learning improves assessment and personalization.',
      url: 'https://www.quora.com/How-is-machine-learning-used-in-education',
      image: '/api/placeholder/400/200'
    },
    {
      id: 18,
      title: 'Are AI Tutors Effective for Learning?',
      source: 'Quora',
      date: '2026',
      category: 'policy',
      excerpt: 'Discussion on effectiveness of AI tutors and when they work best.',
      url: 'https://www.quora.com/Are-AI-tutors-effective-for-learning',
      image: '/api/placeholder/400/200'
    }
  ];

  useEffect(() => {
    setArticles(mockArticles);
  }, []);

  const [visibleCount, setVisibleCount] = useState(18);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  const filteredArticles = activeTab === 'all'
    ? articles
    : articles.filter(article => article.category === activeTab);

  const visibleArticles = filteredArticles.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(filteredArticles.length);
  }, [activeTab, filteredArticles.length]);

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

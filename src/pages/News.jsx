// src/pages/News.jsx
import React, { useState, useEffect } from 'react';

const News = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState(null);

  // Mock news data - in real application this would come from API
  const mockArticles = [
    {
      id: 1,
      title: 'AI in Education: Transforming Learning Experiences',
      source: 'Medium',
      date: '2025-10-10',
      category: 'technology',
      excerpt: 'How artificial intelligence is revolutionizing personalized learning and educational outcomes.',
      url: 'https://medium.com/@example/ai-in-education-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 2,
      title: 'New Education Policy Focuses on Digital Literacy',
      source: 'Government',
      date: '2025-09-20',
      category: 'policy',
      excerpt: 'Recent policy changes emphasize the importance of digital skills in K-12 education.',
      url: 'https://gov.example.org/education/digital-literacy-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 3,
      title: 'The Rise of Adaptive Learning Platforms',
      source: 'EdTech Review',
      date: '2025-08-18',
      category: 'trends',
      excerpt: 'Exploring how adaptive learning technologies are customizing education for each student.',
      url: 'https://edtech.example.com/adaptive-learning-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 4,
      title: 'Mathematics Education Trends in 2024',
      source: 'Academic Journal',
      date: '2025-07-30',
      category: 'research',
      excerpt: 'Latest research on effective mathematics teaching methodologies and tools.',
      url: 'https://journal.example.edu/math-education-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 5,
      title: 'Gamification in Math Learning Shows Positive Results',
      source: 'Research Study',
      date: '2025-06-12',
      category: 'research',
      excerpt: 'New study demonstrates improved engagement and outcomes through game-based math learning.',
      url: 'https://research.example.org/gamification-math-2025',
      image: '/api/placeholder/400/200'
    },
    {
      id: 6,
      title: 'Remote Learning Tools Evolution Post-Pandemic',
      source: 'TechCrunch',
      date: '2025-05-02',
      category: 'technology',
      excerpt: 'How remote learning platforms have evolved and what the future holds for digital education.',
      url: 'https://techcrunch.example.com/remote-learning-2025',
      image: '/api/placeholder/400/200'
    }
  ];

  // Default snippet for parent/non-technical audience (English)
  const parentSnippet = 'Tools to help your child track learning progress, view assignments and grades — clear, stress-free home–school communication.';

  useEffect(() => {
    const fetchNews = async () => {
      const apiUrl = import.meta.env.VITE_NEWS_API_URL;
      setLoading(true);
      setError(null);
      try {
        if (apiUrl) {
          const res = await fetch(apiUrl);
          if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
          const data = await res.json();
          // Support common shapes: { articles: [...] } (NewsAPI), { items: [...] } (RSS->JSON), or an array
          const items = data.articles || data.items || (Array.isArray(data) ? data : []);
          const mapped = items.map((a, i) => ({
            id: a.id || a.url || i,
            title: a.title || a.headline || 'Untitled',
            source: (a.source && a.source.name) || a.author || 'Unknown',
            date: a.publishedAt || a.pubDate || a.date || '',
            category: a.category || 'news',
            excerpt: a.description || a.summary || '',
            url: a.url || a.link || '#',
            image: a.urlToImage || a.image || '/api/placeholder/400/200'
          }));
          setArticles(mapped.length ? mapped : mockArticles);
        } else {
          // No API configured — use mock data
          setArticles(mockArticles);
        }
      } catch (err) {
        console.error('Failed to fetch news', err);
        setError(err.message || 'Failed to fetch');
        setArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleSubscribe = async () => {
    setSubscribeStatus(null);
    const apiUrl = import.meta.env.VITE_NEWSLETTER_API_URL;
    // basic email validation
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setSubscribeStatus('error');
      return;
    }

    try {
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error('Network response was not ok');
        setSubscribeStatus('success');
      } else {
        // fallback to mailto so user's email client sends an email
        const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Subscribe to newsletter')}&body=${encodeURIComponent('Please subscribe me to the newsletter.')}`;
        window.location.href = mailto;
        setSubscribeStatus('success');
      }
    } catch (err) {
      console.error('Subscribe failed', err);
      setSubscribeStatus('error');
    }
  };

  const filteredArticles = activeTab === 'all' 
    ? articles 
    : articles.filter(article => article.category === activeTab);

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
            {/* Status (loading / error / empty) */}
            {loading && (
              <div className="mb-4 text-center">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded">
                  <svg className="w-4 h-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Loading articles...
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                Failed to load news: {error}
              </div>
            )}

            {!loading && filteredArticles.length === 0 && (
              <div className="mb-4 p-6 text-center text-gray-600 bg-white border border-gray-100 rounded">
                No articles found.
              </div>
            )}

            <div className="space-y-6">
              {filteredArticles.map(article => (
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
                    
                    <h2 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer">
                      {article.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {article.excerpt || parentSnippet}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <a 
                        href={article.url} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read more
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
              <button className="bg-white text-gray-700 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Load More Articles
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
                Get the latest education news and insights delivered to your inbox weekly.
              </p>
              <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleSubscribe()}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </button>
                  {subscribeStatus === 'success' && (
                    <div className="text-sm text-green-700">Subscription successful — check your inbox.</div>
                  )}
                  {subscribeStatus === 'error' && (
                    <div className="text-sm text-red-700">Subscription failed — please try again.</div>
                  )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                No spam, unsubscribe at any time.
              </p>
            </div>

            {/* Quick Links removed as requested */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
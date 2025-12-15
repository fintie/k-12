import React, { useEffect, useRef, useState } from 'react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I’m the platform’s chatbot — I’m here if you need assistance.' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://test-server-uqtw.onrender.com/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botReply = data?.reply || 'Sorry, the bot isn’t available yet. Please try again later.';
      setMessages((prev) => [...prev, { role: 'bot', content: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: 'Sorry, the bot isn’t available yet. Please try again later.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="bg-white shadow-lg rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 border border-gray-200 hover:shadow-xl transition"
        >
          Got any question? Ask us!
        </button>
      )}

      {isOpen && (
        <div className="bg-white shadow-2xl rounded-xl border border-gray-200 flex flex-col h-[70vh] w-[92vw] max-w-md sm:max-w-lg md:w-[28rem]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl">
            <span className="text-white font-semibold">Got any question? Ask us!</span>
            <button
              onClick={toggleOpen}
              className="text-white hover:text-gray-100 text-sm font-medium"
            >
              Fold
            </button>
          </div>

          <div
            ref={messagesEndRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg max-w-[80%] text-sm bg-white text-gray-500 border border-gray-200">
                  Typing…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white rounded-b-xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;

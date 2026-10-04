import React, { useState } from 'react';
import { Bot, Send, UserRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CivicAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', text: `Hello${user?.name ? ` ${user.name}` : ''}! I’m CivicDrive AI. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages(m => [...m, { role: 'user', text: q }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Chat request failed');
      }

      setMessages(m => [...m, {
        role: 'bot',
        text: data.reply || 'I could not generate a response right now.'
      }]);
    } catch (err) {
      console.error('CivicDrive AI error:', err);
      setMessages(m => [...m, {
        role: 'bot',
        text: 'CivicDrive AI is temporarily unavailable. Please make sure the backend server is running.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'How do I report a violation?',
    'How do I report a pothole?',
    'What does my report status mean?',
    'How should I handle a challan?'
  ];

  return (
    <section className="feature-page animate-fade-in">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CIVIC ASSISTANT</span>
          <h1>CivicDrive AI</h1>
          <p>Guidance for reports, road safety and using the CivicDrive platform.</p>
        </div>
        <div className="feature-icon"><Bot size={28} /></div>
      </div>

      <div className="glass-panel ai-panel">
        <div className="ai-top">
          <div>
            <strong><span className="online-dot" /> CivicDrive AI</strong>
            <small>Gemini-ready · Local fallback</small>
          </div>
          <Sparkles size={20} />
        </div>

        <div className="suggestions">
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} disabled={loading}>{s}</button>
          ))}
        </div>

        <div className="chat-window">
          {messages.map((m, i) => (
            <div className={`chat-message ${m.role}`} key={i}>
              <div className="chat-avatar">
                {m.role === 'bot' ? <Bot size={17} /> : <UserRound size={17} />}
              </div>
              <div>
                <span>{m.role === 'bot' ? 'CivicDrive AI' : 'You'}</span>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="chat-avatar"><Bot size={17} /></div>
              <div><span>CivicDrive AI</span><p>Thinking…</p></div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={e => { e.preventDefault(); send(); }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask CivicDrive AI..."
            disabled={loading}
          />
          <button className="btn" type="submit" disabled={loading}>
            <Send size={17} />
          </button>
        </form>

        <p className="ai-disclaimer">
          For current legal rules, fines and official actions, verify information with the relevant government authority.
          Gemini is called server-side when a GEMINI_API_KEY is configured; the key is never sent to the browser.
        </p>
      </div>
    </section>
  );
};

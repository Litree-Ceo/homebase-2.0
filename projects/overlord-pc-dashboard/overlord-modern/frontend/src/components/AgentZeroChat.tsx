import { useState } from 'react';

export default function AgentZeroChat() {
  const [messages, setMessages] = useState([
    { role: 'agent', text: 'Agent Zero online. BTC signal is active.' },
  ]);
  const [input, setInput] = useState('');

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const res = await fetch('http://localhost:8000/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input, userId: 'larry' }),
    });
    const { response } = await res.json();
    setMessages((prev) => [...prev, { role: 'agent', text: response }]);
  };

  return (
    <div className="agent-zero-chat">
      <div className="sidebar-section-label">Agent Zero</div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        className="chat-input"
        placeholder="Talk to Agent Zero..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') send();
        }}
      />
    </div>
  );
}
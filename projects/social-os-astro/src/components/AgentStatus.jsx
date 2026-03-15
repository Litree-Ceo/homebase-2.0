import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const messages = [
  "System online.",
  "AI agent initialized.",
  "Listening for user commands..."
];

const AgentStatus = () => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (messageIndex < messages.length) {
      const timer = setTimeout(() => {
        setCharIndex(charIndex + 1);
        setCurrentMessage(messages[messageIndex].substring(0, charIndex + 1));
        if (charIndex === messages[messageIndex].length) {
          setCharIndex(0);
          setMessageIndex(messageIndex + 1);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [charIndex, messageIndex]);

  return (
    <div class="bg-green-900/50 border border-green-400/50 text-green-300 rounded-lg p-4 font-mono text-sm shadow-lg backdrop-blur-sm">
        {messages.map((msg, i) => (
            <div key={i} style={{ visibility: i <= messageIndex ? 'visible' : 'hidden' }}>
                <span class="text-green-400">> </span>
                <span>{i < messageIndex ? msg : currentMessage}</span>
                {i === messageIndex && charIndex < (messages[i] || '').length && <span class="animate-pulse">_</span>}
            </div>
        ))}
    </div>
  );
};

export default AgentStatus;

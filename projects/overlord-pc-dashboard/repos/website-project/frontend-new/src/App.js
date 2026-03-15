import React from 'react';
import AIChat from './components/AIChat';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>🌐 Social Site</h1>
        <p>Your vibe coder project with OpenRouter AI</p>
      </header>
      <main>
        <AIChat />
      </main>
    </div>
  );
}

export default App;

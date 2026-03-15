import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import '../styles/Copilot.css'

export default function CopilotDock() {
  const { user, tier } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(false)

  if (!user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/copilot/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          userId: user.id,
          tier,
          userContext: { interests: user.interests }
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setResponses(prev => [...prev, { prompt, response: data.response }])
      setPrompt('')
    } catch (error) {
      console.error('Copilot error:', error)
      setResponses(prev => [...prev, {
        prompt,
        response: '❌ Oops! Something went wrong. Try again!'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {isOpen && (
        <div className="copilot-overlay" onClick={() => setIsOpen(false)} />
      )}

      <div className={`copilot-dock ${isOpen ? 'open' : 'closed'}`}>
        {isOpen && (
          <div className="copilot-panel">
            <div className="copilot-header">
              <h3>🤖 Copilot v1</h3>
              <button
                className="close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close Copilot"
              >
                ✕
              </button>
            </div>

            <div className="copilot-messages">
              {responses.length === 0 && (
                <div className="copilot-welcome">
                  <p>Hi! I'm your AI assistant. Ask me anything about creating, exploring, or optimizing your experience.</p>
                </div>
              )}
              {responses.map((item, idx) => (
                <div key={idx} className="message-pair">
                  <div className="message user-message">
                    <p>{item.prompt}</p>
                  </div>
                  <div className="message copilot-message">
                    <p>{item.response}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message copilot-message">
                  <p>🤔 Thinking...</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="copilot-input">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
              />
              <button type="submit" disabled={loading || !prompt.trim()}>
                Send
              </button>
            </form>

            {tier === 'free' && (
              <div className="copilot-tier-info">
                <p>Free tier: 5 prompts/day. Upgrade for unlimited!</p>
              </div>
            )}
          </div>
        )}

        <button
          className="copilot-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Copilot"
          title="AI Copilot"
        >
          🤖
        </button>
      </div>
    </>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import '../styles/Onboarding.css'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [copilotPrompt, setCopilotPrompt] = useState('')
  const [selectedModes, setSelectedModes] = useState([])

  const modes = ['Creative', 'Social', 'Gaming', 'Learning', 'Trading']

  if (!user) {
    navigate('/login')
    return null
  }

  const handleModeToggle = (mode) => {
    setSelectedModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Complete onboarding and go to homebase
      navigate('/homebase')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="onboarding">
      <div className="onboarding-container">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step">
              <h1>Welcome, {user.email}!</h1>
              <p>Let's set up your Copilot AI assistant.</p>
              <p>Tell it what you do, your style, and what excites you.</p>
              <textarea
                value={copilotPrompt}
                onChange={(e) => setCopilotPrompt(e.target.value)}
                placeholder="E.g., 'I'm a creative streamer who loves building immersive worlds. Help me automate content creation and grow my community. I'm playful and experimental.'"
                rows="6"
                className="copilot-prompt"
              />
            </div>
          )}

          {step === 2 && (
            <div className="step">
              <h1>Choose Your Modes</h1>
              <p>Select what resonates with you (you can change this later):</p>
              <div className="modes-grid">
                {modes.map(mode => (
                  <button
                    key={mode}
                    className={`mode-card ${selectedModes.includes(mode) ? 'selected' : ''}`}
                    onClick={() => handleModeToggle(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step">
              <h1>You're All Set!</h1>
              <p>Your Copilot is ready and your modes are configured.</p>
              <div className="summary">
                <h3>Summary:</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Copilot Persona:</strong> Customized</p>
                <p><strong>Modes:</strong> {selectedModes.join(', ') || 'Standard'}</p>
              </div>
              <p>Let's head to your Homebase Dashboard and start creating!</p>
            </div>
          )}

          <div className="buttons">
            {step > 1 && (
              <button className="btn btn-secondary" onClick={handleBack}>
                Back
              </button>
            )}
            <button className="btn btn-primary" onClick={handleNext}>
              {step === 3 ? 'Go to Homebase' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom'
import { MessageCircle, Code, Folder, Send, Download, Trash2, Plus, Globe, Music, Terminal } from 'lucide-react'
import { ShareButton } from './components/ShareButton'

const FeedPage = lazy(() => import('./pages/Feed'))
const AudioPage = lazy(() => import('./pages/Audio'))
const ConsolePage = lazy(() => import('./pages/Console'))

// Types
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Project {
  id: string
  name: string
  status: string
  createdAt: string
}

interface GenerationResult {
  projectId: string
  status: string
  message: string
  preview?: {
    intent: string
    entities: {
      frameworks: string[]
      features: string[]
      data_models: string[]
    }
    files_generated: {
      frontend: number
      backend: number
      database: number
    }
  }
}

const SAMPLE_PROMPTS = [
  "Create a to-do list app with user authentication",
  "Build an e-commerce site with products and shopping cart",
  "Make a blog with posts, comments, and categories",
  "Develop a task management app with boards and assignments"
]

// Navigation Component
function Navigation({ projects, currentProjectId, onDeleteProject }: { 
  projects: Project[]
  currentProjectId: string | null
  onDeleteProject: (id: string) => void
}) {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { path: '/', icon: MessageCircle, label: 'Generator' },
    { path: '/projects', icon: Folder, label: 'Projects' },
    { path: '/feed', icon: Globe, label: 'Network Feed' },
    { path: '/audio', icon: Music, label: 'Audio' },
    { path: '/console', icon: Terminal, label: 'Console' },
  ]

  return (
    <aside className="sidebar">
      <div className="logo">
        <Code className="logo-icon" />
        <span>LiTreeLab</span>
      </div>
      
      <nav className="nav-menu">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path}
            className={`nav-item ${path === item.path ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="projects-list">
        <h3>Recent Projects</h3>
        {projects.map(project => (
          <div key={project.id} className={`project-item ${currentProjectId === project.id ? 'active' : ''}`}>
            <Link to={`/chat/${project.id}`}>
              {project.name}
            </Link>
            <button 
              onClick={() => onDeleteProject(project.id)}
              className="delete-btn"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}

// Generator Page Component
function GeneratorPage({ 
  messages, 
  input, 
  setInput, 
  isGenerating, 
  handleSubmit, 
  handleSamplePrompt,
  generatedCode,
  currentProjectId,
  projects,
  handleDownload,
  onShared
}: {
  messages: Message[]
  input: string
  setInput: (v: string) => void
  isGenerating: boolean
  handleSubmit: (e: React.FormEvent) => void
  handleSamplePrompt: (p: string) => void
  generatedCode: { frontend: Record<string, string>; backend: Record<string, string> } | null
  currentProjectId: string | null
  projects: Project[]
  handleDownload: () => void
  onShared: () => void
}) {
  return (
    <>
      <header className="chat-header">
        <h1>AI App Generator</h1>
        {currentProjectId && (
          <div className="header-actions">
            <ShareButton
              projectId={currentProjectId}
              title={projects.find(p => p.id === currentProjectId)?.name || "Generated App"}
              description={messages.find(m => m.role === 'user')?.content || "Built with LiTreeLab Studio"}
              generatedCode={generatedCode}
            />
            <button 
              className="btn btn-secondary"
              onClick={() => {}}
            >
              <Code size={16} />
              View Code
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleDownload}
            >
              <Download size={16} />
              Download
            </button>
          </div>
        )}
      </header>

      {generatedCode && currentProjectId && (
        <div className="share-panel">
          <ShareButton
            projectId={currentProjectId}
            title={messages.find(m => m.role === 'user')?.content?.slice(0, 50) || 'My Creation'}
            description={messages.find(m => m.role === 'user')?.content || 'Generated with LiTreeLab Studio'}
            generatedCode={generatedCode}
            onShared={onShared}
          />
        </div>
      )}

      <div className="messages-container">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`message ${message.role}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {messages.length === 1 && (
        <div className="quick-prompts">
          <p>Try these examples:</p>
          <div className="prompt-buttons">
            {SAMPLE_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                className="prompt-btn"
                onClick={() => handleSamplePrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {generatedCode && (
        <div className="code-preview">
          <div className="code-section">
            <h3>Frontend Files ({Object.keys(generatedCode.frontend).length})</h3>
            <div className="file-list">
              {Object.keys(generatedCode.frontend).slice(0, 5).map(file => (
                <div key={file} className="file-item">
                  📄 {file}
                </div>
              ))}
              {Object.keys(generatedCode.frontend).length > 5 && (
                <div className="file-item more">
                  +{Object.keys(generatedCode.frontend).length - 5} more files
                </div>
              )}
            </div>
          </div>
          <div className="code-section">
            <h3>Backend Files ({Object.keys(generatedCode.backend).length})</h3>
            <div className="file-list">
              {Object.keys(generatedCode.backend).slice(0, 5).map(file => (
                <div key={file} className="file-item">
                  📄 {file}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the app you want to build..."
          disabled={isGenerating}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isGenerating}
          className="send-btn"
        >
          {isGenerating ? (
            <span className="loading">⏳</span>
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
    </>
  )
}

// Projects Page Component
function ProjectsPage({ projects, onNewProject }: { projects: Project[], onNewProject: () => void }) {
  const navigate = useNavigate()

  return (
    <div className="projects-page">
      <header className="page-header">
        <h1>Your Projects</h1>
        <button className="btn btn-primary" onClick={onNewProject}>
          <Plus size={16} />
          New Project
        </button>
      </header>
      
      {projects.length === 0 ? (
        <div className="empty-state">
          <Folder size={48} />
          <h2>No projects yet</h2>
          <p>Start by describing your first application in the Generator tab.</p>
          <button 
            className="btn btn-primary"
            onClick={onNewProject}
          >
            Start Building
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-icon">
                <Code size={24} />
              </div>
              <h3>{project.name}</h3>
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
              <div className="project-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/chat/${project.id}`)}
                >
                  View Code
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/chat/${project.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main App Component with Router
function AppContent() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI App Builder. Describe the application you want to create in natural language, and I'll generate the complete code for you.\n\nFor example:\n• \"Create a to-do list app with user authentication\"\n• \"Build an e-commerce site with product listings\"\n• \"Make a blog with posts and comments\"\n\nWhat would you like to build?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [generatedCode, setGeneratedCode] = useState<{ frontend: Record<string, string>; backend: Record<string, string> } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsGenerating(true)

    const thinkingMessage: Message = {
      id: 'thinking',
      role: 'assistant',
      content: '🤔 Analyzing your request and generating code...',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      const response = await fetch('/api/app-builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentInput,
          project_id: currentProjectId
        })
      })

      const result: GenerationResult = await response.json()

      setMessages(prev => prev.filter(m => m.id !== 'thinking'))

      const successMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ ${result.message}\n\nI detected the following components:\n• Intent: ${result.preview?.intent}\n• Features: ${result.preview?.entities.features.join(', ') || 'None'}\n• Data Models: ${result.preview?.entities.data_models.join(', ') || 'None'}\n\nFiles generated:\n• Frontend: ${result.preview?.files_generated.frontend} files\n• Backend: ${result.preview?.files_generated.backend} files\n• Database: ${result.preview?.files_generated.database} files\n\nClick "View Code" to see the generated code or "Download" to get the ZIP file.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])

      if (result.projectId) {
        setCurrentProjectId(result.projectId)
        
        const projectResponse = await fetch(`/api/app-builder/projects/${result.projectId}`)
        const projectData = await projectResponse.json()
        setGeneratedCode(projectData.code)

        setProjects(prev => [{
          id: result.projectId,
          name: result.message.substring(0, 30),
          status: result.status,
          createdAt: new Date().toISOString()
        }, ...prev])
      }
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'thinking'))
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSamplePrompt = (prompt: string) => {
    setInput(prompt)
  }

  const handleDownload = async () => {
    if (!currentProjectId) return
    
    try {
      const response = await fetch(`/api/app-builder/download/${currentProjectId}`)
      const data = await response.json()
      
      const byteArray = new Uint8Array(data.content.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16)))
      const blob = new Blob([byteArray], { type: 'application/zip' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await fetch(`/api/app-builder/projects/${projectId}`, { method: 'DELETE' })
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (currentProjectId === projectId) {
        setCurrentProjectId(null)
        setGeneratedCode(null)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const handleShared = () => {
    const successMsg = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: '🚀 Your creation has been shared to the LiTLab Network! Others can now discover and fork your work.',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, successMsg])
  }

  return (
    <div className="app-container">
      <Navigation 
        projects={projects} 
        currentProjectId={currentProjectId}
        onDeleteProject={handleDeleteProject}
      />

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <GeneratorPage 
              messages={messages}
              input={input}
              setInput={setInput}
              isGenerating={isGenerating}
              handleSubmit={handleSubmit}
              handleSamplePrompt={handleSamplePrompt}
              generatedCode={generatedCode}
              currentProjectId={currentProjectId}
              projects={projects}
              handleDownload={handleDownload}
              onShared={handleShared}
            />
          } />
          <Route path="/projects" element={
            <ProjectsPage 
              projects={projects}
              onNewProject={() => navigate('/')}
            />
          } />
          <Route path="/feed" element={
            <Suspense fallback={<div className="loading-feed">Loading Network...</div>}>
              <FeedPage />
            </Suspense>
          } />
          <Route path="/audio" element={
            <Suspense fallback={<div className="loading-feed">Loading Audio...</div>}>
              <AudioPage />
            </Suspense>
          } />
          <Route path="/console" element={
            <Suspense fallback={<div className="loading-feed">Loading Console...</div>}>
              <ConsolePage />
            </Suspense>
          } />
          <Route path="/chat/:projectId" element={
            <GeneratorPage 
              messages={messages}
              input={input}
              setInput={setInput}
              isGenerating={isGenerating}
              handleSubmit={handleSubmit}
              handleSamplePrompt={handleSamplePrompt}
              generatedCode={generatedCode}
              currentProjectId={currentProjectId}
              projects={projects}
              handleDownload={handleDownload}
              onShared={handleShared}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

// Root App with Router
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App

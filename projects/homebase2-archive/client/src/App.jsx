import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage('API not connected'))
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>?? HomeBase 2.0</h1>
        <p>{message}</p>
        <div className="card">
          <h2>Your Personal Dashboard</h2>
          <p>Manage tasks, notes, and routines all in one place</p>
        </div>
      </header>
    </div>
  )
}

export default App

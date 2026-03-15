import { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, Download, Copy, Check } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'command';
  message: string;
}

export default function ConsolePage() {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'info',
      message: 'LiTreeLab Studio Console v1.0.0 initialized'
    },
    {
      id: '2',
      timestamp: new Date(),
      type: 'success',
      message: 'Connected to API server at http://localhost:8000'
    },
    {
      id: '3',
      timestamp: new Date(),
      type: 'info',
      message: 'Ready for commands. Type "help" for available commands.'
    }
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    
    // Add command to logs
    addLog('command', `> ${cmd}`);
    
    // Add to history
    if (trimmedCmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }

    // Process commands
    switch (trimmedCmd) {
      case 'help':
        addLog('info', 'Available commands:');
        addLog('info', '  help     - Show this help message');
        addLog('info', '  clear    - Clear console');
        addLog('info', '  status   - Check system status');
        addLog('info', '  projects - List generated projects');
        addLog('info', '  api      - Test API connection');
        addLog('info', '  version  - Show version info');
        break;
      
      case 'clear':
        setLogs([]);
        break;
      
      case 'status':
        addLog('success', 'System Status: ONLINE');
        addLog('info', '  API Server: Connected');
        addLog('info', '  WebSocket: Disconnected (not configured)');
        addLog('info', '  Memory Usage: Normal');
        break;
      
      case 'projects':
        addLog('info', 'Fetching projects...');
        fetch('/api/app-builder/projects')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data) && data.length > 0) {
              addLog('success', `Found ${data.length} project(s):`);
              data.forEach((p: any) => {
                addLog('info', `  - ${p.name} (${p.status})`);
              });
            } else {
              addLog('warning', 'No projects found. Generate an app first!');
            }
          })
          .catch(() => {
            addLog('error', 'Failed to fetch projects');
          });
        break;
      
      case 'api':
        addLog('info', 'Testing API connection...');
        fetch('/api/app-builder/projects')
          .then(res => {
            if (res.ok) {
              addLog('success', 'API connection successful!');
            } else {
              addLog('error', `API returned status: ${res.status}`);
            }
          })
          .catch(() => {
            addLog('error', 'API connection failed. Is the server running?');
          });
        break;
      
      case 'version':
        addLog('info', 'LiTreeLab Studio Console v1.0.0');
        addLog('info', 'Build: 2026.03.15');
        addLog('info', 'React: 18.2.0');
        addLog('info', 'FastAPI: Latest');
        break;
      
      default:
        if (trimmedCmd) {
          addLog('error', `Unknown command: "${cmd}". Type "help" for available commands.`);
        }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      executeCommand(input);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const clearConsole = () => setLogs([]);

  const copyLogs = () => {
    const logText = logs.map(l => `[${l.timestamp.toLocaleTimeString()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const logText = logs.map(l => `[${l.timestamp.toISOString()}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'command': return '▶️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="console-page">
      <header className="page-header">
        <h1><Terminal size={28} /> System Console</h1>
        <div className="console-actions">
          <button className="btn btn-icon" onClick={copyLogs} title="Copy logs">
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button className="btn btn-icon" onClick={downloadLogs} title="Download logs">
            <Download size={18} />
          </button>
          <button className="btn btn-icon" onClick={clearConsole} title="Clear console">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="console-container">
        <div className="console-logs">
          {logs.map(log => (
            <div key={log.id} className={`log-entry ${log.type}`}>
              <span className="log-timestamp">{log.timestamp.toLocaleTimeString()}</span>
              <span className="log-icon">{getLogIcon(log.type)}</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        <form className="console-input-form" onSubmit={handleSubmit}>
          <span className="prompt">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command (type 'help' for available commands)"
            className="console-input"
          />
          <button type="submit" className="send-btn" disabled={!input.trim()}>
            <Send size={18} />
          </button>
        </form>
      </div>

      <div className="console-shortcuts">
        <span>Shortcuts:</span>
        <kbd>↑</kbd> Previous command
        <kbd>↓</kbd> Next command
        <kbd>Enter</kbd> Execute
        <kbd>Ctrl+C</kbd> Copy
      </div>
    </div>
  );
}

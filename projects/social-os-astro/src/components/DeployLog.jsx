import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const logLines = [
  'Initializing deployment...', 
  'Cloning repository...', 
  'Installing dependencies...', 
  'Building application...', 
  'Running tests...', 
  'Deploying to production...', 
  'Deployment successful!'
];

export default function DeployLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prevLogs => {
        if (prevLogs.length < logLines.length) {
          return [...prevLogs, logLines[prevLogs.length]];
        }
        clearInterval(interval);
        return prevLogs;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div class="mt-8 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-inner h-64 overflow-y-auto font-mono text-sm text-gray-300">
      {logs.map((log, index) => (
        <p key={index} class="whitespace-pre-wrap">{log}</p>
      ))}
    </div>
  );
}
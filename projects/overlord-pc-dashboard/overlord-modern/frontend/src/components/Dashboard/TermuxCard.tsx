import { useState } from 'react';
import { api } from '../../services/api';

export function TermuxCard() {
  const [hostname, setHostname] = useState('192.168.1.100');
  const [port, setPort] = useState(8022);
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    const result = await api.termuxConnect({
      hostname,
      port,
      username,
      password,
    });
    setConnected((result as any).success);
    setOutput((result as any).message);
    setLoading(false);
  };

  const handleDisconnect = async () => {
    await api.termuxDisconnect();
    setConnected(false);
    setOutput('Disconnected');
  };

  const handleExecute = async () => {
    setLoading(true);
    const result = await api.termuxExecute(command);
    setOutput((result as any).output || (result as any).error);
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3 className="font-semibold text-white mb-2">Termux</h3>
      {!connected ? (
        <div className="space-y-2">
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="Hostname"
            className="w-full bg-gray-900 text-white px-2 py-1 rounded"
          />
          <input
            type="number"
            value={port}
            onChange={(e) => setPort(parseInt(e.target.value))}
            placeholder="Port"
            className="w-full bg-gray-900 text-white px-2 py-1 rounded"
          />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full bg-gray-900 text-white px-2 py-1 rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-gray-900 text-white px-2 py-1 rounded"
          />
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mb-2"
          >
            Disconnect
          </button>
          <div className="flex space-x-2">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command..."
              className="flex-grow bg-gray-900 text-white px-2 py-1 rounded"
            />
            <button
              onClick={handleExecute}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
            >
              {loading ? 'Executing...' : 'Execute'}
            </button>
          </div>
          <pre className="text-sm text-gray-300 mt-2 p-2 bg-gray-900 rounded whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

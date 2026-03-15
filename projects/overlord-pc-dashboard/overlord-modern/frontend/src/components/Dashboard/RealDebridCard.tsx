import { useState } from 'react';
import { api } from '../../services/api';

export function RealDebridCard() {
  const [magnet, setMagnet] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddMagnet = async () => {
    if (!magnet) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await api.addMagnet(magnet);
      setMessage(response.message);
      setMagnet('');
    } catch (err: any) {
      setMessage(err.response?.data?.detail || 'An error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3 className="font-semibold text-white mb-2">Real-Debrid</h3>
      <div className="flex space-x-2">
        <input
          type="text"
          value={magnet}
          onChange={(e) => setMagnet(e.target.value)}
          placeholder="Paste magnet link..."
          className="flex-grow bg-gray-900 text-white px-2 py-1 rounded"
        />
        <button
          onClick={handleAddMagnet}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
      {message && <p className="text-sm text-gray-400 mt-2">{message}</p>}
    </div>
  );
}

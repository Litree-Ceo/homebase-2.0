import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

export default function NetworkStatus() {
    const [status, setStatus] = useState('loading...');

    useEffect(() => {
        const fetchStatus = () => {
            fetch('/api/network-status.json')
                .then(response => response.json())
                .then(data => setStatus(data.status))
                .catch(error => console.error('Error fetching network status:', error));
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div class="p-4 bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl transition-all duration-300 hover:border-purple-500/80">
            <h3 class="text-xl font-bold text-white mb-2">Network Status</h3>
            <p class="text-gray-400 text-sm">Current network status: <span class="font-bold text-purple-400">{status}</span></p>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { api } from '../../services/api';

import { AdbDevice } from '../../types';

export function AdbCard() {
  const [devices, setDevices] = useState<AdbDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = (await api.getAdbDevices()) as {
          devices: AdbDevice[];
          error?: string;
        };
        if (response.error) {
          setError(response.error);
        } else {
          setDevices(response.devices || []);
        }
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchDevices();
  }, []);

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg">
      <h3 className="font-semibold text-white mb-2">ADB Devices</h3>
      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!loading && !error && (
        <div>
          {devices.map((device) => (
            <div
              key={device.serial}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-gray-300">{device.serial}</span>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
                {device.status}
              </span>
            </div>
          ))}
          {devices.length === 0 && (
            <p className="text-sm text-gray-500">No devices found.</p>
          )}
        </div>
      )}
    </div>
  );
}

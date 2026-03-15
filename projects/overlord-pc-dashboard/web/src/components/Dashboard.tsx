/**
 * Main Dashboard Component
 * Renders a grid of system monitoring widgets
 *
 * @component Dashboard
 */
import { useSystemStatsStore, useUIStore } from '@/lib/stores';
import { useEffect, useState } from 'react';
import { AccessibilityTest } from './accessibility/AccessibilityTest';
import { CPUWidget } from './dashboard/CPUWidget';
import { MemoryWidget } from './dashboard/MemoryWidget';

export function Dashboard(): JSX.Element {
  const fetchStats = useSystemStatsStore(
    (state: SystemStatsState) => state.fetchStats
  );
  const theme = useUIStore((state: UIState) => state.theme);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
      // Announce updates to screen readers periodically
      setAnnouncement('System metrics updated');
      setTimeout(() => setAnnouncement(''), 1000);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <main
      className="p-4 sm:p-6 lg:p-8"
      data-theme={theme}
      aria-label="System monitoring dashboard"
    >
      {/* Screen reader announcement for updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Accessibility Test Panel - Remove in production */}
      <div className="mb-8">
        <AccessibilityTest />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Column 1 - System Overview */}
        <section
          className="flex flex-col gap-4 sm:gap-6"
          aria-labelledby="system-overview-heading"
        >
          <h2 id="system-overview-heading" className="sr-only">
            System Overview
          </h2>
          <CPUWidget />
          <MemoryWidget />
        </section>

        {/* Add more widget sections here */}
      </div>
    </main>
  );
}

export default Dashboard;

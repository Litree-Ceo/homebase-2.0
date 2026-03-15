/**
 * Progress Bar Component
 * Cyberpunk-styled progress bar with color coding based on usage level
 *
 * @component ProgressBar
 */

import type { ReactNode } from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'cpu' | 'memory' | 'disk' | 'network' | 'gpu' | 'temperature';
  animated?: boolean;
  icon?: ReactNode;
}

/**
 * Get color class based on usage percentage and type
 */
function getColorClass(value: number, color: ProgressBarProps['color']): string {
  // Temperature uses different thresholds
  if (color === 'temperature') {
    if (value < 50) return 'bg-cyan-400';
    if (value < 70) return 'bg-yellow-400';
    if (value < 85) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // Default color scheme based on usage
  if (value < 50) return 'bg-emerald-400';
  if (value < 70) return 'bg-yellow-400';
  if (value < 85) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get glow color based on usage
 */
function getGlowClass(value: number, color: ProgressBarProps['color']): string {
  if (color === 'temperature') {
    if (value < 50) return 'shadow-cyan-400/50';
    if (value < 70) return 'shadow-yellow-400/50';
    if (value < 85) return 'shadow-orange-500/50';
    return 'shadow-red-500/50';
  }

  if (value < 50) return 'shadow-emerald-400/50';
  if (value < 70) return 'shadow-yellow-400/50';
  if (value < 85) return 'shadow-orange-500/50';
  return 'shadow-red-500/50';
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  color = 'default',
  animated = true,
  icon,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClass = getColorClass(percentage, color);
  const glowClass = getGlowClass(percentage, color);

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }[size];

  const ariaLabel = label ? `${label} progress` : 'Progress indicator';

  return (
    <div className="w-full" role="region" aria-label={ariaLabel}>
      {(label || icon) && (
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400" aria-hidden="true">{icon}</span>}
            {label && <span className="text-sm text-gray-300 font-medium" id={`${label.toLowerCase().replace(/\s+/g, '-')}-label`}>{label}</span>}
          </div>
          {showPercentage && (
            <span className="text-sm font-mono text-gray-400" aria-live="polite">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} ${colorClass} rounded-full transition-all duration-500 ease-out ${
            animated ? 'animate-pulse-subtle' : ''
          }`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-labelledby={label ? `${label.toLowerCase().replace(/\s+/g, '-')}-label` : undefined}
        >
          {/* Inner glow effect */}
          <div
            className={`w-full h-full opacity-30 ${glowClass} shadow-lg`}
            style={{ filter: 'blur(2px)' }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
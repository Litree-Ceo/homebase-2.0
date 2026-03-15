import * as React from "react";
import { ReactNode } from "react";
import styles from "./styles/HoneycombGrid.module.css";

// HoneycombPod: a single customizable pod
export interface HoneycombPodProps {
  color1: string;
  color2: string;
  color3: string;
  children: ReactNode;
}

// Note: For production, move styles to a CSS/SCSS file for best practices.
export function HoneycombPod({
  color1,
  color2,
  color3,
  children,
}: HoneycombPodProps) {
  return (
    <div
      className={styles.honeycombPod}
      style={{
        background: `linear-gradient(135deg, ${color1}, ${color2} 60%, ${color3} 100%)`,
        boxShadow: `0 4px 24px 0 ${color1}55`,
        border: `2px solid ${color3}`
      }}
    >
      {children}
    </div>
  );
}

// HoneycombGrid: a grid of pods
export interface HoneycombGridProps {
  pods: HoneycombPodProps[];
}

export function HoneycombGrid({ pods }: HoneycombGridProps) {
  return (
    <div
      className={styles.honeycombGrid}
    >
      {pods.map((pod, i) => (
        <HoneycombPod key={i} {...pod} />
      ))}
    </div>
  );
}

// Example usage (customize as needed):
// <HoneycombGrid pods={[
//   { color1: '#000', color2: '#FFD700', color3: '#FF0000', children: 'Black Gold Red' },
//   { color1: '#FFD700', color2: '#FF0000', color3: '#111', children: 'Gold Red Black' },
// ]} />

// NOTE: If you see errors about missing React types, run:
//   npm install react @types/react

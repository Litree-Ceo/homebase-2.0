declare module 'react-grid-layout/css/styles.css';
declare module 'react-resizable/css/styles.css';
declare module 'react-masonry-css' {
  import * as React from 'react';

  export interface MasonryProps {
    breakpointCols?: number | { default: number; [breakpoint: string]: number };
    className?: string;
    columnClassName?: string;
    children: React.ReactNode;
  }

  const Masonry: React.ComponentType<MasonryProps>;
  export default Masonry;
}

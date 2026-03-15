declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      // React Three Fiber elements
      color: any;
      fog: any;
      ambientLight: any;
      directionalLight: any;
      mesh: any;
      planeGeometry: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
    }
  }
}

export {};

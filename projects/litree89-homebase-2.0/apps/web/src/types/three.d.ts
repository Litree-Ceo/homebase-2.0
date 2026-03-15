/// <reference types="@react-three/fiber" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
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

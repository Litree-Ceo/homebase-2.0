import { useState, useEffect } from 'react';

const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'b', 'a'
];

export const useKonami = (callback) => {
  const [sequence, setSequence] = useState([]);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...sequence, e.key];
      
      // Keep only the last N keys where N is the Konami code length
      if (newSequence.length > KONAMI_CODE.length) {
        newSequence.shift();
      }
      
      setSequence(newSequence);
      
      // Check if sequence matches
      if (newSequence.length === KONAMI_CODE.length) {
        const matches = newSequence.every((key, index) => key === KONAMI_CODE[index]);
        if (matches && !activated) {
          setActivated(true);
          callback?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, callback, activated]);

  return { activated, reset: () => { setActivated(false); setSequence([]); } };
};

// Secret codes registry
export const SECRET_CODES = {
  HYPE: ['h', 'y', 'p', 'e'],
  MATRIX: ['m', 'a', 't', 'r', 'i', 'x'],
  DARK: ['d', 'a', 'r', 'k'],
  LIGHT: ['l', 'i', 'g', 'h', 't'],
  GOD: ['g', 'o', 'd'],
};

export const useSecretCode = (code, callback) => {
  const [sequence, setSequence] = useState([]);
  const codeArray = typeof code === 'string' ? code.split('') : code;

  useEffect(() => {
    const handleKeyDown = (e) => {
      const newSequence = [...sequence, e.key.toLowerCase()];
      
      if (newSequence.length > codeArray.length) {
        newSequence.shift();
      }
      
      setSequence(newSequence);
      
      if (newSequence.length === codeArray.length) {
        const matches = newSequence.every((key, index) => 
          key === codeArray[index].toLowerCase()
        );
        if (matches) {
          callback?.();
          setSequence([]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sequence, codeArray, callback]);
};

export default useKonami;

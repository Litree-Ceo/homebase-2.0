"use client";

import { createContext, useState, useContext } from 'react';

const MAKTContext = createContext();

export const MAKTProvider = ({ children }) => {
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTrack: null,
    volume: 50,
    // ... other player states
  });

  const [socialFeed, setSocialFeed] = useState([]);

  const [systemStatus, setSystemStatus] = useState({
    cpu: 0,
    memory: 0,
    // ... other system metrics
  });

  const [wallet, setWallet] = useState({
    address: null,
    balance: 0,
  });

  // ... other state and functions

  return (
    <MAKTContext.Provider value={{
      playerState, setPlayerState,
      socialFeed, setSocialFeed,
      systemStatus, setSystemStatus,
      wallet, setWallet,
      // ... other values
    }}>
      {children}
    </MAKTContext.Provider>
  );
};

export const useMAKT = () => useContext(MAKTContext);
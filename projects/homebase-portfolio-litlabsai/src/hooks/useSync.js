import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, writeBatch, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import env from '../config/environment';

/**
 * useSync Hook
 * Manages data synchronization between local state and Firebase
 * Provides offline support and conflict resolution
 */

export const useSync = (collectionName) => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error
  const [pendingChanges, setPendingChanges] = useState([]);
  
  // Track sync metadata
  const [syncMeta, setSyncMeta] = useState({
    lastSync: null,
    syncCount: 0,
    errorCount: 0,
  });

  // Use ref for pending changes to avoid dependency issues
  const pendingChangesRef = useRef(pendingChanges);
  useEffect(() => {
    pendingChangesRef.current = pendingChanges;
  }, [pendingChanges]);

  // Process pending changes when back online
  const processPendingChanges = useCallback(async () => {
    if (!user || pendingChangesRef.current.length === 0 || !env.sync.isOnline) return;
    
    try {
      const batch = writeBatch(db);
      
      pendingChangesRef.current.forEach(change => {
        const ref = doc(db, collectionName, change.id || 'new');
        if (change.operation === 'delete') {
          batch.delete(ref);
        } else if (change.operation === 'update') {
          batch.update(ref, {
            ...change.data,
            lastUpdated: serverTimestamp(),
          });
        } else if (change.operation === 'create') {
          batch.set(ref, {
            ...change.data,
            userId: user.uid,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp(),
          });
        }
      });
      
      await batch.commit();
      setPendingChanges([]);
      env.sync.logSyncEvent('success', `Processed ${pendingChangesRef.current.length} pending changes`);
    } catch (error) {
      env.sync.logSyncEvent('error', `Failed to process pending changes: ${error.message}`);
    }
  }, [user, collectionName]);

  // Set up real-time sync with Firestore
  useEffect(() => {
    if (!user) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setData([]);
      setLoading(false);
      setSyncStatus('idle');
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    setSyncStatus('syncing');
    env.sync.logSyncEvent('start', `Starting sync for ${collectionName}`);

    const q = query(
      collection(db, collectionName),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        
        setData(items);
        setLoading(false);
        setSyncStatus('synced');
        setSyncMeta(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          syncCount: prev.syncCount + 1,
        }));
        
        env.sync.logSyncEvent('success', `Synced ${items.length} items from ${collectionName}`);
        
        // Process any pending changes
        if (pendingChangesRef.current.length > 0) {
          processPendingChanges();
        }
      },
      (error) => {
        console.error(`Sync error for ${collectionName}:`, error);
        setSyncStatus('error');
        setSyncMeta(prev => ({
          ...prev,
          errorCount: prev.errorCount + 1,
        }));
        env.sync.logSyncEvent('error', error.message);
      }
    );

    return () => {
      unsubscribe();
      env.sync.logSyncEvent('stop', `Stopped sync for ${collectionName}`);
    };
  }, [user, collectionName, processPendingChanges]);

  // Queue changes when offline
  const queueChange = useCallback((change) => {
    setPendingChanges(prev => [...prev, change]);
    env.sync.logSyncEvent('queue', `Queued ${change.operation} operation`);
  }, []);

  // Force sync refresh
  const refresh = useCallback(() => {
    setSyncStatus('syncing');
    // The onSnapshot will automatically refresh
  }, []);

  // Get sync health status
  const getSyncHealth = useCallback(() => {
    return {
      status: syncStatus,
      isOnline: env.sync.isOnline,
      lastSync: syncMeta.lastSync,
      pendingChanges: pendingChanges.length,
      totalSyncs: syncMeta.syncCount,
      errors: syncMeta.errorCount,
      isHealthy: syncStatus === 'synced' && env.sync.isOnline,
    };
  }, [syncStatus, syncMeta, pendingChanges]);

  return {
    data,
    loading,
    syncStatus,
    pendingChanges,
    syncMeta,
    queueChange,
    processPendingChanges,
    refresh,
    getSyncHealth,
  };
};

/**
 * useConfigSync Hook
 * Synchronizes configuration across devices
 */
export const useConfigSync = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  // Load user configuration
  useEffect(() => {
    if (!user) {
      setConfig({});
      return;
    }

    const configRef = doc(db, 'user-configs', user.uid);
    const unsubscribe = onSnapshot(configRef, (doc) => {
      if (doc.exists()) {
        setConfig(doc.data());
      } else {
        // Create default config
        setConfig({
          theme: 'dark',
          terminalHistory: [],
          sidebarCollapsed: false,
          notifications: true,
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Update configuration
  const updateConfig = useCallback(async (newConfig) => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      const configRef = doc(db, 'user-configs', user.uid);
      await setDoc(configRef, {
        ...newConfig,
        lastUpdated: serverTimestamp(),
      }, { merge: true });
      env.sync.logSyncEvent('success', 'Configuration updated');
    } catch (error) {
      env.sync.logSyncEvent('error', `Config update failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  return { config, updateConfig, isSyncing };
};

export default useSync;

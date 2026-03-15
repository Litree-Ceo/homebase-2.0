'use client';

/**
 * Watch Party Component
 *
 * @workspace Synchronized viewing experience with real-time chat
 * and playback sync - like Netflix Party/Teleparty
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { getConnection, startSignalR } from '@/lib/signalrClient';
import VideoPlayer from './VideoPlayer';
import type { WatchParty, WatchPartyParticipant, MediaItem } from '@/types';

interface WatchPartyViewProps {
  partyId: string;
  onLeave?: () => void;
}

interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  profilePic?: string;
  content: string;
  timestamp: string;
  type: 'message' | 'system';
}

export default function WatchPartyView({ partyId, onLeave }: WatchPartyViewProps) {
  const { user, userProfile, getAccessToken } = useAuth();
  const [party, setParty] = useState<WatchParty | null>(null);
  const [media, setMedia] = useState<MediaItem | null>(null);
  const [participants, setParticipants] = useState<WatchPartyParticipant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Join watch party and set up real-time connection
  useEffect(() => {
    const joinParty = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();

        // Fetch party details
        const partyRes = await fetch(`/api/watch-parties/${partyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!partyRes.ok) throw new Error('Failed to fetch party');

        const partyData = await partyRes.json();
        setParty(partyData);
        setParticipants(partyData.participants || []);

        // Fetch media details
        const mediaRes = await fetch(`/api/media/${partyData.mediaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (mediaRes.ok) {
          setMedia(await mediaRes.json());
        }

        // Join the party
        await fetch(`/api/watch-parties/${partyId}/join`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });

        // Start SignalR connection
        startSignalR();
      } catch (error) {
        console.error('Failed to join watch party:', error);
      } finally {
        setIsLoading(false);
      }
    };

    joinParty();

    return () => {
      // Leave party on unmount
      const leaveParty = async () => {
        try {
          const token = await getAccessToken();
          await fetch(`/api/watch-parties/${partyId}/leave`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Failed to leave party:', error);
        }
      };
      leaveParty();
    };
  }, [partyId, getAccessToken]);

  // Set up SignalR event handlers
  useEffect(() => {
    const connection = getConnection();
    if (!connection) return;

    // Handle incoming sync events
    connection.on(
      'WatchParty:Sync',
      (data: { time: number; isPlaying: boolean; senderId: string }) => {
        if (data.senderId === user?.localAccountId) return;

        setIsSyncing(true);
        const video = videoRef.current;
        if (video) {
          video.currentTime = data.time;
          if (data.isPlaying) {
            video.play();
          } else {
            video.pause();
          }
        }
        setTimeout(() => setIsSyncing(false), 1000);
      },
    );

    // Handle participant updates
    connection.on('WatchParty:ParticipantJoined', (participant: WatchPartyParticipant) => {
      setParticipants(prev => [...prev.filter(p => p.userId !== participant.userId), participant]);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          userId: 'system',
          displayName: 'System',
          content: `${participant.displayName} joined the party`,
          timestamp: new Date().toISOString(),
          type: 'system',
        },
      ]);
    });

    connection.on('WatchParty:ParticipantLeft', (userId: string) => {
      const leftUser = participants.find(p => p.userId === userId);
      setParticipants(prev => prev.filter(p => p.userId !== userId));
      if (leftUser) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            userId: 'system',
            displayName: 'System',
            content: `${leftUser.displayName} left the party`,
            timestamp: new Date().toISOString(),
            type: 'system',
          },
        ]);
      }
    });

    // Handle chat messages
    connection.on('WatchParty:Message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Join SignalR group
    connection.invoke('JoinWatchParty', partyId).catch(console.error);

    return () => {
      connection.off('WatchParty:Sync');
      connection.off('WatchParty:ParticipantJoined');
      connection.off('WatchParty:ParticipantLeft');
      connection.off('WatchParty:Message');
      connection.invoke('LeaveWatchParty', partyId).catch(console.error);
    };
  }, [partyId, user, participants]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle sync request from video player
  const handleSyncRequest = useCallback(
    (time: number, isPlaying: boolean) => {
      const connection = getConnection();
      if (!connection || !party) return;

      // Only host can sync others
      const isHost = party.hostId === user?.localAccountId;
      const participant = participants.find(p => p.userId === user?.localAccountId);
      const canControl = isHost || participant?.canControl;

      if (canControl && party.syncEnabled) {
        connection
          .invoke('WatchParty:RequestSync', partyId, {
            time,
            isPlaying,
            senderId: user?.localAccountId,
          })
          .catch(console.error);
      }
    },
    [party, user, partyId, participants],
  );

  // Send chat message
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const connection = getConnection();
    if (!connection) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.localAccountId,
      displayName: userProfile?.displayName || user.name || 'Anonymous',
      profilePic: userProfile?.profilePicture,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    await connection.invoke('WatchParty:SendMessage', partyId, message);
    setNewMessage('');
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLeave = () => {
    onLeave?.();
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-amber-100">Joining watch party...</p>
        </div>
      </div>
    );
  }

  if (!party || !media) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="text-center">
          <p className="mb-4 text-xl text-red-400">Watch party not found</p>
          <button
            onClick={handleLeave}
            className="rounded-full bg-amber-400 px-6 py-2 font-medium text-black hover:bg-amber-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-black lg:flex-row">
      {/* Video Section */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/20 bg-black/80 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleLeave} className="text-amber-100/60 hover:text-amber-100">
              ← Leave
            </button>
            <div>
              <h1 className="font-bold text-amber-100">{party.title}</h1>
              <p className="text-sm text-amber-100/60">Hosted by {party.hostDisplayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync indicator */}
            {isSyncing && (
              <span className="flex items-center gap-2 text-sm text-amber-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                Syncing...
              </span>
            )}

            {/* Participant count */}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-amber-100 hover:bg-amber-400/20"
            >
              👥 {participants.length}
            </button>

            {/* Toggle chat */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`rounded-full px-3 py-1 lg:hidden ${
                showChat ? 'bg-amber-400 text-black' : 'bg-amber-400/10 text-amber-100'
              }`}
            >
              💬
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative flex-1">
          <VideoPlayer
            media={media}
            watchPartyMode={true}
            onSyncRequest={handleSyncRequest}
            startTime={party.currentPosition}
          />

          {/* Participants Overlay */}
          {showParticipants && (
            <div className="absolute right-4 top-4 z-10 max-h-64 w-64 overflow-y-auto rounded-xl bg-black/90 p-4 shadow-xl">
              <h3 className="mb-3 font-medium text-amber-100">
                Participants ({participants.length})
              </h3>
              <div className="space-y-2">
                {participants.map(p => (
                  <div key={p.userId} className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-amber-400/20">
                      {p.profilePic ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.profilePic}
                          alt={p.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-400">
                          {p.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-amber-100">{p.displayName}</p>
                      {p.isHost && <span className="text-xs text-amber-400">Host</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      {showChat && (
        <div className="flex w-full flex-col border-l border-amber-400/20 bg-black/60 lg:w-80">
          <div className="border-b border-amber-400/20 px-4 py-3">
            <h2 className="font-medium text-amber-100">Party Chat</h2>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map(msg => (
              <div key={msg.id} className={msg.type === 'system' ? 'text-center' : 'flex gap-2'}>
                {msg.type === 'system' ? (
                  <p className="text-xs text-amber-100/40 italic">{msg.content}</p>
                ) : (
                  <>
                    <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-amber-400/20">
                      {msg.profilePic ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.profilePic}
                          alt={msg.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-bold text-amber-400">
                          {msg.displayName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-amber-100">
                          {msg.displayName}
                        </span>
                        <span className="text-xs text-amber-100/40">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-amber-100/80">{msg.content}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="border-t border-amber-400/20 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Say something..."
                className="flex-1 rounded-xl border border-amber-400/30 bg-black/30 px-4 py-2 text-sm text-amber-100 placeholder-amber-100/40 focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="rounded-xl bg-amber-400 px-4 py-2 font-medium text-black hover:bg-amber-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

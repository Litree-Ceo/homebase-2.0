'use client';

/**
 * Direct Messages / Chat System
 * @workspace Private messaging and conversations
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  reactions?: Record<string, number>;
}

interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    displayName: string;
    username: string;
    profilePicture?: string;
  }>;
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user?.id || user?.localAccountId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/messages/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}/messages`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !messageInput.trim()) return;

    try {
      const res = await fetch(`/api/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageInput,
        }),
      });

      if (res.ok) {
        setMessageInput('');
        await loadMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (selectedConversation) {
        await loadMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 text-center">
        <div className="inline-block animate-spin">⚙️</div>
        <p className="text-purple-300 mt-4">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-100px)] flex gap-4 py-4 px-4">
      {/* Conversations List */}
      <div className="w-80 bg-slate-900 rounded-lg border border-purple-500/20 flex flex-col">
        <div className="p-4 border-b border-purple-500/20">
          <h2 className="font-black text-white">💬 Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-purple-300">
              <p>No conversations yet</p>
              <p className="text-xs mt-2">Start chatting with friends!</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-4 border-b border-purple-500/10 transition ${
                  selectedConversation?.id === conv.id
                    ? 'bg-purple-600/30 border-l-4 border-amber-400'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {conv.participants[0]?.profilePicture ? (
                      <Image
                        src={conv.participants[0].profilePicture}
                        alt={conv.participants[0].displayName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm">
                      {conv.participants[0]?.displayName}
                    </h3>
                    <p className="text-xs text-purple-300 truncate">
                      {conv.lastMessage?.content || 'No messages'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="bg-amber-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 bg-slate-900 rounded-lg border border-purple-500/20 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-purple-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-purple-600 flex items-center justify-center">
              {selectedConversation.participants[0]?.profilePicture ? (
                <Image
                  src={selectedConversation.participants[0].profilePicture}
                  alt={selectedConversation.participants[0].displayName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <span>👤</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-white">
                {selectedConversation.participants[0]?.displayName}
              </h3>
              <p className="text-xs text-purple-300">
                @{selectedConversation.participants[0]?.username}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => {
              const isSender = msg.senderId === (user?.id || user?.localAccountId);
              return (
                <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isSender ? 'bg-amber-400 text-black' : 'bg-purple-600/50 text-white'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {Object.entries(msg.reactions).map(([emoji, count]) => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="px-2 py-1 bg-black/20 rounded text-xs hover:bg-black/30"
                          >
                            {emoji} {count}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t border-purple-500/20 flex gap-3"
          >
            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 bg-slate-800 border border-purple-500/20 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-amber-400 text-black rounded-lg font-bold hover:bg-amber-500"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 bg-slate-900 rounded-lg border border-purple-500/20 flex items-center justify-center text-center">
          <div>
            <div className="text-6xl mb-4">💬</div>
            <p className="text-white font-bold text-lg">Select a conversation</p>
            <p className="text-purple-300">or start a new chat with a friend</p>
          </div>
        </div>
      )}
    </div>
  );
}

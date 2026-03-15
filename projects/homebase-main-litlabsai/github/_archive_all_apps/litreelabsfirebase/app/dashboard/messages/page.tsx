'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Send, Phone, Video, MoreVertical, Smile, Paperclip,
  Image, Mic, Check, CheckCheck, Circle, Plus, Settings, Users,
  Star, Pin, Archive, Trash2, Bell, BellOff, ChevronDown, Hash,
  AtSign, MessageSquare, UserPlus, X
} from 'lucide-react';

type Message = {
  id: string;
  content: string;
  timestamp: string;
  sender: 'me' | 'other';
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'voice' | 'file';
};

type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
  isGroup?: boolean;
  members?: number;
};

const CONVERSATIONS: Conversation[] = [
  { id: '1', name: 'LitLabs Team', avatar: '🔥', lastMessage: 'The new features are live! 🚀', timestamp: '2m', unread: 3, online: true, pinned: true, isGroup: true, members: 12 },
  { id: '2', name: 'Alex Chen', avatar: '👨‍💻', lastMessage: 'Can you review my PR?', timestamp: '15m', unread: 1, online: true, typing: true },
  { id: '3', name: 'Sarah Dev', avatar: '👩‍💻', lastMessage: 'The API is ready for testing', timestamp: '1h', unread: 0, online: true },
  { id: '4', name: 'Crypto Traders', avatar: '💰', lastMessage: 'BTC breaking resistance! 📈', timestamp: '2h', unread: 47, online: true, isGroup: true, members: 156 },
  { id: '5', name: 'Mike Johnson', avatar: '🎮', lastMessage: 'GG! That was insane', timestamp: '3h', unread: 0, online: false },
  { id: '6', name: 'Design Team', avatar: '🎨', lastMessage: 'New mockups attached', timestamp: '5h', unread: 0, online: true, isGroup: true, members: 8, muted: true },
  { id: '7', name: 'Emma Wilson', avatar: '🌟', lastMessage: 'Thanks for the help!', timestamp: '1d', unread: 0, online: false },
  { id: '8', name: 'Support Bot', avatar: '🤖', lastMessage: 'How can I assist you today?', timestamp: '2d', unread: 0, online: true },
];

const MESSAGES: Message[] = [
  { id: '1', content: 'Hey team! 🔥', timestamp: '10:30 AM', sender: 'other', status: 'read', type: 'text' },
  { id: '2', content: 'The new terminal interface is looking absolutely INSANE', timestamp: '10:31 AM', sender: 'other', status: 'read', type: 'text' },
  { id: '3', content: 'I love the Matrix mode! Who came up with that? 🤯', timestamp: '10:32 AM', sender: 'other', status: 'read', type: 'text' },
  { id: '4', content: 'That was my idea actually! Glad you like it 😎', timestamp: '10:33 AM', sender: 'me', status: 'read', type: 'text' },
  { id: '5', content: 'The hacker aesthetic really ties everything together', timestamp: '10:34 AM', sender: 'me', status: 'read', type: 'text' },
  { id: '6', content: 'Absolutely! The whole platform feels so premium now', timestamp: '10:35 AM', sender: 'other', status: 'read', type: 'text' },
  { id: '7', content: 'When are we pushing to production?', timestamp: '10:36 AM', sender: 'other', status: 'read', type: 'text' },
  { id: '8', content: 'Tonight! Already running final tests', timestamp: '10:37 AM', sender: 'me', status: 'delivered', type: 'text' },
  { id: '9', content: 'The new features are live! 🚀', timestamp: '10:38 AM', sender: 'other', status: 'delivered', type: 'text' },
];

const QUICK_REPLIES = ['👍', '🔥', '😂', '❤️', '🚀', '👀'];

export default function MessagesPage() {
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [selectedConvo, setSelectedConvo] = useState<Conversation>(CONVERSATIONS[0]);
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'me',
      status: 'sent',
      type: 'text',
    };

    setMessages([...messages, msg]);
    setNewMessage('');

    // Simulate response
    setTimeout(() => {
      const responses = [
        'That sounds great! 🎉',
        'I agree completely!',
        'Working on it now...',
        'Let me check and get back to you',
        '👍 On it!',
      ];
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'other',
        status: 'delivered',
        type: 'text',
      };
      setMessages(prev => [...prev, response]);
    }, 1500);
  };

  const filteredConversations = conversations.filter(c => {
    if (filter === 'unread') return c.unread > 0;
    if (filter === 'groups') return c.isGroup;
    return true;
  }).filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)] flex rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition" title="New Group">
                  <Users className="w-5 h-5 text-white/60" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition" title="New Message">
                  <Plus className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full bg-slate-800 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-1 p-2 border-b border-white/10">
            {(['all', 'unread', 'groups'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-pink-500/20 text-pink-400'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {f === 'all' ? 'All' : f === 'unread' ? `Unread (${conversations.filter(c => c.unread > 0).length})` : 'Groups'}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((convo) => (
              <motion.div
                key={convo.id}
                onClick={() => setSelectedConvo(convo)}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                className={`p-3 cursor-pointer border-b border-white/5 ${
                  selectedConvo.id === convo.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl">
                      {convo.avatar}
                    </div>
                    {convo.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white truncate">{convo.name}</span>
                        {convo.pinned && <Pin className="w-3 h-3 text-yellow-400" />}
                        {convo.muted && <BellOff className="w-3 h-3 text-white/30" />}
                      </div>
                      <span className="text-xs text-white/40">{convo.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/50 truncate">
                        {convo.typing ? (
                          <span className="text-emerald-400">typing...</span>
                        ) : (
                          convo.lastMessage
                        )}
                      </p>
                      {convo.unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-pink-500 rounded-full text-xs font-bold">
                          {convo.unread > 99 ? '99+' : convo.unread}
                        </span>
                      )}
                    </div>
                    {convo.isGroup && (
                      <p className="text-xs text-white/30">{convo.members} members</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl">
                  {selectedConvo.avatar}
                </div>
                {selectedConvo.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-white">{selectedConvo.name}</h3>
                <p className="text-xs text-white/50">
                  {selectedConvo.typing ? (
                    <span className="text-emerald-400">typing...</span>
                  ) : selectedConvo.online ? (
                    'Online'
                  ) : (
                    'Last seen recently'
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Voice Call">
                <Phone className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Video Call">
                <Video className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="More Options">
                <MoreVertical className="w-5 h-5 text-white/60" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-2' : ''}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 rounded-br-md'
                        : 'bg-slate-800 rounded-bl-md'
                    }`}
                  >
                    <p className="text-white">{msg.content}</p>
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'justify-end' : ''}`}>
                    <span className="text-xs text-white/40">{msg.timestamp}</span>
                    {msg.sender === 'me' && (
                      msg.status === 'read' ? (
                        <CheckCheck className="w-4 h-4 text-blue-400" />
                      ) : msg.status === 'delivered' ? (
                        <CheckCheck className="w-4 h-4 text-white/40" />
                      ) : (
                        <Check className="w-4 h-4 text-white/40" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 flex gap-2">
            {QUICK_REPLIES.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setNewMessage(newMessage + emoji)}
                className="p-2 hover:bg-white/10 rounded-lg transition text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Attach File">
                <Paperclip className="w-5 h-5 text-white/60" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Send Image">
                <Image className="w-5 h-5 text-white/60" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-500 pr-12"
                />
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition"
                  title="Add Emoji"
                >
                  <Smile className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition" title="Voice Message">
                <Mic className="w-5 h-5 text-white/60" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                title="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="w-72 border-l border-white/10 p-4 hidden xl:block">
          <div className="text-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-5xl mx-auto mb-3">
              {selectedConvo.avatar}
            </div>
            <h3 className="font-bold text-white text-lg">{selectedConvo.name}</h3>
            <p className="text-white/50 text-sm">
              {selectedConvo.online ? '🟢 Online' : '⚫ Offline'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <h4 className="text-white/50 text-xs uppercase mb-2">Quick Actions</h4>
              <div className="grid grid-cols-3 gap-2">
                <button className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition flex flex-col items-center gap-1">
                  <Bell className="w-5 h-5 text-white/60" />
                  <span className="text-xs text-white/50">Mute</span>
                </button>
                <button className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition flex flex-col items-center gap-1">
                  <Pin className="w-5 h-5 text-white/60" />
                  <span className="text-xs text-white/50">Pin</span>
                </button>
                <button className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition flex flex-col items-center gap-1">
                  <Archive className="w-5 h-5 text-white/60" />
                  <span className="text-xs text-white/50">Archive</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-3">
              <h4 className="text-white/50 text-xs uppercase mb-2">Shared Media</h4>
              <div className="grid grid-cols-3 gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
                    {['📷', '🎬', '📄', '🎵', '📊', '🖼️'][i - 1]}
                  </div>
                ))}
              </div>
              <button className="w-full mt-2 text-pink-400 text-sm font-medium hover:text-pink-300 transition">
                View All Media
              </button>
            </div>

            {selectedConvo.isGroup && (
              <div className="bg-slate-800/50 rounded-xl p-3">
                <h4 className="text-white/50 text-xs uppercase mb-2">Members ({selectedConvo.members})</h4>
                <div className="flex -space-x-2">
                  {['😎', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🔬'].map((emoji, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-sm border-2 border-slate-900">
                      {emoji}
                    </div>
                  ))}
                  {selectedConvo.members && selectedConvo.members > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs border-2 border-slate-900">
                      +{selectedConvo.members - 5}
                    </div>
                  )}
                </div>
                <button className="w-full mt-2 text-pink-400 text-sm font-medium hover:text-pink-300 transition flex items-center justify-center gap-1">
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
              </div>
            )}

            <button className="w-full p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Delete Conversation
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useState, useEffect, useRef } from 'react';
import { subscribeToChat, sendMessage, getUserChats } from '../services/chatService';

const sanitizeInput = (input) => {
  const element = document.createElement('div');
  element.innerText = input;
  return element.innerHTML;
};

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{"id":"demo1","name":"Demo User"}');

  useEffect(() => {
    getUserChats(demoUser.id).then(setChats);
  }, [demoUser.id]);

  useEffect(() => {
    if (!activeChat) return;
    const unsubscribe = subscribeToChat(activeChat, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const sanitizedMessage = sanitizeInput(newMessage);
    sendMessage(activeChat, demoUser.id, sanitizedMessage);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden flex">
        {/* Chat List */}
        <div className="w-64 bg-gray-900/50 border-r border-gray-700/50 p-4">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <div className="space-y-2">
            {chats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  activeChat === chat.id ? 'bg-purple-500/20 border border-purple-500/50' : 'hover:bg-gray-800'
                }`}
              >
                <div className="font-medium">Chat {chat.id.slice(0, 8)}</div>
                <div className="text-sm text-gray-400 truncate">{chat.lastMessage?.text || 'No messages'}</div>
              </button>
            ))}
            {chats.length === 0 && (
              <div className="text-gray-500 text-sm p-4 text-center">
                No active chats
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === demoUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      msg.senderId === demoUser.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}>
                      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-gray-700/50 flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

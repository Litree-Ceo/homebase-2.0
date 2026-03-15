'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Home, Star, Plus } from 'lucide-react';

const rooms = [
  { id: 'home', name: 'My Home', type: 'default' },
  { id: 'studio', name: 'Creator Studio', type: 'premium' },
  { id: 'gallery', name: 'NFT Gallery', type: 'premium' },
  { id: 'arena', name: 'Event Arena', type: 'public' },
];

export function RoomSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-strong px-4 py-2 rounded-xl flex items-center gap-2 
                   text-white hover:bg-white/20 transition-all"
      >
        <Home className="w-4 h-4" />
        <span className="font-medium">{selectedRoom.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 w-56 glass-strong rounded-xl 
                       border border-white/20 overflow-hidden z-50"
          >
            <div className="p-2">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    setSelectedRoom(room);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                              transition-all ${
                                selectedRoom.id === room.id
                                  ? 'bg-lab-purple-500/20 text-white'
                                  : 'text-white/70 hover:bg-white/10'
                              }`}
                >
                  {room.type === 'premium' && <Star className="w-4 h-4 text-yellow-400" />}
                  <span className="font-medium">{room.name}</span>
                </button>
              ))}
              <div className="border-t border-white/10 my-2" />
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg 
                           text-lab-green-400 hover:bg-lab-green-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Create Room</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

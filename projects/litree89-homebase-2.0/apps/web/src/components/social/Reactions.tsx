'use client';

import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import type { Reaction } from '@/lib/types';

interface ReactionsProps {
  postId: string;
  reactions: Reaction[];
  userReaction?: Reaction;
  onReact: (reactionType: Reaction['type']) => Promise<void>;
}

const REACTION_TYPES = [
  { type: 'like' as const, emoji: '👍', label: 'Like' },
  { type: 'love' as const, emoji: '❤️', label: 'Love' },
  { type: 'haha' as const, emoji: '😂', label: 'Haha' },
  { type: 'wow' as const, emoji: '😮', label: 'Wow' },
  { type: 'sad' as const, emoji: '😢', label: 'Sad' },
  { type: 'angry' as const, emoji: '😡', label: 'Angry' },
];

export function Reactions({ reactions, userReaction, onReact }: ReactionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const handleReact = async (type: Reaction['type']) => {
    setIsLoading(true);
    try {
      await onReact(type);
      setShowPicker(false);
    } catch (error) {
      console.error('Failed to react:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {reactions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 py-2 bg-black/30 rounded-lg">
          {REACTION_TYPES.map(({ type, emoji }) => {
            const count = reactionCounts[type];
            if (!count) return null;

            return (
              <button
                key={type}
                onClick={() => handleReact(type)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                  userReaction?.type === type
                    ? 'bg-amber-500/60 text-amber-50'
                    : 'bg-black/60 text-amber-100 hover:bg-black/80'
                }`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-black/60 border border-amber-400/20 rounded-lg text-amber-100 hover:border-amber-400/60 transition-colors flex items-center justify-center gap-2"
        >
          {userReaction ? (
            <>
              <span>{REACTION_TYPES.find(r => r.type === userReaction.type)?.emoji}</span>
              <span>Change reaction</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>React</span>
            </>
          )}
        </button>

        {showPicker && (
          <div className="absolute z-20 mt-2">
            <Picker
              data={data}
              onEmojiSelect={() => {
                handleReact('like');
              }}
              theme="dark"
              previewPosition="none"
              navPosition="none"
              searchPosition="none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

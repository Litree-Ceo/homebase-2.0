'use client';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, Zap } from 'lucide-react';

export default function PostCard({
  avatar,
  name,
  handle,
  time,
  content,
  image,
  likes,
  comments,
  reposts,
  isFlashGenerated,
}) {
  return (
    <article className="border-b border-white/10 p-4 hover:bg-white/[0.02] transition-colors cursor-pointer animate-in fade-in duration-500">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/10">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-hc-purple to-black" />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-bold text-white hover:underline">{name}</span>
              <span className="text-gray-500">@{handle}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 hover:underline">{time}</span>
              {isFlashGenerated && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-hc-purple/10 border border-hc-purple/20 text-[10px] text-hc-light-purple font-bold uppercase tracking-wide">
                  <Zap size={10} /> Flash AI
                </span>
              )}
            </div>
            <button className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <p className="mt-1 text-gray-200 whitespace-pre-wrap leading-relaxed text-[15px]">
            {content}
          </p>

          {image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
              <img
                src={image}
                alt="Post content"
                className="w-full h-auto max-h-125 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between mt-3 max-w-md text-gray-500">
            <button className="group flex items-center gap-2 hover:text-hc-bright-gold transition-colors">
              <div className="p-2 rounded-full group-hover:bg-hc-bright-gold/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-xs font-medium">{comments}</span>
            </button>

            <button className="group flex items-center gap-2 hover:text-green-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Repeat2 size={18} />
              </div>
              <span className="text-xs font-medium">{reposts}</span>
            </button>

            <button className="group flex items-center gap-2 hover:text-pink-500 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
                <Heart size={18} />
              </div>
              <span className="text-xs font-medium">{likes}</span>
            </button>

            <button className="group flex items-center gap-2 hover:text-hc-purple transition-colors">
              <div className="p-2 rounded-full group-hover:bg-hc-purple/10 transition-colors">
                <Share size={18} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

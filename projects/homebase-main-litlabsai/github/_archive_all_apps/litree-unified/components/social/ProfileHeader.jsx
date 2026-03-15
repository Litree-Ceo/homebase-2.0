'use client';
import { MapPin, Link as LinkIcon, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProfileHeader() {
  return (
    <div>
      {/* Header Nav */}
      <div className="sticky top-0 z-30 bg-black/60 backdrop-blur-md px-4 py-1 border-b border-white/10 flex items-center gap-6">
        <Link href="/social" className="p-2 rounded-full hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-xl font-black">LiTree User</h2>
          <p className="text-xs text-gray-500">42 posts</p>
        </div>
      </div>

      {/* Cover Image */}
      <div className="h-48 bg-linear-to-r from-hc-purple to-hc-bright-gold relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-white/10">
        <div className="flex justify-between items-end -mt-18 mb-4">
          <div className="w-36 h-36 rounded-full border-4 border-black bg-gray-800 relative overflow-hidden">
            {/* Avatar Placeholder */}
            <div className="w-full h-full bg-linear-to-tr from-gray-700 to-gray-600"></div>
          </div>
          <button className="px-4 py-1.5 rounded-full border border-white/20 font-bold hover:bg-white/10 transition-colors mb-4">
            Edit profile
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-black leading-tight">LiTree User</h1>
          <p className="text-gray-500 text-sm mb-4">@litree_user</p>

          <p className="text-gray-200 mb-4 whitespace-pre-line">
            Building the future of digital studios. Creator of LiTreeLab'Studio™. Powered by Flash
            Cortex & NVIDIA NIM.
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-gray-500 text-sm mb-4">
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>The Metaverse</span>
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon size={16} />
              <a href="https://litree.io" className="text-hc-bright-gold hover:underline">
                litree.io
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Joined January 2026</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">143</span>{' '}
              <span className="text-gray-500">Following</span>
            </div>
            <div className="hover:underline cursor-pointer">
              <span className="font-bold text-white">1,234</span>{' '}
              <span className="text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button className="flex-1 py-4 hover:bg-white/5 transition-colors relative">
          <span className="font-bold">Posts</span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 bg-hc-bright-gold rounded-full"></div>
        </button>
        <button className="flex-1 py-4 hover:bg-white/5 transition-colors text-gray-500 font-medium">
          Replies
        </button>
        <button className="flex-1 py-4 hover:bg-white/5 transition-colors text-gray-500 font-medium">
          Highlights
        </button>
        <button className="flex-1 py-4 hover:bg-white/5 transition-colors text-gray-500 font-medium">
          Media
        </button>
        <button className="flex-1 py-4 hover:bg-white/5 transition-colors text-gray-500 font-medium">
          Likes
        </button>
      </div>
    </div>
  );
}

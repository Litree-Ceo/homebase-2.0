'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Hash,
  Bell,
  Mail,
  User,
  Settings,
  Zap,
  MoreHorizontal,
  PenTool,
  Image as ImageIcon,
} from 'lucide-react';

const NavItem = ({ href, icon: Icon, label, active }) => (
  <Link
    href={href}
    className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-200 group ${
      active
        ? 'bg-white/10 text-white font-bold'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}
  >
    <Icon
      className={`w-6 h-6 ${active ? 'text-hc-bright-gold' : 'group-hover:text-hc-bright-gold transition-colors'}`}
    />
    <span className="text-lg hidden xl:block">{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 xl:w-70 border-r border-white/10 bg-black/40 backdrop-blur-xl z-50 flex-col pt-4 px-2 xl:px-4">
      {/* Logo */}
      <div className="mb-8 px-4">
        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-hc-purple to-hc-bright-gold flex items-center justify-center">
          <Zap className="text-black fill-current" size={24} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        <NavItem href="/social" icon={Home} label="Home" active={pathname === '/social'} />
        <NavItem
          href="/social/explore"
          icon={Hash}
          label="Explore"
          active={pathname === '/social/explore'}
        />
        <NavItem
          href="/social/notifications"
          icon={Bell}
          label="Notifications"
          active={pathname === '/social/notifications'}
        />
        <NavItem
          href="/social/messages"
          icon={Mail}
          label="Messages"
          active={pathname === '/social/messages'}
        />
        <NavItem href="/flash" icon={Zap} label="Flash Cortex" active={pathname === '/flash'} />
        <NavItem href="/dashboard" icon={User} label="Profile" active={pathname === '/dashboard'} />
        <NavItem
          href="/settings"
          icon={Settings}
          label="Settings"
          active={pathname === '/settings'}
        />
      </nav>

      {/* Post Button */}
      <button className="my-4 bg-hc-purple hover:bg-hc-purple/90 text-white rounded-full p-4 xl:py-3 xl:px-8 transition-all shadow-[0_0_20px_rgba(107,33,168,0.3)] flex items-center justify-center gap-2">
        <PenTool className="w-6 h-6" />
        <span className="hidden xl:block font-bold">Post</span>
      </button>

      {/* User Mini Profile */}
      <div className="mt-auto mb-6 p-3 rounded-full hover:bg-white/5 cursor-pointer transition-colors flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 border border-white/10" />
        <div className="hidden xl:block flex-1 min-w-0">
          <p className="font-bold text-sm truncate">LiTree User</p>
          <p className="text-gray-500 text-xs truncate">@litree_user</p>
        </div>
        <MoreHorizontal className="hidden xl:block text-gray-500" />
      </div>
    </aside>
  );
}

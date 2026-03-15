'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Hash, Zap, Bell, User } from 'lucide-react';

const NavItem = ({ href, icon: Icon, active }) => (
  <Link
    href={href}
    className={`flex-1 flex justify-center items-center py-4 ${
      active ? 'text-hc-bright-gold' : 'text-gray-500'
    }`}
  >
    <Icon className="w-6 h-6" fill={active ? 'currentColor' : 'none'} />
  </Link>
);

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center z-50 pb-safe">
      <NavItem href="/social" icon={Home} active={pathname === '/social'} />
      <NavItem href="/social/explore" icon={Hash} active={pathname === '/social/explore'} />
      <NavItem href="/flash" icon={Zap} active={pathname === '/flash'} />
      <NavItem
        href="/social/notifications"
        icon={Bell}
        active={pathname === '/social/notifications'}
      />
      <NavItem href="/dashboard" icon={User} active={pathname === '/dashboard'} />
    </div>
  );
}

import { Bell, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/10">
      <h2 className="text-lg font-medium">Dashboard</h2>

      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-pink rounded-full" />
        </button>

        <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink flex items-center justify-center">
            <User className="w-4 h-4 text-overlord-900" />
          </div>
        </button>
      </div>
    </header>
  );
}

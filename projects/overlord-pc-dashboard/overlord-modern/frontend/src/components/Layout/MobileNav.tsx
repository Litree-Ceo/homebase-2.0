'use client'; 
 
import { motion } from 'framer-motion'; 
import { Home, Compass, User, MessageSquare, Bot } from 'lucide-react'; 
import { usePathname } from '@/lib/next-shim'; 
 
const navItems = [ 
  { icon: Home, label: 'Home', href: '/dashboard' }, 
  { icon: Compass, label: 'Explore', href: '/world' }, 
  { icon: MessageSquare, label: 'Social', href: '/social' }, 
  { icon: User, label: 'Profile', href: '/profile' }, 
]; 
 
export function MobileNav() { 
  const pathname = usePathname(); 
   
  const handleAgentClick = () => { 
    window.dispatchEvent(new Event('toggle-agent')); 
  }; 
 
  return ( 
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"> 
      <nav className="relative bg-black/90 backdrop-blur-2xl border-t border-white/10 pb-safe"> 
        <div className="flex items-center justify-around h-16 px-4"> 
          {navItems.map((item) => { 
            const Icon = item.icon; 
            const isActive = pathname === item.href; 
             
            return ( 
              <a 
                key={item.label} 
                href={item.href} 
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${ 
                  isActive ? 'text-lab-purple-400' : 'text-white/40' 
                }`} 
              > 
                <Icon className="w-5 h-5" /> 
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span> 
              </a> 
            ); 
          })} 
        </div> 
 
        {/* Center Agent Zero Button */} 
        <motion.button 
          whileHover={{ scale: 1.1 }} 
          whileTap={{ scale: 0.9 }} 
          onClick={handleAgentClick} 
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-lab-purple-600 border-4 border-black rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 z-50" 
        > 
          <Bot className="w-7 h-7 text-white" /> 
        </motion.button> 
      </nav> 
    </div> 
  ); 
}
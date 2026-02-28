import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/feed', name: 'Feed' },
    { path: '/friends', name: 'Friends' },
    { path: '/chat', name: 'Chat' },
    { path: '/games', name: 'Games' },
    { path: '/music', name: 'Music' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link to="/" className="font-bold text-xl text-blue-600 hover:text-blue-800 transition-colors">
              HomeBase
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-gray-600 hover:text-blue-600 transition-colors ${
                    location.pathname === link.path ? 'font-semibold text-blue-600' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`block py-2 text-gray-600 hover:text-blue-600 transition-colors ${
                    location.pathname === link.path ? 'font-semibold text-blue-600' : ''
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
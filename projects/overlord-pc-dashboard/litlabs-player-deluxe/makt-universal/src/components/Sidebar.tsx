import React from 'react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: '' },
    { name: 'Projects', icon: '' },
    { name: 'Analytics', icon: '' },
    { name: 'Termux', icon: '' },
    { name: 'Profile', icon: '' },
    { name: 'Settings', icon: '' },
  ];

  return (
    <div className="bg-makt-black border-r border-makt-cyan w-64 p-4 flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-makt-gold">HomeBase Pro</h1>
      </div>
      <nav className="flex-grow">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-4">
              <a href="#" className="flex items-center p-2 text-makt-light-cyan hover:text-makt-gold hover:bg-makt-cyan/10 rounded-md transition-colors">
                {/* Add icon here */}
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="text-center">
        <p className="text-sm text-makt-cyan">LAB Gramza</p>
        <p className="text-xs text-makt-light-cyan">highlife4real1989@gmail.com</p>
        <button className="mt-4 makt-button">Sign Out</button>
      </div>
    </div>
  );
};

export default Sidebar;
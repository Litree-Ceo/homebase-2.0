import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Processes } from './components/Processes/Processes';
import { Storage } from './components/Storage/Storage';
import { Network } from './components/Network/Network';
import { Terminal } from './components/Terminal/Terminal';
import { Settings } from './components/Settings/Settings';
import { AIAssistant } from './components/AIAssistant/AIAssistant';

export default function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-white min-h-screen">
        <Toaster />
        <Navbar />
        <main className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/processes" element={<Processes />} />
            <Route path="/storage" element={<Storage />} />
            <Route path="/network" element={<Network />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <MobileNav />
        <AIAssistant />
      </div>
    </Router>
  );
}

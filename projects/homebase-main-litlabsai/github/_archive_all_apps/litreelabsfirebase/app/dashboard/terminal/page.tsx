'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';

type CommandOutput = {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system' | 'ascii';
  content: string;
  timestamp: Date;
};

const ASCII_BANNER = `
██╗     ██╗████████╗██╗      █████╗ ██████╗ ███████╗
██║     ██║╚══██╔══╝██║     ██╔══██╗██╔══██╗██╔════╝
██║     ██║   ██║   ██║     ███████║██████╔╝███████╗
██║     ██║   ██║   ██║     ██╔══██║██╔══██╗╚════██║
███████╗██║   ██║   ███████╗██║  ██║██████╔╝███████║
╚══════╝╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝ ╚══════╝
                    ULTRA TERMINAL v2.0
`;

const COMMANDS: Record<string, { description: string; handler: () => string | string[] }> = {
  help: {
    description: 'Show all available commands',
    handler: () => [
      '╔══════════════════════════════════════════════════════════════╗',
      '║                    AVAILABLE COMMANDS                        ║',
      '╠══════════════════════════════════════════════════════════════╣',
      '║  help          - Show this help menu                         ║',
      '║  clear         - Clear terminal screen                       ║',
      '║  status        - System status overview                      ║',
      '║  stats         - Your platform statistics                    ║',
      '║  wallet        - Check crypto wallet balances                ║',
      '║  mine          - Start LITBIT mining simulation              ║',
      '║  hack          - Run security audit (simulation)             ║',
      '║  scan          - Network scan visualization                  ║',
      '║  matrix        - Toggle Matrix rain effect                   ║',
      '║  whoami        - Display user information                    ║',
      '║  uptime        - System uptime                               ║',
      '║  neofetch      - System information                          ║',
      '║  cowsay <msg>  - Make ASCII cow say something                ║',
      '║  fortune       - Random hacker quote                         ║',
      '║  ping <host>   - Ping simulation                             ║',
      '║  nmap          - Port scan simulation                        ║',
      '║  sudo rm -rf   - Nice try 😏                                 ║',
      '╚══════════════════════════════════════════════════════════════╝',
    ],
  },
  status: {
    description: 'System status overview',
    handler: () => [
      '┌─────────────────────────────────────────┐',
      '│         LITLABS SYSTEM STATUS           │',
      '├─────────────────────────────────────────┤',
      '│  🟢 API Server       : ONLINE           │',
      '│  🟢 Database         : CONNECTED        │',
      '│  🟢 AI Models        : READY            │',
      '│  🟢 Crypto Engine    : ACTIVE           │',
      '│  🟢 Media CDN        : STREAMING        │',
      '│  🟡 Mining Pool      : 847 NODES        │',
      '├─────────────────────────────────────────┤',
      '│  CPU: ████████░░ 78%  RAM: ██████░░ 62% │',
      '│  NET: ↓ 142MB/s ↑ 89MB/s                │',
      '└─────────────────────────────────────────┘',
    ],
  },
  stats: {
    description: 'Your platform statistics',
    handler: () => [
      '╔═══════════════════════════════════════════╗',
      '║           YOUR LITLABS STATS              ║',
      '╠═══════════════════════════════════════════╣',
      '║  📊 Posts Created     : 1,247             ║',
      '║  👥 Followers         : 15,892            ║',
      '║  💰 Revenue (MTD)     : $4,521.00         ║',
      '║  🎯 Missions Complete : 89/100            ║',
      '║  🔥 Current Streak    : 12 days           ║',
      '║  ⭐ XP Level          : 47                ║',
      '║  🏆 Achievements      : 23/50             ║',
      '╚═══════════════════════════════════════════╝',
    ],
  },
  wallet: {
    description: 'Check crypto wallet balances',
    handler: () => [
      '┌──────────────────────────────────────────────┐',
      '│            CRYPTO WALLET BALANCES            │',
      '├──────────────────────────────────────────────┤',
      '│  💎 LITBIT    :  12,847.00   ($1,284.70)     │',
      '│  ⟠  ETH       :      2.451   ($4,902.00)     │',
      '│  ₿  BTC       :      0.089   ($3,471.00)     │',
      '│  ◎  SOL       :     45.200   ($1,356.00)     │',
      '│  🔷 MATIC     :    892.000   ($892.00)       │',
      '├──────────────────────────────────────────────┤',
      '│  TOTAL PORTFOLIO VALUE: $11,905.70          │',
      '│  24H CHANGE: +$847.21 (+7.65%) 📈           │',
      '└──────────────────────────────────────────────┘',
    ],
  },
  mine: {
    description: 'Start LITBIT mining simulation',
    handler: () => [
      '⛏️  LITBIT MINING INITIATED...',
      '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%',
      '✅ Block #847291 mined successfully!',
      '💎 Reward: +0.0847 LITBIT',
      '🔥 Hash rate: 142.7 MH/s',
      '⚡ Power: 89W | Efficiency: 1.6 MH/W',
    ],
  },
  hack: {
    description: 'Run security audit (simulation)',
    handler: () => [
      '🔐 INITIALIZING SECURITY AUDIT...',
      '',
      '[▓▓▓░░░░░░░] 25% - Scanning ports...',
      '[▓▓▓▓▓▓░░░░] 55% - Checking vulnerabilities...',
      '[▓▓▓▓▓▓▓▓░░] 80% - Analyzing firewall...',
      '[▓▓▓▓▓▓▓▓▓▓] 100% - Complete!',
      '',
      '╔════════════════════════════════════╗',
      '║     SECURITY AUDIT RESULTS         ║',
      '╠════════════════════════════════════╣',
      '║  🛡️  Firewall: STRONG              ║',
      '║  🔒 SSL/TLS: A+ GRADE              ║',
      '║  🚫 Open Ports: 3 (expected)       ║',
      '║  ✅ No vulnerabilities found       ║',
      '║  📊 Security Score: 98/100         ║',
      '╚════════════════════════════════════╝',
    ],
  },
  scan: {
    description: 'Network scan visualization',
    handler: () => [
      '📡 NETWORK SCAN IN PROGRESS...',
      '',
      '  192.168.1.1   ████████████ ROUTER',
      '  192.168.1.42  ██████████░░ LITLABS-SERVER',
      '  192.168.1.100 ████████░░░░ DB-PRIMARY',
      '  192.168.1.101 ████████░░░░ DB-REPLICA',
      '  192.168.1.200 ██████░░░░░░ CDN-NODE-1',
      '  192.168.1.201 ██████░░░░░░ CDN-NODE-2',
      '',
      '✅ 6 devices found | 0 unknown | Network: SECURE',
    ],
  },
  whoami: {
    description: 'Display user information',
    handler: () => [
      '╔═══════════════════════════════════════╗',
      '║            USER PROFILE               ║',
      '╠═══════════════════════════════════════╣',
      '║  Username  : root@litlabs             ║',
      '║  Role      : ADMIN / FOUNDER          ║',
      '║  Access    : GOD MODE ENABLED         ║',
      '║  Created   : 2024-01-01               ║',
      '║  Last Login: Just now                 ║',
      '║  IP        : 127.0.0.1                ║',
      '╚═══════════════════════════════════════╝',
    ],
  },
  uptime: {
    description: 'System uptime',
    handler: () => `⏱️  System uptime: 847 days, 23 hours, 59 minutes`,
  },
  neofetch: {
    description: 'System information',
    handler: () => [
      '        .--.        root@litlabs',
      '       |o_o |       ─────────────────────',
      '       |:_/ |       OS: LitLabs Ultra v2.0',
      '      //   \\ \\      Host: Cloud Infrastructure',
      '     (|     | )     Kernel: Node.js 20.x',
      '    /\\_)   (_/\\    Shell: litterm 2.0',
      '    \\___)=(___/     Resolution: 1920x1080',
      '                    Theme: Hacker Dark [Matrix]',
      '                    CPU: 128-core Cloud vCPU',
      '                    Memory: 512GB / 1024GB',
      '                    Disk: 42TB / 100TB',
    ],
  },
  fortune: {
    description: 'Random hacker quote',
    handler: () => {
      const quotes = [
        '"The only truly secure system is one that is powered off." - Gene Spafford',
        '"Hackers are breaking systems for profit. Before, it was about intellectual curiosity." - Kevin Mitnick',
        '"There is no cloud, just other people\'s computers."',
        '"I\'m not a hacker, I\'m a security researcher who broke in." - Anonymous',
        '"With great power comes great responsibility... and root access."',
        '"sudo make me a sandwich"',
        '"It\'s not a bug, it\'s an undocumented feature."',
        '"There are only 10 types of people: those who understand binary and those who don\'t."',
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
    },
  },
  nmap: {
    description: 'Port scan simulation',
    handler: () => [
      'Starting Nmap 7.94 ( https://nmap.org )',
      'Nmap scan report for litlabs.local (127.0.0.1)',
      'Host is up (0.00021s latency).',
      '',
      'PORT      STATE    SERVICE',
      '22/tcp    open     ssh',
      '80/tcp    open     http',
      '443/tcp   open     https',
      '3000/tcp  open     nextjs',
      '5432/tcp  filtered postgresql',
      '6379/tcp  filtered redis',
      '',
      'Nmap done: 1 IP address (1 host up) scanned in 2.47 seconds',
    ],
  },
  'sudo rm -rf': {
    description: 'Nice try',
    handler: () => [
      '🚫 ACCESS DENIED',
      '',
      '╔═══════════════════════════════════════╗',
      '║  Nice try, but this isn\'t your       ║',
      '║  first rodeo... or is it? 😏         ║',
      '║                                       ║',
      '║  Your attempt has been logged.        ║',
      '║  Security team notified. (jk)         ║',
      '╚═══════════════════════════════════════╝',
    ],
  },
};

export default function TerminalPage() {
  const [history, setHistory] = useState<CommandOutput[]>([
    { id: '0', type: 'ascii', content: ASCII_BANNER, timestamp: new Date() },
    { id: '1', type: 'system', content: 'Type "help" for available commands', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [matrixMode, setMatrixMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  const executeCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory: CommandOutput[] = [
      ...history,
      { id: Date.now().toString(), type: 'input', content: `root@litlabs:~$ ${cmd}`, timestamp: new Date() },
    ];

    if (trimmed === 'clear') {
      setHistory([
        { id: Date.now().toString(), type: 'ascii', content: ASCII_BANNER, timestamp: new Date() },
        { id: (Date.now() + 1).toString(), type: 'system', content: 'Terminal cleared. Type "help" for commands.', timestamp: new Date() },
      ]);
      return;
    }

    if (trimmed === 'matrix') {
      setMatrixMode(!matrixMode);
      newHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'success',
        content: matrixMode ? '🔴 Matrix mode DISABLED' : '🟢 Matrix mode ENABLED - Welcome to the Matrix, Neo.',
        timestamp: new Date(),
      });
      setHistory(newHistory);
      return;
    }

    if (trimmed.startsWith('cowsay ')) {
      const message = cmd.slice(7);
      const cowOutput = [
        ` ${'_'.repeat(message.length + 2)}`,
        `< ${message} >`,
        ` ${'-'.repeat(message.length + 2)}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
      ];
      newHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: cowOutput.join('\n'),
        timestamp: new Date(),
      });
      setHistory(newHistory);
      return;
    }

    if (trimmed.startsWith('ping ')) {
      const host = cmd.slice(5);
      const pingOutput = [
        `PING ${host} (142.250.185.78): 56 data bytes`,
        `64 bytes from ${host}: icmp_seq=0 ttl=117 time=14.2 ms`,
        `64 bytes from ${host}: icmp_seq=1 ttl=117 time=13.8 ms`,
        `64 bytes from ${host}: icmp_seq=2 ttl=117 time=15.1 ms`,
        `64 bytes from ${host}: icmp_seq=3 ttl=117 time=14.5 ms`,
        ``,
        `--- ${host} ping statistics ---`,
        `4 packets transmitted, 4 packets received, 0.0% packet loss`,
        `round-trip min/avg/max/stddev = 13.8/14.4/15.1/0.5 ms`,
      ];
      newHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: pingOutput.join('\n'),
        timestamp: new Date(),
      });
      setHistory(newHistory);
      return;
    }

    const command = COMMANDS[trimmed];
    if (command) {
      const output = command.handler();
      const outputArray = Array.isArray(output) ? output : [output];
      newHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'output',
        content: outputArray.join('\n'),
        timestamp: new Date(),
      });
    } else if (trimmed) {
      newHistory.push({
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: `Command not found: ${trimmed}. Type "help" for available commands.`,
        timestamp: new Date(),
      });
    }

    setHistory(newHistory);
    setCommandHistory([...commandHistory, cmd]);
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-[calc(100vh-200px)]">
        {/* Matrix Rain Background */}
        {matrixMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-green-500 font-mono text-sm opacity-30"
                initial={{ y: -100, x: Math.random() * 100 + '%' }}
                animate={{ y: '100vh' }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: 'linear',
                  delay: Math.random() * 2,
                }}
              >
                {String.fromCharCode(0x30A0 + Math.random() * 96)}
              </motion.div>
            ))}
          </div>
        )}

        {/* Terminal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10"
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 bg-gray-900 border border-green-500/30 rounded-t-lg px-4 py-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-4 text-green-400 font-mono text-sm">root@litlabs:~</span>
            <span className="ml-auto text-green-500/50 text-xs font-mono">LITTERM v2.0</span>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            onClick={() => inputRef.current?.focus()}
            className={`bg-black/90 border-x border-b rounded-b-lg p-4 font-mono text-sm h-[600px] overflow-y-auto cursor-text ${
              matrixMode ? 'border-green-500/50' : 'border-green-500/30'
            }`}
          >
            <AnimatePresence>
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`whitespace-pre-wrap mb-1 ${
                    item.type === 'input' ? 'text-green-400' :
                    item.type === 'error' ? 'text-red-400' :
                    item.type === 'success' ? 'text-emerald-400' :
                    item.type === 'system' ? 'text-yellow-400' :
                    item.type === 'ascii' ? 'text-cyan-400' :
                    'text-gray-300'
                  }`}
                >
                  {item.content}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Input Line */}
            <div className="flex items-center text-green-400">
              <span>root@litlabs:~$ </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-green-400 caret-green-500"
                autoFocus
                spellCheck={false}
              />
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="w-2 h-5 bg-green-500 ml-1"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Commands */}
        <div className="mt-4 flex flex-wrap gap-2">
          {['help', 'status', 'wallet', 'hack', 'matrix', 'neofetch'].map((cmd) => (
            <button
              key={cmd}
              onClick={() => {
                executeCommand(cmd);
              }}
              className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs font-mono hover:bg-green-500/20 transition"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-black/50 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-green-500/50 text-xs font-mono">COMMANDS</p>
            <p className="text-green-400 text-xl font-bold font-mono">{commandHistory.length}</p>
          </div>
          <div className="bg-black/50 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-green-500/50 text-xs font-mono">SESSION</p>
            <p className="text-green-400 text-xl font-bold font-mono">ACTIVE</p>
          </div>
          <div className="bg-black/50 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-green-500/50 text-xs font-mono">MODE</p>
            <p className={`text-xl font-bold font-mono ${matrixMode ? 'text-green-400' : 'text-gray-500'}`}>
              {matrixMode ? 'MATRIX' : 'NORMAL'}
            </p>
          </div>
          <div className="bg-black/50 border border-green-500/20 rounded-lg p-3 text-center">
            <p className="text-green-500/50 text-xs font-mono">ACCESS</p>
            <p className="text-cyan-400 text-xl font-bold font-mono">ROOT</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

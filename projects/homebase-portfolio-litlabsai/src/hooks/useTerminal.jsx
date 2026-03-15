import { useState, useEffect, useCallback } from 'react';
import { db, auth } from '../config/firebase';
import { getAI, getGenerativeModel } from 'firebase/ai';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";

// --- Alias Resolution ---
const aliasMap = {
  ls: 'eza',
  ll: 'eza -l --icons --git --header',
  la: 'eza -la --icons --git',
  cat: 'bat',
  gs: 'git status',
  ga: 'git add .',
  gc: 'git commit -m',
  gp: 'git push',
  gpl: 'git pull',
  gpp: 'git push',
  nv: 'nvim',
  h: 'cd ~',
  u: 'cd /storage/emulated/0/Download',
  up: 'pkg update && pkg upgrade -y',
  cl: 'pkg autoclean && rm -rf ~/.cache/*',
  'savage-clean': 'up && cl',
  'backup-config': 'cp ~/.zshrc ~/.zshrc.bak',
  py: 'python',
};

const resolveAlias = (command) => {
  const [cmd] = command.split(' ');
  return aliasMap[cmd] ? aliasMap[cmd] + command.substring(cmd.length) : command;
};



const handleSavageCommands = (cmd, projects) => {
  // Simulated eza for projects
  if (cmd.startsWith('eza')) {
    if (!projects || projects.length === 0) return 'No projects found.';
    let output = 'Projects:\n';
    if (cmd.includes('-l')) {
        output += projects.map(p => `drwxr-xr-x  - staff ${new Date(p.createdAt?.toDate()).toLocaleDateString()}  ${p.title}`).join('\n');
    } else {
        output += projects.map(p => ` ${p.title}`).join('  ');
    }
    return output;
  }

  // Simulated bat for project details
  if (cmd.startsWith('bat')) {
      const projectName = cmd.split(' ').slice(1).join(' ');
      const project = projects.find(p => p.title.toLowerCase() === projectName.toLowerCase());
      if (!project) return `File not found: ${projectName}`;
      return `--- Project: ${project.title} ---\nStatus: ${project.status}\nDescription: ${project.description || 'N/A'}\nTags: ${project.tags?.join(', ') || 'N/A'}`;
  }

  // Simulated git commands
  if (cmd.startsWith('git')) {
      return "Git commands are not fully functional in this simulated environment. Use the Projects page to manage your portfolio.";
  }

  return null;
}


const handleInfoCommands = (cmd, projects) => {
  if (/^(hello|hi|hey|greetings)/.test(cmd)) {
    const responses = [
      "Greetings, human. I'm Online and ready to assist.",
      "Hello! The matrix has you... just kidding. How can I help?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (cmd === 'help' || cmd === '?') {
    return `HomeBase Pro - Savage Edition Help:

  CORE COMMANDS:
  • projects      - List all your projects (alias: ls)
  • bat <project> - Show details for a specific project (alias: cat)
  • stats         - Show project statistics
  • ai <prompt>   - Ask Gemini AI anything (powered by Firebase AI)
  • clear         - Clear terminal screen
  • whoami        - Show current user info
  • date          - Show current date/time
  • uptime        - Show simulated system uptime

  SAVAGE ALIASES:
  • ll, la        - Detailed project listings
  • gs, ga, gp    - Simulated Git commands
  • up, cl        - Simulated system maintenance
  • h             - Go to 'home' (simulated)
  • nv            - Open Neovim (simulated)
    `;
  }

  if (cmd === 'whoami') {
    return auth.currentUser ? `Logged in as: ${auth.currentUser.displayName} (${auth.currentUser.email})` : 'Not logged in';
  }

  if (cmd === 'date') {
    return new Date().toLocaleString();
  }

  if (cmd === 'stats') {
    if (!projects || projects.length === 0) return 'No project data to analyze.';
    const active = projects.filter(p => p.status === 'Active').length;
    const completed = projects.filter(p => p.status === 'Completed').length;
    return `Project Stats:\n  • Total Projects: ${projects.length}\n  • Active: ${active}\n  • Completed: ${completed}`;
  }

  if (cmd === 'projects') {
      return generateSavageResponse('eza -l', projects);
  }
  
  if (cmd === 'uptime') {
    const days = Math.floor(Math.random() * 999);
    return `System uptime: ${days} days...`;
  }

  return null;
}

// --- "Savage" Command Simulation ---
const generateSavageResponse = (command, projects, clear) => {
  const cmd = command.toLowerCase().trim();

  const savageResponse = handleSavageCommands(cmd, projects);
  if (savageResponse) return savageResponse;

  const infoResponse = handleInfoCommands(cmd, projects);
  if (infoResponse) return infoResponse;

  if (cmd === 'clear') {
    clear();
    return null;
  }

  // Other simulated commands
  if (['nvim', 'cd ~', 'pkg update && pkg upgrade -y', 'pkg autoclean && rm -rf ~/.cache/*'].includes(cmd)) {
      return `Simulating command: ${cmd}`;
  }

  return `Command not found: ${command}. Type "help" for a list of commands.`;
};

export const useTerminal = () => {
  const [history, setHistory] = useState([
    { type: 'response', text: "Welcome to HomeBase Pro - Savage Edition. Type 'help' for commands." },
  ]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "projects"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const executeCommand = useCallback(async (command) => {
    if (!user) return;
    const trimmedCmd = command.trim();
    const resolvedCmd = resolveAlias(trimmedCmd);
    const commandEntry = { type: 'command', text: trimmedCmd };

    if (resolvedCmd.startsWith('ai ')) {
      const prompt = resolvedCmd.slice(3);
      setHistory(prev => [...prev, commandEntry]);
      try {
        const ai = getAI();
        const model = getGenerativeModel(ai, { model: "gemini-1.5-flash" });
        const result = await model.generateContentStream(prompt);

        let responseText = '';
        for await (const item of result.stream) {
          responseText += item.text();
          setHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { type: 'response', text: responseText };
            return newHistory;
          });
        }
      } catch (error) {
        setHistory(prev => [...prev, { type: 'response', text: `AI Error: ${error.message}` }]);
      }
    } else {
      const response = generateSavageResponse(resolvedCmd, projects);

      if (response !== null) {
        setHistory((prev) => [...prev, commandEntry, { type: "response", text: response }]);
      }
    }

    try {
      await addDoc(collection(db, "terminal-history"), {
        type: 'command',
        text: trimmedCmd,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Failed to save command to history:", error);
    }
  }, [user, projects]);

  const clear = useCallback(() => {
    setHistory([
      { type: 'response', text: 'Terminal cleared. Type "help" for commands.' }
    ]);
  }, []);

  return { history, loading, executeCommand, clear, projects };
};

export default useTerminal;
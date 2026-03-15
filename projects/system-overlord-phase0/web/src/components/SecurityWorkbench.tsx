/**
 * Security Workbench Component
 * Provides UI for viewing/executing security tools against targets
 * Located at: web/src/components/SecurityWorkbench.tsx
 */

import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { useAuth } from '@/lib/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  platforms: string[];
  requiresApproval: boolean;
}

interface CommandExecution {
  id: string;
  toolId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface CommandRequest {
  toolId: string;
  parameters: Record<string, any>;
  targetAgent: 'termux' | 'pc-docker' | 'kali-remote';
  priority?: 'low' | 'normal' | 'high';
}

const riskColors = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-red-100 text-red-800 border-red-300',
};

const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  executing: <Clock className="w-4 h-4 animate-spin" />,
  completed: <CheckCircle className="w-4 h-4 text-green-600" />,
  failed: <XCircle className="w-4 h-4 text-red-600" />,
};

export default function SecurityWorkbench() {
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [executions, setExecutions] = useState<CommandExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [targetAgent, setTargetAgent] = useState<'termux' | 'pc-docker' | 'kali-remote'>('pc-docker');

  // Load tools catalog
  useEffect(() => {
    loadToolsCatalog();
    loadExecutions();
  }, []);

  const loadToolsCatalog = async () => {
    try {
      // In production, load from Firestore config
      const mockTools: Tool[] = [
        {
          id: 'nmap-scan',
          name: 'nmap',
          description: 'Network port scanning and service detection',
          riskLevel: 'LOW',
          platforms: ['termux', 'pc-docker', 'kali-remote'],
          requiresApproval: false,
        },
        {
          id: 'httpx-probe',
          name: 'httpx',
          description: 'HTTP/HTTPS service probing',
          riskLevel: 'LOW',
          platforms: ['termux', 'pc-docker'],
          requiresApproval: false,
        },
        {
          id: 'nikto-scan',
          name: 'nikto',
          description: 'Web server vulnerability scanner',
          riskLevel: 'MEDIUM',
          platforms: ['pc-docker', 'kali-remote'],
          requiresApproval: true,
        },
        {
          id: 'sqlmap-injection',
          name: 'sqlmap',
          description: 'SQL injection detection and exploitation',
          riskLevel: 'HIGH',
          platforms: ['kali-remote'],
          requiresApproval: true,
        },
      ];
      setTools(mockTools);
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const loadExecutions = async () => {
    try {
      // Load recent executions from Firestore
      const execQuery = db
        .collection('security_commands')
        .where('userId', '==', user?.uid)
        .orderBy('createdAt', 'desc')
        .limit(10);

      const snapshot = await execQuery.get();
      const execs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CommandExecution[];

      setExecutions(execs);
    } catch (error) {
      console.error('Failed to load executions:', error);
    }
  };

  const submitCommand = async () => {
    if (!selectedTool || !user) return;

    setLoading(true);
    try {
      const queueCommand = httpsCallable(functions, 'queueCommand');

      const request: CommandRequest = {
        toolId: selectedTool.id,
        parameters,
        targetAgent,
        priority: 'normal',
      };

      const response = await queueCommand(request);
      console.log('Command queued:', response.data);

      // Reset form
      setParameters({});

      // Reload executions
      loadExecutions();
    } catch (error) {
      console.error('Failed to queue command:', error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedTool) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-red-500">🛡️ Security Workbench</h2>
        <p className="text-sm text-gray-600">
          Advanced offensive security tools for authorized testing. All operations are logged and audited.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition ${
                riskColors[tool.riskLevel]
              }`}
              onClick={() => setSelectedTool(tool)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{tool.name}</h3>
                  <p className="text-xs mt-1">{tool.description}</p>
                </div>
                <span className="px-2 py-1 bg-black bg-opacity-20 rounded text-xs">{tool.riskLevel}</span>
              </div>
              <div className="mt-2 text-xs">
                <strong>Available on:</strong> {tool.platforms.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Executions */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Recent Executions</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executions.map((exec) => (
              <div key={exec.id} className="border rounded p-3 text-xs flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-mono">{exec.id.substring(0, 12)}...</div>
                  <div className="text-gray-600">{exec.toolId}</div>
                </div>
                <div className="flex items-center gap-2">
                  {statusIcons[exec.status]}
                  <span className="font-mono text-xs">{exec.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setSelectedTool(null)} variant="outline" className="mb-4">
        ← Back to Tools
      </Button>

      <div className={`border-2 rounded-lg p-6 ${riskColors[selectedTool.riskLevel]}`}>
        <h2 className="text-2xl font-bold mb-2">{selectedTool.name}</h2>
        <p className="text-sm mb-4">{selectedTool.description}</p>

        {selectedTool.requiresApproval && (
          <div className="bg-yellow-200 bg-opacity-50 border border-yellow-600 rounded p-3 mb-4 flex gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              This tool requires biometric approval and comprehensive audit logging. All activities will be recorded.
            </span>
          </div>
        )}
      </div>

      {/* Parameters Form */}
      <Tabs defaultValue="parameters" className="mt-6">
        <TabsList>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-4">
          {/* Dynamic parameter form based on tool schema */}
          {selectedTool.id === 'nmap-scan' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Target (IP/Hostname/CIDR)</label>
                <input
                  type="text"
                  placeholder="example.com or 192.168.1.0/24"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  onChange={(e) => setParameters({ ...parameters, target: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Ports</label>
                <input
                  type="text"
                  placeholder="1-1000 or 22,80,443"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  onChange={(e) => setParameters({ ...parameters, ports: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Scan Type</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  onChange={(e) => setParameters({ ...parameters, scanType: e.target.value })}
                >
                  <option value="-sS">SYN Scan (stealthy)</option>
                  <option value="-sT">TCP Connect</option>
                  <option value="-sU">UDP Scan</option>
                </select>
              </div>
            </>
          )}

          {selectedTool.id === 'nikto-scan' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Target URL</label>
                <input
                  type="text"
                  placeholder="http://example.com"
                  className="w-full border rounded px-3 py-2 font-mono text-sm"
                  onChange={(e) => setParameters({ ...parameters, target: e.target.value })}
                />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <strong>Note:</strong> Must have authorization to scan target. Provide domain ownership verification if prompted.
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Execute On</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={targetAgent}
              onChange={(e) => setTargetAgent(e.target.value as any)}
            >
              {selectedTool.platforms.includes('termux') && <option value="termux">Termux (Mobile)</option>}
              {selectedTool.platforms.includes('pc-docker') && <option value="pc-docker">PC (Docker)</option>}
              {selectedTool.platforms.includes('kali-remote') && <option value="kali-remote">Remote Kali</option>}
            </select>
          </div>

          <Button
            onClick={submitCommand}
            disabled={loading || !parameters.target}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Submitting...' : '🔴 Execute Now'}
          </Button>
        </TabsContent>

        <TabsContent value="presets" className="space-y-2">
          <p className="text-sm text-gray-600 mb-4">Quick templates for common scenarios</p>

          {/* Example presets */}
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setParameters({ target: 'example.com', ports: '80,443', scanType: '-sS' })}
          >
            <span>Web Server Recon</span>
            <span className="ml-auto text-xs">nmap -sS example.com -p 80,443</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setParameters({ target: 'example.com', ports: '1-65535', scanType: '-sS' })}
          >
            <span>Full Port Scan</span>
            <span className="ml-auto text-xs">nmap -sS example.com -p 1-65535</span>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

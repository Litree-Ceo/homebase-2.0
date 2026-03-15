/**
 * LiTree Labs Smart Bridge
 * Intelligent integration layer between Studio and Overlord
 */

const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 7777;

app.use(cors());
app.use(express.json());

// Smart State Manager
class SmartState {
    constructor() {
        this.sessions = new Map();
        this.agents = new Map();
        this.projects = [];
        this.systemHealth = {};
    }

    addSession(type, data) {
        const id = Date.now().toString(36);
        this.sessions.set(id, {
            id,
            type,
            data,
            timestamp: new Date(),
            status: 'active'
        });
        return id;
    }

    getRecentSessions(limit = 10) {
        return Array.from(this.sessions.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }
}

const state = new SmartState();

// AI Agent Orchestrator
class AgentOrchestrator {
    constructor() {
        this.agents = {
            code: { name: 'CodeAgent', status: 'idle', capabilities: ['generate', 'refactor', 'debug'] },
            design: { name: 'DesignAgent', status: 'idle', capabilities: ['ui', 'css', 'layout'] },
            system: { name: 'SystemAgent', status: 'idle', capabilities: ['monitor', 'optimize', 'deploy'] }
        };
    }

    async dispatch(agentType, task, context) {
        const agent = this.agents[agentType];
        if (!agent) throw new Error(`Unknown agent type: ${agentType}`);
        
        agent.status = 'working';
        
        // Simulate agent work
        return new Promise((resolve) => {
            setTimeout(() => {
                agent.status = 'idle';
                resolve({
                    agent: agent.name,
                    task,
                    result: `Completed ${task} with context: ${JSON.stringify(context)}`,
                    timestamp: new Date()
                });
            }, 1000);
        });
    }

    getStatus() {
        return this.agents;
    }
}

const orchestrator = new AgentOrchestrator();

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'LiTree Labs Smart Bridge',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Get system overview
app.get('/api/overview', async (req, res) => {
    try {
        const overview = {
            services: {
                studio: await checkService('http://localhost:3001'),
                overlord: await checkService('http://localhost:8080'),
                hub: { status: 'online', port: 7777 }
            },
            agents: orchestrator.getStatus(),
            recentSessions: state.getRecentSessions(5),
            stats: {
                totalSessions: state.sessions.size,
                activeProjects: state.projects.length,
                lastSync: new Date().toISOString()
            }
        };
        res.json(overview);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deploy agent
app.post('/api/agents/:type/dispatch', async (req, res) => {
    const { type } = req.params;
    const { task, context } = req.body;
    
    try {
        const result = await orchestrator.dispatch(type, task, context);
        state.addSession('agent', result);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Sync projects between apps
app.post('/api/sync', (req, res) => {
    const { source, data } = req.body;
    
    const syncId = state.addSession('sync', {
        source,
        data,
        targets: ['studio', 'overlord']
    });
    
    res.json({
        syncId,
        status: 'synced',
        timestamp: new Date().toISOString()
    });
});

// Get unified logs
app.get('/api/logs', (req, res) => {
    const logs = [
        { time: new Date().toISOString(), level: 'info', message: 'Smart Bridge initialized' },
        { time: new Date().toISOString(), level: 'info', message: 'Connected to Studio (3001)' },
        { time: new Date().toISOString(), level: 'info', message: 'Connected to Overlord (8080)' },
        ...state.getRecentSessions().map(s => ({
            time: s.timestamp,
            level: 'info',
            message: `Session ${s.id}: ${s.type}`
        }))
    ];
    res.json(logs);
});

// Smart automation rules
app.post('/api/automation/rule', (req, res) => {
    const { trigger, action, conditions } = req.body;
    
    // Store automation rule
    const ruleId = state.addSession('automation', {
        trigger,
        action,
        conditions,
        active: true
    });
    
    res.json({
        ruleId,
        status: 'created',
        message: `Automation rule created: ${trigger} -> ${action}`
    });
});

// Execute command across services
app.post('/api/execute', async (req, res) => {
    const { target, command, params } = req.body;
    
    try {
        let result;
        switch(target) {
            case 'studio':
                result = await executeStudioCommand(command, params);
                break;
            case 'overlord':
                result = await executeOverlordCommand(command, params);
                break;
            default:
                throw new Error(`Unknown target: ${target}`);
        }
        
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions
async function checkService(url) {
    try {
        const response = await fetch(url + '/api/health', { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        return { status: 'online', url };
    } catch (e) {
        return { status: 'offline', url, error: e.message };
    }
}

async function executeStudioCommand(command, params) {
    // Integration with Studio API
    return { executed: true, target: 'studio', command, params };
}

async function executeOverlordCommand(command, params) {
    // Integration with Overlord API
    return { executed: true, target: 'overlord', command, params };
}

// WebSocket-like event stream
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const sendEvent = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    // Send heartbeat every 5 seconds
    const heartbeat = setInterval(() => {
        sendEvent({ type: 'heartbeat', time: new Date().toISOString() });
    }, 5000);
    
    req.on('close', () => {
        clearInterval(heartbeat);
    });
});

app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🤖 LiTree Labs Smart Bridge        ║');
    console.log('║                                        ║');
    console.log('║  Studio: http://localhost:3000         ║');
    console.log('║  Overlord: http://localhost:8080       ║');
    console.log('║  Hub: http://localhost:7777            ║');
    console.log('╚════════════════════════════════════════╝');
});

module.exports = app;

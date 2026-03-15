/**
 * LiTree Labs Widget for Overlord Dashboard
 * Displays ecosystem status and quick actions
 */

class LiTreeWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.apiBase = '/api/litree';
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.render();
        this.startRefresh();
    }

    render() {
        this.container.innerHTML = `
            <div class="litree-widget">
                <div class="litree-header">
                    <span class="litree-logo">🌳</span>
                    <span>LiTree Labs</span>
                    <span class="litree-status" id="litree-status">●</span>
                </div>
                <div class="litree-content">
                    <div class="litree-services">
                        <div class="service-item" id="studio-status">
                            <span class="service-dot"></span>
                            <span>Studio</span>
                            <span class="service-port">:3000</span>
                        </div>
                        <div class="service-item" id="overlord-status">
                            <span class="service-dot online"></span>
                            <span>Overlord</span>
                            <span class="service-port">:8080</span>
                        </div>
                        <div class="service-item" id="hub-status">
                            <span class="service-dot"></span>
                            <span>Hub</span>
                            <span class="service-port">:7777</span>
                        </div>
                    </div>
                    <div class="litree-agents" id="litree-agents">
                        <div class="agent-skeleton">Loading agents...</div>
                    </div>
                </div>
                <div class="litree-actions">
                    <button onclick="litreeWidget.openStudio()">Studio</button>
                    <button onclick="litreeWidget.sync()">Sync</button>
                </div>
            </div>
        `;

        // Add styles
        if (!document.getElementById('litree-widget-styles')) {
            const styles = document.createElement('style');
            styles.id = 'litree-widget-styles';
            styles.textContent = `
                .litree-widget {
                    background: rgba(20, 20, 30, 0.8);
                    border: 1px solid rgba(0, 240, 255, 0.2);
                    border-radius: 16px;
                    padding: 20px;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }
                .litree-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                }
                .litree-logo {
                    font-size: 1.3rem;
                }
                .litree-status {
                    margin-left: auto;
                    color: #00ff88;
                    animation: pulse 2s infinite;
                }
                .litree-services {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 15px;
                }
                .service-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 0.9rem;
                }
                .service-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #ffaa00;
                }
                .service-dot.online {
                    background: #00ff88;
                    box-shadow: 0 0 10px #00ff88;
                }
                .service-port {
                    margin-left: auto;
                    color: #8b8b9e;
                    font-size: 0.8rem;
                    font-family: 'JetBrains Mono', monospace;
                }
                .litree-agents {
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 10px;
                    margin-bottom: 15px;
                }
                .agent-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.85rem;
                    padding: 4px 0;
                }
                .agent-status {
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 10px;
                    background: rgba(0, 240, 255, 0.1);
                    color: #00f0ff;
                }
                .agent-status.working {
                    background: rgba(255, 0, 229, 0.1);
                    color: #ff00e5;
                    animation: pulse 1s infinite;
                }
                .litree-actions {
                    display: flex;
                    gap: 10px;
                }
                .litree-actions button {
                    flex: 1;
                    padding: 8px 16px;
                    border: 1px solid rgba(0, 240, 255, 0.3);
                    background: rgba(0, 240, 255, 0.1);
                    color: #00f0ff;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.3s;
                }
                .litree-actions button:hover {
                    background: rgba(0, 240, 255, 0.2);
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
            document.head.appendChild(styles);
        }
    }

    async refresh() {
        try {
            const response = await fetch(`${this.apiBase}/status`);
            const data = await response.json();
            this.updateUI(data);
        } catch (e) {
            console.log('LiTree Hub offline');
            this.setOffline();
        }
    }

    updateUI(data) {
        // Update service indicators
        const studioDot = document.querySelector('#studio-status .service-dot');
        const hubDot = document.querySelector('#hub-status .service-dot');
        
        if (data.services?.studio?.status === 'online') {
            studioDot.classList.add('online');
        } else {
            studioDot.classList.remove('online');
        }
        
        if (data.hub === 'online') {
            hubDot.classList.add('online');
        } else {
            hubDot.classList.remove('online');
        }

        // Update agents
        const agentsContainer = document.getElementById('litree-agents');
        if (data.agents) {
            agentsContainer.innerHTML = Object.entries(data.agents)
                .map(([key, agent]) => `
                    <div class="agent-item">
                        <span>${agent.name}</span>
                        <span class="agent-status ${agent.status}">${agent.status}</span>
                    </div>
                `).join('');
        }
    }

    setOffline() {
        document.querySelectorAll('.service-dot').forEach(dot => {
            dot.classList.remove('online');
        });
        document.getElementById('litree-agents').innerHTML = 
            '<div class="agent-skeleton">Hub offline</div>';
    }

    startRefresh() {
        this.refresh();
        this.refreshInterval = setInterval(() => this.refresh(), 5000);
    }

    stopRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    openStudio() {
        window.open('http://localhost:3000', '_blank');
    }

    async sync() {
        try {
            const response = await fetch(`${this.apiBase}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp: new Date().toISOString() })
            });
            const data = await response.json();
            alert(`Sync complete: ${data.syncId || 'error'}`);
        } catch (e) {
            alert('Sync failed: Hub not running');
        }
    }
}

// Auto-initialize if container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('litree-widget-container')) {
        window.litreeWidget = new LiTreeWidget('litree-widget-container');
    }
});

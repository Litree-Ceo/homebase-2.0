/**
 * Real-Debrid Controller for Overlord PC Dashboard
 * Handles Torrent Management, Link Unrestricting, and Streaming UI
 */

const RD_CONTROLLER = {
    torrents: [],
    refreshInterval: null,
    isConfigured: false,

    /**
     * Initialize the RD module
     */
    async init() {
        console.log("Initializing Real-Debrid Panel...");
        await this.checkConfig();
        if (this.isConfigured) {
            this.loadTorrents();
            this.startAutoRefresh();
        }
    },

    /**
     * Check if Real-Debrid API is configured in backend
     * Smart: Only shows warning once per session, stores config state
     */
    async checkConfig() {
        try {
            const res = await fetch('/api/stream/config', { headers: typeof makeHeaders === 'function' ? makeHeaders() : {} });
            const data = await res.json();
            const statusDiv = document.getElementById('stream-status');
            
            // Store config state to avoid repeated checks
            this.isConfigured = data.api_configured;
            localStorage.setItem('rd_configured', data.api_configured ? 'true' : 'false');
            
            if (statusDiv) {
                if (data.api_configured) {
                    statusDiv.innerHTML = '<div class="opt-card good"><div class="opt-icon">✓</div><div class="opt-text"><strong>Real-Debrid Active</strong> — Ready to stream</div></div>';
                    // Hide any previous warnings
                    statusDiv.classList.remove('persistent-warning');
                } else {
                    // Only show warning if not previously dismissed this session
                    const warningDismissed = sessionStorage.getItem('rd_warning_dismissed');
                    if (!warningDismissed) {
                        statusDiv.innerHTML = `
                            <div class="opt-card warning">
                                <div class="opt-icon">⚠</div>
                                <div class="opt-text">
                                    <strong>Real-Debrid Not Configured</strong><br>
                                    Set RD_API_KEY in .env file to enable streaming
                                    <button onclick="RD_CONTROLLER.dismissWarning()" style="margin-left:10px;padding:2px 8px;font-size:0.8em;">Dismiss</button>
                                </div>
                            </div>`;
                    } else {
                        statusDiv.innerHTML = '<div class="opt-card"><div class="opt-icon">ℹ</div><div class="opt-text">Streaming module ready (configure RD_API_KEY to enable)</div></div>';
                    }
                }
            }
        } catch (e) {
            console.error('[RD] Config check failed:', e);
            // Don't spam errors - only log once
            if (!this._configErrorLogged) {
                console.info('[RD] Will retry config check on next refresh');
                this._configErrorLogged = true;
            }
        }
    },

    /**
     * Dismiss the warning for this session
     */
    dismissWarning() {
        sessionStorage.setItem('rd_warning_dismissed', 'true');
        this.checkConfig();
    },

    /**
     * Fetch active torrents from RD
     */
    async loadTorrents() {
        try {
            const res = await fetch('/api/stream/torrents', { headers: typeof makeHeaders === 'function' ? makeHeaders() : {} });
            const data = await res.json();
            
            const container = document.getElementById('torrents-container');
            if (!container) return;

            if (data.error || !data.length) {
                container.innerHTML = '<span class="rd-empty-msg">No active streams. Add a magnet link below.</span>';
                return;
            }
            
            this.torrents = data;
            this.renderTorrents(container);
        } catch (e) {
            console.error('[RD] Failed to load torrents:', e);
        }
    },

    /**
     * Render the torrent list with progress bars
     */
    renderTorrents(container) {
        container.innerHTML = this.torrents.map(t => `
            <div class="rd-item" id="torrent-${t.id}">
                <div class="rd-header">
                    <div class="rd-filename" title="${t.filename}">${t.filename || 'Unnamed Torrent'}</div>
                    <div class="rd-progress-text">${Math.round(t.progress || 0)}%</div>
                </div>
                
                <div class="rd-progress-track">
                    <div class="rd-progress-fill" style="width:${t.progress || 0}%"></div>
                </div>

                <div class="rd-footer">
                    <span class="rd-status">${t.status} • ${(t.bytes / (1024**3)).toFixed(2)} GB</span>
                    ${t.status === 'downloaded' ? `<button class="rd-stream-btn" onclick="RD_CONTROLLER.unrestrictAndStream('${t.links[0]}')">▶ STREAM</button>` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Add a magnet link to the queue
     */
    async addMagnet(magnet) {
        if (!magnet || !magnet.startsWith('magnet:')) {
            alert('Invalid magnet link');
            return;
        }
        
        try {
            const res = await fetch('/api/stream/addMagnet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(typeof makeHeaders === 'function' ? makeHeaders() : {})
                },
                body: JSON.stringify({ magnet })
            });
            
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            
            alert('✓ Magnet added successfully');
            this.loadTorrents();
        } catch (e) {
            alert('Failed to add magnet: ' + e.message);
        }
    },

    /**
     * Unrestrict a link and attempt to open in native player
     */
    async unrestrictAndStream(link) {
        try {
            const res = await fetch('/api/stream/unrestrict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(typeof makeHeaders === 'function' ? makeHeaders() : {})
                },
                body: JSON.stringify({ link })
            });
            
            const data = await res.json();
            if (data.download) {
                window.open(data.download, '_blank');
            } else {
                alert('Could not unrestrict link: ' + (data.error || 'Unknown error'));
            }
        } catch (e) {
            alert('Unrestrict failed: ' + e.message);
        }
    },

    /**
     * Refresh loop
     */
    startAutoRefresh() {
        if (this.refreshInterval) clearInterval(this.refreshInterval);
        this.refreshInterval = setInterval(() => this.loadTorrents(), 10000);
    },

    stopAutoRefresh() {
        clearInterval(this.refreshInterval);
    }
};

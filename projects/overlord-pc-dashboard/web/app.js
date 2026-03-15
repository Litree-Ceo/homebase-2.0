/**
 * Overlord PC Dashboard - Main Application Logic
 * Cyberpunk-themed real-time system monitoring dashboard
 */

// ============================================
// Configuration & State
// ============================================

const CONFIG = {
    apiKey: null,
    autoRefresh: true,
    refreshInterval: 5000,
    refreshTimer: null,
    apiEndpoint: '/api',
};

// ============================================
// Utility Functions
// ============================================

/**
 * Format seconds into a readable time string
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    if (seconds === null || seconds === undefined || isNaN(seconds)) {
        return '--';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    } else {
        return `${secs}s`;
    }
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
    if (bytes === null || bytes === undefined || isNaN(bytes)) {
        return '--';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format percentage with color coding
 * @param {number} value - Percentage value (0-100)
 * @returns {string} Formatted percentage with color class
 */
function formatPercent(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '--';
    }

    let colorClass = 'good';
    if (value >= 80) {
        colorClass = 'critical';
    } else if (value >= 60) {
        colorClass = 'warning';
    }

    return `<span class="${colorClass}">${value.toFixed(1)}%</span>`;
}

/**
 * Make API request headers with authentication
 * @returns {Object} Headers object for fetch requests
 */
function makeHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (CONFIG.apiKey) {
        headers['X-API-Key'] = CONFIG.apiKey;
    }

    return headers;
}

/**
 * Get current timestamp formatted
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// ============================================
// API Key Management
// ============================================

/**
 * Submit API key from modal
 */
function submitApiKey() {
    const input = document.getElementById('modal-key-input');
    const key = input ? input.value.trim() : null;

    if (!key) {
        showNotification('Please enter an API key', 'error');
        return;
    }

    // Store API key
    CONFIG.apiKey = key;
    localStorage.setItem('overlord_api_key', key);

    // Hide modal
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('hidden');
    }

    // Show reset key button
    const keyBtn = document.getElementById('key-btn');
    if (keyBtn) {
        keyBtn.classList.remove('hidden');
    }

    // Initial stats fetch
    refreshStats();
    showNotification('Connected successfully', 'success');
}

/**
 * Clear stored API key
 */
function clearApiKey() {
    CONFIG.apiKey = null;
    localStorage.removeItem('overlord_api_key');

    // Show auth modal
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }

    // Hide reset key button
    const keyBtn = document.getElementById('key-btn');
    if (keyBtn) {
        keyBtn.classList.add('hidden');
    }

    // Clear input
    const input = document.getElementById('modal-key-input');
    if (input) {
        input.value = '';
    }

    showNotification('API key cleared', 'info');
}

/**
 * Check for stored API key on load
 */
function checkStoredApiKey() {
    const storedKey = localStorage.getItem('overlord_api_key');

    if (storedKey) {
        CONFIG.apiKey = storedKey;

        // Hide modal
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.classList.add('hidden');
        }

        // Show reset key button
        const keyBtn = document.getElementById('key-btn');
        if (keyBtn) {
            keyBtn.classList.remove('hidden');
        }

        return true;
    }

    return false;
}

// ============================================
// Stats Fetching & Display
// ============================================

/**
 * Fetch and display system stats
 */
async function refreshStats() {
    try {
        const response = await fetch(`${CONFIG.apiEndpoint}/stats`, {
            headers: makeHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401) {
                showNotification('Invalid API key', 'error');
                clearApiKey();
                return;
            }
            throw new Error(`HTTP ${response.status}`);
        }

        const stats = await response.json();
        updateDashboard(stats);
        updateWidget(stats);

        // Update last update timestamp
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) {
            lastUpdate.textContent = `Last update: ${getTimestamp()}`;
        }

    } catch (error) {
        console.error('Failed to fetch stats:', error);
        showNotification('Failed to fetch stats', 'error');
    }
}

/**
 * Update dashboard UI with stats
 * @param {Object} stats - System statistics
 */
function updateDashboard(stats) {
    // CPU
    const cpuElem = document.getElementById('cpu-percent');
    if (cpuElem && stats.cpu) {
        cpuElem.innerHTML = formatPercent(stats.cpu.percent);
    }

    // CPU Cores
    const cpuCoresElem = document.getElementById('cpu-cores');
    if (cpuCoresElem && stats.cpu && stats.cpu.cores) {
        cpuCoresElem.textContent = `${stats.cpu.cores} cores`;
    }

    // RAM
    const ramElem = document.getElementById('ram-percent');
    if (ramElem && stats.memory) {
        ramElem.innerHTML = formatPercent(stats.memory.percent);
    }

    const ramUsedElem = document.getElementById('ram-used');
    if (ramUsedElem && stats.memory) {
        ramUsedElem.textContent = `${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.total)}`;
    }

    // Disk
    const diskElem = document.getElementById('disk-percent');
    if (diskElem && stats.disk) {
        diskElem.innerHTML = formatPercent(stats.disk.percent);
    }

    const diskUsedElem = document.getElementById('disk-used');
    if (diskUsedElem && stats.disk) {
        diskUsedElem.textContent = `${formatBytes(stats.disk.used)} / ${formatBytes(stats.disk.total)}`;
    }

    // GPU
    const gpuElem = document.getElementById('gpu-percent');
    if (gpuElem && stats.gpu) {
        if (stats.gpu.available) {
            gpuElem.innerHTML = formatPercent(stats.gpu.utilization);
        } else {
            gpuElem.innerHTML = '<span class="muted">N/A</span>';
        }
    }

    // GPU Memory
    const gpuMemElem = document.getElementById('gpu-mem');
    if (gpuMemElem && stats.gpu) {
        if (stats.gpu.available) {
            gpuMemElem.textContent = `${formatBytes(stats.gpu.memory_used * 1024 * 1024)} / ${formatBytes(stats.gpu.memory_total * 1024 * 1024)}`;
        } else {
            gpuMemElem.textContent = '--';
        }
    }

    // Temperatures
    const tempElem = document.getElementById('cpu-temp');
    if (tempElem && stats.temperatures) {
        const cpuTemp = stats.temperatures.cpu || stats.temperatures.main || null;
        if (cpuTemp) {
            tempElem.innerHTML = formatPercent(cpuTemp);
        } else {
            tempElem.innerHTML = '<span class="muted">N/A</span>';
        }
    }

    // Network
    const netUpElem = document.getElementById('net-up');
    const netDownElem = document.getElementById('net-down');
    if (stats.network) {
        if (netUpElem) {
            netUpElem.textContent = `${formatBytes(stats.network.bytes_sent)}/s`;
        }
        if (netDownElem) {
            netDownElem.textContent = `${formatBytes(stats.network.bytes_recv)}/s`;
        }
    }

    // Uptime
    const uptimeElem = document.getElementById('uptime');
    if (uptimeElem && stats.uptime) {
        uptimeElem.textContent = formatTime(stats.uptime);
    }

    // Processes
    updateProcesses(stats.processes || []);
}

/**
 * Update processes list
 * @param {Array} processes - List of top processes
 */
function updateProcesses(processes) {
    const container = document.getElementById('processes-list');
    if (!container) return;

    if (!processes || processes.length === 0) {
        container.innerHTML = '<span class="loading-text">No processes data available</span>';
        return;
    }

    container.innerHTML = processes.slice(0, 10).map(proc => `
        <div class="process-item">
            <span class="process-name">${escapeHtml(proc.name || 'Unknown')}</span>
            <span class="process-cpu">${proc.cpu_percent ? proc.cpu_percent.toFixed(1) : 0}%</span>
            <span class="process-mem">${proc.memory_percent ? proc.memory_percent.toFixed(1) : 0}%</span>
        </div>
    `).join('');
}

/**
 * Update system widget
 * @param {Object} stats - System statistics
 */
function updateWidget(stats) {
    const indicator = document.getElementById('widget-indicator');
    const label = document.getElementById('widget-label');
    const cpuValue = document.getElementById('widget-cpu');

    if (indicator && label) {
        const cpuPercent = stats.cpu ? stats.cpu.percent : 0;

        if (cpuPercent < 60) {
            indicator.className = 'system-widget__indicator good';
            label.textContent = 'OPTIMAL';
        } else if (cpuPercent < 80) {
            indicator.className = 'system-widget__indicator warning';
            label.textContent = 'LOADED';
        } else {
            indicator.className = 'system-widget__indicator critical';
            label.textContent = 'HEAVY';
        }
    }

    if (cpuValue && stats.cpu) {
        cpuValue.textContent = `${stats.cpu.percent.toFixed(1)}%`;
    }
}

// ============================================
// Auto-Refresh Management
// ============================================

/**
 * Toggle auto-refresh on/off
 */
function toggleAutoRefresh() {
    CONFIG.autoRefresh = !CONFIG.autoRefresh;

    const btn = document.getElementById('auto-btn');
    if (btn) {
        const icon = btn.querySelector('.btn-icon');
        const text = btn.querySelector('span:last-child');

        if (CONFIG.autoRefresh) {
            if (icon) icon.textContent = '⏸';
            if (text) text.textContent = 'Pause';
            startAutoRefresh();
            showNotification('Auto-refresh enabled', 'success');
        } else {
            if (icon) icon.textContent = '▶';
            if (text) text.textContent = 'Resume';
            stopAutoRefresh();
            showNotification('Auto-refresh paused', 'info');
        }
    }
}

/**
 * Start auto-refresh timer
 */
function startAutoRefresh() {
    if (CONFIG.refreshTimer) {
        clearInterval(CONFIG.refreshTimer);
    }

    CONFIG.refreshTimer = setInterval(() => {
        if (CONFIG.autoRefresh) {
            refreshStats();
        }
    }, CONFIG.refreshInterval);
}

/**
 * Stop auto-refresh timer
 */
function stopAutoRefresh() {
    if (CONFIG.refreshTimer) {
        clearInterval(CONFIG.refreshTimer);
        CONFIG.refreshTimer = null;
    }
}

// ============================================
// Copy Stats Functionality
// ============================================

/**
 * Copy current stats to clipboard
 * @param {HTMLElement} btn - Button element (for visual feedback)
 */
async function copyStats(btn) {
    try {
        const response = await fetch(`${CONFIG.apiEndpoint}/stats`, {
            headers: makeHeaders(),
        });

        if (!response.ok) throw new Error('Failed to fetch stats');

        const stats = await response.json();

        const text = `Overlord Dashboard Stats
========================
CPU: ${stats.cpu ? stats.cpu.percent.toFixed(1) : '--'}%
RAM: ${stats.memory ? stats.memory.percent.toFixed(1) : '--'}%
Disk: ${stats.disk ? stats.disk.percent.toFixed(1) : '--'}%
GPU: ${stats.gpu && stats.gpu.available ? stats.gpu.utilization + '%' : 'N/A'}
========================
Generated: ${getTimestamp()}`;

        await navigator.clipboard.writeText(text);

        // Visual feedback
        if (btn) {
            const originalText = btn.querySelector('span:last-child');
            if (originalText) originalText.textContent = 'Copied!';
            setTimeout(() => {
                if (originalText) originalText.textContent = 'Copy Stats';
            }, 2000);
        }

        showNotification('Stats copied to clipboard', 'success');
    } catch (error) {
        console.error('Failed to copy stats:', error);
        showNotification('Failed to copy stats', 'error');
    }
}

// ============================================
// System Widget Functions
// ============================================

/**
 * Toggle system widget expanded state
 */
function toggleSystemWidget() {
    const widget = document.getElementById('system-widget');
    const header = widget?.querySelector('.system-widget__header');
    const expandIcon = header?.querySelector('.system-widget__expand-icon');

    if (widget && header) {
        const isExpanded = widget.classList.toggle('expanded');
        header.setAttribute('aria-expanded', isExpanded);

        if (expandIcon) {
            expandIcon.style.transform = isExpanded ? 'rotate(90deg)' : '';
        }
    }
}

/**
 * Refresh widget data
 */
function refreshWidget() {
    refreshStats();

    const refreshIcon = document.getElementById('widget-refresh-icon');
    if (refreshIcon) {
        refreshIcon.style.transition = 'transform 0.3s';
        refreshIcon.style.transform = 'rotate(180deg';
        setTimeout(() => {
            refreshIcon.style.transform = '';
        }, 300);
    }
}

// ============================================
// Notification System
// ============================================

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type: 'success', 'error', 'info', 'warning'
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${getNotificationIcon(type)}</span>
        <span class="notification-message">${escapeHtml(message)}</span>
    `;

    // Add to container
    let container = document.getElementById('notifications');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notifications';
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    container.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {string} Icon character
 */
function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };
    return icons[type] || icons.info;
}

// ============================================
// Utility Functions
// ============================================

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Keyboard Shortcuts
// ============================================

/**
 * Handle keyboard shortcuts
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyboardShortcuts(event) {
    // Ignore if typing in input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (event.key.toLowerCase()) {
        case 'r':
            refreshStats();
            break;
        case 'p':
            toggleAutoRefresh();
            break;
        case 'c':
            copyStats();
            break;
        case 'h':
            window.location.href = '/api/health';
            break;
    }
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize dashboard on page load
 */
function initDashboard() {
    // Check for stored API key
    const hasKey = checkStoredApiKey();

    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // If we have an API key, start fetching stats
    if (hasKey) {
        refreshStats();
        startAutoRefresh();
    }

    // Initialize Real-Debrid controller if present
    if (typeof RD_CONTROLLER !== 'undefined') {
        RD_CONTROLLER.init();
    }

    console.log('Overlord Dashboard initialized');
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);

// Export for module usage
export {
    CONFIG,
    formatTime,
    formatBytes,
    formatPercent,
    submitApiKey,
    clearApiKey,
    refreshStats,
    toggleAutoRefresh,
    copyStats,
    toggleSystemWidget,
    refreshWidget,
    showNotification
};

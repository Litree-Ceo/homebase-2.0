su/**
 * Mock AI Assistant Module
 * Simulates AI chat responses for testing and demonstration
 */

class MockAIAssistant {
    constructor() {
        this.conversationHistory = [];
        this.isProcessing = false;
        
        // Predefined responses for different query types
        this.responseTemplates = {
            greeting: [
                "Hello! I'm your AI assistant. How can I help you today?",
                "Hi there! I'm here to assist you. What would you like to know?",
                "Greetings! How may I be of service to you?"
            ],
            help: [
                "I can help you with various tasks including system monitoring, file management, and general questions. Just ask!",
                "I'm here to assist! I can answer questions, provide information, and help with your PC dashboard tasks."
            ],
            status: [
                "All systems are running smoothly. CPU usage is normal, memory is within acceptable limits.",
                "System status: All services operational. No issues detected."
            ],
            default: [
                "I understand you mentioned that. Let me process that information for you.",
                "That's an interesting question. Here's what I can tell you...",
                "I've analyzed your request and here's my response:",
                "Thank you for your input. Based on my analysis:"
            ]
        };
        
        // Keyword mappings for response selection
        this.keywordMap = {
            greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening'],
            help: ['help', 'assist', 'support', 'what can you do', 'capabilities'],
            status: ['status', 'system', 'cpu', 'memory', 'running', 'performance', 'monitor']
        };
    }

    /**
     * Process user input and generate a response
     * @param {string} userInput - The user's message
     * @returns {Promise<string>} - The AI's response
     */
    async processMessage(userInput) {
        if (this.isProcessing) {
            return "I'm currently processing another request. Please wait.";
        }

        this.isProcessing = true;
        
        // Add user message to history
        this.conversationHistory.push({
            role: 'user',
            content: userInput,
            timestamp: new Date().toISOString()
        });

        // Simulate processing delay (100-1500ms)
        const delay = Math.floor(Math.random() * 1400) + 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Generate response based on keywords
        const response = this.generateResponse(userInput.toLowerCase());

        // Add AI response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });

        this.isProcessing = false;
        return response;
    }

    /**
     * Generate a response based on user input keywords
     * @param {string} input - Processed user input
     * @returns {string} - Selected response
     */
    generateResponse(input) {
        // Check for keyword matches
        for (const [category, keywords] of Object.entries(this.keywordMap)) {
            if (keywords.some(keyword => input.includes(keyword))) {
                const templates = this.responseTemplates[category];
                return templates[Math.floor(Math.random() * templates.length)];
            }
        }
        
        // Return random default response for unmatched inputs
        const defaults = this.responseTemplates.default;
        return defaults[Math.floor(Math.random() * defaults.length)];
    }

    /**
     * Get conversation history
     * @returns {Array} - Array of conversation messages
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    }

    /**
     * Simulate typing indicator
     * @param {number} duration - Duration in milliseconds
     * @returns {Promise<void>}
     */
    async simulateTyping(duration = 1000) {
        return new Promise(resolve => setTimeout(resolve, duration));
    }

    /**
     * Process command (for system operations)
     * @param {string} command - System command
     * @returns {Promise<string>} - Command result
     */
    async processCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        const commands = {
            'system status': () => "System Status: All services operational. CPU: 45%, Memory: 62%, Storage: 78%",
            'list services': () => "Active Services:\n- Web Server: Running\n- Database: Connected\n- Docker: Active\n- Monitoring: Enabled",
            'get logs': () => "Recent logs:\n[INFO] Server started at " + new Date().toISOString() + "\n[INFO] All systems nominal",
            'check updates': () => "No updates available. System is up to date.",
            'disk usage': () => "Disk Usage:\nC: 78% used (234GB/300GB)\nD: 45% used (450GB/1TB)"
        };

        for (const [key, handler] of Object.entries(commands)) {
            if (cmd.includes(key)) {
                return handler();
            }
        }

        return `Command "${command}" not recognized. Try "system status", "list services", or "get logs"`;
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockAIAssistant;
} else if (typeof window !== 'undefined') {
    window.MockAIAssistant = MockAIAssistant;
}

// Export default instance
const mockAI = new MockAIAssistant();
export default mockAI;

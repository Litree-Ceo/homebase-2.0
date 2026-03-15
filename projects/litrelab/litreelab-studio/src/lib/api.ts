/**
 * LiTreLab API Client
 * Handles authenticated requests to the FastAPI backend
 */

export const API_BASE_URL = import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:8000';

export class ApiClient {
    private static getToken(): string | null {
        return localStorage.getItem('litreelab_token');
    }

    private static setToken(token: string) {
        localStorage.setItem('litreelab_token', token);
    }

    private static getHeaders(authRequired = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authRequired) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    /**
     * Authenticate and store token
     */
    static async login(username: string, password: string): Promise<boolean> {
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                this.setToken(data.access_token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    static logout() {
        localStorage.removeItem('litreelab_token');
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }

    /**
     * Chat with the AI Agent
     */
    static async chat(message: string, model?: string): Promise<{ reply: string, model_used: string }> {
        const response = await fetch(`${API_BASE_URL}/api/agent/chat`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ message, model }),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to get chat response');
        }

        return await response.json();
    }

    /**
     * Get protected data examples
     */
    static async getFriends() {
        const response = await fetch(`${API_BASE_URL}/api/friends`, {
            headers: this.getHeaders(),
        });
        return await response.json();
    }

    /**
     * Get a deep AI explanation (Explain Loop)
     */
    static async explain(question: string, context?: string, style?: string): Promise<any> {
        // Note: The FastAPI backend needs the /api/explain endpoint from our previous work
        const response = await fetch(`${API_BASE_URL}/api/explain`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({ question, context, style }),
        });

        if (response.status === 401) {
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error('Failed to get explanation');
        }

        return await response.json();
    }

    static async getStatus() {
        const response = await fetch(`${API_BASE_URL}/status`);
        return await response.json();
    }
}

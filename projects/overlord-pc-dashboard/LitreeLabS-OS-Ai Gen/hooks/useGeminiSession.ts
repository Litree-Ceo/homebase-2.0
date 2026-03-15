/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Custom hook for managing Gemini AI sessions
 */

import { useState, useCallback } from 'react';
import { Artifact, Session } from '../types';
import { generateId } from '../utils';

const API_BASE_URL = 'http://localhost:3001/api';

interface UseGeminiSessionReturn {
    sessions: Session[];
    currentSessionIndex: number;
    isLoading: boolean;
    error: string | null;
    createSession: (prompt: string) => Promise<Session | null>;
    generateArtifact: (
        sessionId: string, 
        artifactId: string, 
        prompt: string, 
        styleInstruction: string,
        onProgress: (html: string) => void
    ) => Promise<void>;
    setCurrentSessionIndex: (index: number) => void;
    clearError: () => void;
}

export const useGeminiSession = (): UseGeminiSessionReturn => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const createSession = useCallback(async (prompt: string): Promise<Session | null> => {
        const trimmedInput = prompt.trim();
        if (!trimmedInput) return null;

        setIsLoading(true);
        setError(null);

        try {
            // Generate styles from backend
            const stylesResponse = await fetch(`${API_BASE_URL}/generate-styles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: trimmedInput }),
            });

            if (!stylesResponse.ok) {
                throw new Error('Failed to generate styles');
            }

            const { styles } = await stylesResponse.json();

            // Create session with placeholder artifacts
            const sessionId = generateId();
            const baseTime = Date.now();

            const placeholderArtifacts: Artifact[] = styles.map((styleName: string, i: number) => ({
                id: `${sessionId}_${i}`,
                styleName: styleName || `Style ${i + 1}`,
                html: '',
                status: 'streaming' as const,
            }));

            const newSession: Session = {
                id: sessionId,
                prompt: trimmedInput,
                timestamp: baseTime,
                artifacts: placeholderArtifacts,
            };

            setSessions(prev => [...prev, newSession]);
            setCurrentSessionIndex(sessions.length);

            return newSession;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            console.error('Create session error:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [sessions.length]);

    const generateArtifact = useCallback(async (
        sessionId: string,
        artifactId: string,
        prompt: string,
        styleInstruction: string,
        onProgress: (html: string) => void
    ): Promise<void> => {
        try {
            // Simulate streaming by calling the API
            const response = await fetch(`${API_BASE_URL}/generate-artifact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, styleInstruction }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate artifact');
            }

            const { html } = await response.json();

            // Simulate streaming effect
            const chunkSize = 50;
            let displayedHtml = '';
            
            for (let i = 0; i < html.length; i += chunkSize) {
                displayedHtml += html.slice(i, i + chunkSize);
                onProgress(displayedHtml);
                // Small delay for visual effect
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            // Update final status
            setSessions(prev => prev.map(sess => 
                sess.id === sessionId ? {
                    ...sess,
                    artifacts: sess.artifacts.map(art => 
                        art.id === artifactId ? { ...art, html, status: 'complete' as const } : art
                    )
                } : sess
            ));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate artifact';
            setError(errorMessage);
            
            // Mark artifact as errored
            setSessions(prev => prev.map(sess => 
                sess.id === sessionId ? {
                    ...sess,
                    artifacts: sess.artifacts.map(art => 
                        art.id === artifactId ? { ...art, status: 'error' as const } : art
                    )
                } : sess
            ));
            
            console.error('Generate artifact error:', err);
        }
    }, []);

    return {
        sessions,
        currentSessionIndex,
        isLoading,
        error,
        createSession,
        generateArtifact,
        setCurrentSessionIndex,
        clearError,
    };
};

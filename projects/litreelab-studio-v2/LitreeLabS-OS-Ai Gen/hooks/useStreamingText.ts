/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Custom hook for streaming text animation effect
 */

import { useState, useCallback, useRef } from 'react';

interface UseStreamingTextReturn {
    displayedText: string;
    isStreaming: boolean;
    streamText: (text: string, speed?: number) => Promise<void>;
    stopStreaming: () => void;
    reset: () => void;
}

export const useStreamingText = (): UseStreamingTextReturn => {
    const [displayedText, setDisplayedText] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const stopStreaming = useCallback(() => {
        abortRef.current = true;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsStreaming(false);
    }, []);

    const reset = useCallback(() => {
        stopStreaming();
        setDisplayedText('');
    }, [stopStreaming]);

    const streamText = useCallback(async (text: string, speed: number = 10): Promise<void> => {
        abortRef.current = false;
        setIsStreaming(true);
        setDisplayedText('');

        const chars = text.split('');
        let currentIndex = 0;

        return new Promise((resolve) => {
            const streamNext = () => {
                if (abortRef.current) {
                    setIsStreaming(false);
                    resolve();
                    return;
                }

                if (currentIndex >= chars.length) {
                    setIsStreaming(false);
                    resolve();
                    return;
                }

                // Add multiple characters at once for faster streaming
                const chunkSize = Math.max(1, Math.floor(chars.length / 100));
                const endIndex = Math.min(currentIndex + chunkSize, chars.length);
                const chunk = chars.slice(currentIndex, endIndex).join('');
                
                setDisplayedText(prev => prev + chunk);
                currentIndex = endIndex;

                timeoutRef.current = setTimeout(streamNext, speed);
            };

            streamNext();
        });
    }, []);

    return {
        displayedText,
        isStreaming,
        streamText,
        stopStreaming,
        reset,
    };
};

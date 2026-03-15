/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Custom hook for cycling through placeholder text
 */

import { useState, useEffect } from 'react';
import { INITIAL_PLACEHOLDERS } from '../constants';

interface UsePlaceholdersReturn {
    currentPlaceholder: string;
    placeholderIndex: number;
}

export const usePlaceholders = (
    placeholders: string[] = INITIAL_PLACEHOLDERS,
    intervalMs: number = 3000
): UsePlaceholdersReturn => {
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(prev => (prev + 1) % placeholders.length);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [placeholders.length, intervalMs]);

    return {
        currentPlaceholder: placeholders[placeholderIndex],
        placeholderIndex,
    };
};

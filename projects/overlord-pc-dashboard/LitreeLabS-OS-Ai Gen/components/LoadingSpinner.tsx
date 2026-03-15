/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Animated loading spinner component
 */

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'small' | 'medium' | 'large';
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'medium',
    text = 'Generating...'
}) => {
    const sizeClasses = {
        small: 'spinner-small',
        medium: 'spinner-medium',
        large: 'spinner-large',
    };

    return (
        <div className="loading-spinner-container">
            <motion.div
                className={`loading-spinner ${sizeClasses[size]}`}
                animate={{ rotate: 360 }}
                transition={{ 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: 'linear' 
                }}
            >
                <svg viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="80"
                        strokeDashoffset="60"
                    />
                </svg>
            </motion.div>
            {text && (
                <motion.span 
                    className="loading-text"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {text}
                </motion.span>
            )}
        </div>
    );
};

export default LoadingSpinner;

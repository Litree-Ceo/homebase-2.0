/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Error notification component
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorToastProps {
    message: string | null;
    onDismiss: () => void;
    duration?: number;
}

export const ErrorToast: React.FC<ErrorToastProps> = ({ 
    message, 
    onDismiss, 
    duration = 5000 
}) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onDismiss]);

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -50, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -50, x: '-50%' }}
                    className="error-toast"
                    role="alert"
                    aria-live="assertive"
                >
                    <div className="error-icon">⚠️</div>
                    <div className="error-message">{message}</div>
                    <button 
                        className="error-dismiss" 
                        onClick={onDismiss}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ErrorToast;

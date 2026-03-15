/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Streaming code display component with syntax highlighting animation
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStreamingText } from '../hooks';

interface StreamingCodeBlockProps {
    code: string;
    isStreaming?: boolean;
    className?: string;
}

export const StreamingCodeBlock: React.FC<StreamingCodeBlockProps> = ({ 
    code, 
    isStreaming = false,
    className = ''
}) => {
    const { displayedText, streamText, reset } = useStreamingText();

    useEffect(() => {
        if (isStreaming && code) {
            streamText(code, 5);
        } else {
            reset();
        }
        
        return () => reset();
    }, [code, isStreaming]);

    // If not streaming, show full code
    const displayContent = isStreaming ? displayedText : code;

    // Simple syntax highlighting
    const highlightedCode = displayContent
        .replace(/(&lt;|<)(\/?)([\w-]+)/g, '<span class="code-tag">$1$2$3</span>')
        .replace(/([\w-]+)=/g, '<span class="code-attr">$1</span>=')
        .replace(/"([^"]*)"/g, '<span class="code-string">"$1"</span>')
        .replace(/(\{[^}]*\})/g, '<span class="code-brace">$1</span>');

    return (
        <motion.pre 
            className={`streaming-code-block ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <code 
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
                className="code-content"
            />
            {isStreaming && (
                <motion.span 
                    className="cursor"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                >
                    |
                </motion.span>
            )}
        </motion.pre>
    );
};

export default StreamingCodeBlock;

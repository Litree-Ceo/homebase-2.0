/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LiTreeLab Studio - Prompt-to-Metaverse Generation Engine
 * Refactored with custom hooks, secure API proxy, and enhanced UX
 */

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, Sphere, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

import { Artifact, Session } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';

// Custom hooks
import { useGeminiSession, usePlaceholders } from './hooks';

// Components
import { 
    ErrorToast, 
    StreamingCodeBlock, 
    LoadingSpinner,
    SideDrawer,
    DottedGlowBackground,
    ArtifactCard,
    ThinkingIcon, 
    CodeIcon, 
    SparklesIcon, 
    ArrowUpIcon, 
    GridIcon 
} from './components';

// --- Metaverse Components ---

function MetaverseScene() {
    return (
        <Canvas shadows>
            <Suspense fallback={null}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                
                <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                    <Sphere args={[1, 64, 64]}>
                        <MeshDistortMaterial
                            color="#3b82f6"
                            speed={3}
                            distort={0.4}
                            radius={1}
                        />
                    </Sphere>
                </Float>

                <gridHelper args={[20, 20, 0x333333, 0x111111]} position={[0, -2, 0]} />
            </Suspense>
        </Canvas>
    );
}

function ProfitPilotWidget() {
    const [price, setPrice] = useState(64250.42);
    useEffect(() => {
        const interval = setInterval(() => {
            setPrice(prev => prev + (Math.random() - 0.5) * 10);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="meta-widget profit-pilot">
            <div className="widget-header">
                <span className="live-dot"></span>
                PROFIT PILOT
            </div>
            <div className="price-display">
                <div className="label">BTC / USD</div>
                <div className="value">${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="change positive">+2.4%</div>
            </div>
            <div className="mini-chart">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                ))}
            </div>
        </div>
    );
}

function SocialFeedWidget() {
    const posts = [
        { id: 1, user: 'LiTreeAgent', text: 'Metaverse Hub V2.4 is live!', platform: 'twitter' },
        { id: 2, user: 'ProfitPilot', text: 'New trading signal detected...', platform: 'facebook' },
        { id: 3, user: 'StudioCreator', text: 'Just rendered a new bioluminescent node.', platform: 'instagram' },
    ];

    return (
        <div className="meta-widget social-feed">
            <div className="widget-header">SOCIAL FEED</div>
            <div className="feed-list">
                {posts.map(post => (
                    <div key={post.id} className="feed-item">
                        <div className="user">@{post.user}</div>
                        <div className="text">{post.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Editor View Component ---

interface EditorViewProps {
    currentSession: Session | null;
    focusedArtifactIndex: number | null;
    isLoading: boolean;
    inputValue: string;
    currentPlaceholder: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onArtifactClick: (index: number) => void;
    onShowCode: () => void;
    onShowGrid: () => void;
    onEnterPreview: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

const EditorView: React.FC<EditorViewProps> = ({
    currentSession,
    focusedArtifactIndex,
    isLoading,
    inputValue,
    currentPlaceholder,
    onInputChange,
    onSendMessage,
    onArtifactClick,
    onShowCode,
    onShowGrid,
    onEnterPreview,
    inputRef,
}) => (
    <motion.div 
        key="editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="editor-layer"
    >
        <div className="stage-container">
            {!currentSession && (
                <div className="empty-state">
                    <h1>LiTreeLab Studio</h1>
                    <p>Prompt-to-Metaverse Generation Engine</p>
                </div>
            )}
            {currentSession && (
                <div className="artifact-grid">
                    {currentSession.artifacts.map((artifact, aIndex) => (
                        <ArtifactCard 
                            key={artifact.id}
                            artifact={artifact}
                            isFocused={focusedArtifactIndex === aIndex}
                            onClick={() => onArtifactClick(aIndex)}
                        />
                    ))}
                </div>
            )}
        </div>

        <div className="floating-input-container">
            <div className={`input-wrapper ${isLoading ? 'loading' : ''}`}>
                <input 
                    ref={inputRef}
                    type="text" 
                    placeholder={currentPlaceholder}
                    value={inputValue} 
                    onChange={(e) => onInputChange(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && onSendMessage()} 
                    disabled={isLoading} 
                    aria-label="Enter your design prompt"
                />
                <button 
                    onClick={onSendMessage} 
                    disabled={isLoading || !inputValue.trim()} 
                    className="send-button"
                    aria-label={isLoading ? 'Generating...' : 'Send prompt'}
                >
                    {isLoading ? <ThinkingIcon /> : <ArrowUpIcon />}
                </button>
            </div>
        </div>

        {focusedArtifactIndex !== null && (
            <div className="action-bar visible">
                <button onClick={onShowGrid}><GridIcon /> Grid</button>
                <button onClick={onEnterPreview}><SparklesIcon /> Full Site</button>
                <button onClick={onShowCode}><CodeIcon /> Source</button>
            </div>
        )}
    </motion.div>
);

// --- Preview View Component ---

interface PreviewViewProps {
    currentSession: Session | null;
    onExitPreview: () => void;
}

const PreviewView: React.FC<PreviewViewProps> = ({ currentSession, onExitPreview }) => (
    <motion.div 
        key="preview"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        className="metaverse-dashboard"
    >
        <nav className="dashboard-nav">
            <div className="logo">LITREELAB</div>
            <div className="nav-links">
                <span className="active">HUB</span>
                <span>STUDIO</span>
                <span>PROFIT PILOT</span>
                <span>VAULT</span>
            </div>
            <div className="user-profile">
                <div className="status">LIVE</div>
                <button className="exit-btn" onClick={onExitPreview}>EXIT STUDIO</button>
            </div>
        </nav>

        <div className="dashboard-content">
            <div className="sidebar-widgets">
                <ProfitPilotWidget />
                <SocialFeedWidget />
                <div className="meta-widget status-card">
                    <div className="widget-header">SYSTEM LOAD</div>
                    <div className="load-meter"><div className="fill" style={{ width: '65%' }}></div></div>
                    <div className="load-text">GPU Nodes: 128 / 512</div>
                </div>
            </div>
            
            <div className="main-viewport">
                <div className="viewport-3d">
                    <MetaverseScene />
                    <div className="viewport-overlay">
                        <div className="coord">X: 124.5 Y: 92.1 Z: 0.0</div>
                    </div>
                </div>
                
                <div className="gen-widgets-preview">
                    {currentSession?.artifacts.map((art, i) => (
                        <div key={art.id} className={`gen-widget-slot slot-${i}`}>
                            <iframe srcDoc={art.html} title={`Slot ${i}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

// --- Main App ---

function App() {
    // Custom hooks
    const {
        sessions,
        currentSessionIndex,
        isLoading,
        error,
        createSession,
        generateArtifact,
        setCurrentSessionIndex,
        clearError,
    } = useGeminiSession();

    const { currentPlaceholder } = usePlaceholders(INITIAL_PLACEHOLDERS, 3000);

    // Local state
    const [inputValue, setInputValue] = useState<string>('');
    const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [streamingCode, setStreamingCode] = useState<string>('');
    const [isStreamingCode, setIsStreamingCode] = useState<boolean>(false);

    const [drawerState, setDrawerState] = useState<{
        isOpen: boolean;
        mode: 'code' | 'variations' | null;
        title: string;
        data: any;
    }>({ isOpen: false, mode: null, title: '', data: null });

    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle sending message
    const handleSendMessage = useCallback(async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        setInputValue('');
        setFocusedArtifactIndex(null);

        const newSession = await createSession(trimmedInput);
        
        if (newSession) {
            // Generate artifacts for each style
            newSession.artifacts.forEach(async (artifact) => {
                await generateArtifact(
                    newSession.id,
                    artifact.id,
                    trimmedInput,
                    artifact.styleName,
                    (html) => {
                        // Update streaming progress
                        setSessions?.((prev: Session[]) => prev.map((sess: Session) => 
                            sess.id === newSession.id ? {
                                ...sess,
                                artifacts: sess.artifacts.map((art: Artifact) => 
                                    art.id === artifact.id ? { ...art, html } : art
                                )
                            } : sess
                        ));
                    }
                );
            });
        }
    }, [inputValue, isLoading, createSession, generateArtifact]);

    // Override setSessions to be accessible in the callback
    const setSessions = useGeminiSession().sessions as unknown as React.Dispatch<React.SetStateAction<Session[]>>;

    // Handle showing code in drawer
    const handleShowCode = useCallback(() => {
        const focusedArtifact = currentSession?.artifacts[focusedArtifactIndex ?? -1];
        if (focusedArtifact?.html) {
            setIsStreamingCode(true);
            setStreamingCode('');
            setDrawerState({ 
                isOpen: true, 
                mode: 'code', 
                title: `Source Code - ${focusedArtifact.styleName}`,
                data: focusedArtifact.html 
            });
            
            // Simulate streaming effect
            const html = focusedArtifact.html;
            let index = 0;
            const stream = setInterval(() => {
                if (index >= html.length) {
                    clearInterval(stream);
                    setIsStreamingCode(false);
                    return;
                }
                setStreamingCode(html.slice(0, index + 50));
                index += 50;
            }, 10);
        }
    }, [currentSession, focusedArtifactIndex]);

    const currentSession = sessions[currentSessionIndex];
    const focusedArtifact = currentSession?.artifacts[focusedArtifactIndex ?? -1];

    return (
        <div className={`immersive-app ${isPreviewMode ? 'full-site-preview' : ''}`}>
            {!isPreviewMode && <DottedGlowBackground color="rgba(59, 130, 246, 0.05)" glowColor="rgba(59, 130, 246, 0.2)" />}

            {/* Error Toast */}
            <ErrorToast 
                message={error} 
                onDismiss={clearError}
                duration={6000}
            />

            <AnimatePresence mode="wait">
                {!isPreviewMode ? (
                    <EditorView
                        key="editor-view"
                        currentSession={currentSession}
                        focusedArtifactIndex={focusedArtifactIndex}
                        isLoading={isLoading}
                        inputValue={inputValue}
                        currentPlaceholder={currentPlaceholder}
                        onInputChange={setInputValue}
                        onSendMessage={handleSendMessage}
                        onArtifactClick={setFocusedArtifactIndex}
                        onShowCode={handleShowCode}
                        onShowGrid={() => setFocusedArtifactIndex(null)}
                        onEnterPreview={() => setIsPreviewMode(true)}
                        inputRef={inputRef}
                    />
                ) : (
                    <PreviewView
                        key="preview-view"
                        currentSession={currentSession}
                        onExitPreview={() => setIsPreviewMode(false)}
                    />
                )}
            </AnimatePresence>

            <SideDrawer 
                isOpen={drawerState.isOpen} 
                onClose={() => {
                    setDrawerState(s => ({...s, isOpen: false}));
                    setIsStreamingCode(false);
                }} 
                title={drawerState.title}
            >
                {drawerState.mode === 'code' && (
                    <StreamingCodeBlock 
                        code={drawerState.data || ''}
                        isStreaming={isStreamingCode}
                    />
                )}
            </SideDrawer>
        </div>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
}

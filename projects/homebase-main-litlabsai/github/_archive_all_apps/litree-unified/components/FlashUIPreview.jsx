'use client';
import { useState } from 'react';

// Pre-defined components for the builder
const COMPONENT_LIBRARY = [
  { id: 'card', name: 'Glass Card', type: 'card', icon: '🃏' },
  { id: 'btn-pri', name: 'Primary Button', type: 'button-primary', icon: '🟣' },
  { id: 'btn-sec', name: 'Secondary Button', type: 'button-secondary', icon: '🟡' },
  { id: 'input', name: 'Input Field', type: 'input', icon: '📝' },
  { id: 'header', name: 'Header Text', type: 'header', icon: 'H1' },
];

export default function FlashUIPreview() {
  const [activeTab, setActiveTab] = useState('builder');
  const [canvasItems, setCanvasItems] = useState([]);

  const addToCanvas = componentType => {
    const newItem = {
      id: Date.now(),
      type: componentType,
      content:
        componentType === 'header'
          ? 'New Section'
          : componentType === 'button-primary'
            ? 'Click Me'
            : '',
    };
    setCanvasItems([...canvasItems, newItem]);
  };

  const clearCanvas = () => setCanvasItems([]);

  return (
    <div className="flash-card p-0! overflow-hidden border-hc-purple/20 bg-black/40 flex flex-col h-150">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-hc-bright-gold flex items-center gap-2">
          <span className="text-lg">⚡</span> Flash UI Builder{' '}
          <span className="text-gray-500 text-[10px]">v2.0</span>
        </h3>
        <div className="flex gap-2">
          <TabButton active={activeTab === 'builder'} onClick={() => setActiveTab('builder')}>
            Builder Canvas
          </TabButton>
          <TabButton active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')}>
            Design Tokens
          </TabButton>
          <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')}>
            Export Code
          </TabButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Component Palette) - Only visible in Builder Mode */}
        {activeTab === 'builder' && (
          <div className="w-48 border-r border-white/10 bg-black/20 p-4 flex flex-col gap-3 overflow-y-auto">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              Library
            </p>
            {COMPONENT_LIBRARY.map(comp => (
              <button
                key={comp.id}
                onClick={() => addToCanvas(comp.type)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-hc-purple/50 transition-all group text-left"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {comp.icon}
                </span>
                <span className="text-xs font-bold text-gray-300 group-hover:text-white">
                  {comp.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Center Stage */}
        <div className="flex-1 bg-black/40 relative overflow-y-auto p-8">
          {activeTab === 'builder' ? (
            <>
              {canvasItems.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 text-gray-600">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-3xl opacity-50">
                    ✨
                  </div>
                  <p className="text-xs uppercase tracking-widest font-bold">Canvas Empty</p>
                  <p className="text-[10px]">Select components from the left to build your UI</p>
                </div>
              ) : (
                <div className="space-y-4 max-w-md mx-auto min-h-full pb-20">
                  {canvasItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="relative group animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => setCanvasItems(canvasItems.filter(i => i.id !== item.id))}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                      >
                        ✕
                      </button>

                      {/* Render Item */}
                      {item.type === 'card' && (
                        <div className="flash-card border-white/10">
                          <h3 className="font-bold text-white">Glass Card</h3>
                          <p className="text-xs text-gray-400 mt-1">
                            This is a glassmorphism card component.
                          </p>
                        </div>
                      )}
                      {item.type === 'button-primary' && (
                        <button className="flash-button-primary w-full">Primary Action</button>
                      )}
                      {item.type === 'button-secondary' && (
                        <button className="flash-button-secondary w-full">Secondary Action</button>
                      )}
                      {item.type === 'input' && (
                        <input className="flash-input w-full" placeholder="Enter text..." />
                      )}
                      {item.type === 'header' && (
                        <h2 className="text-2xl font-black text-white tracking-tight">
                          Section Header
                        </h2>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Floating Action to Clear */}
              {canvasItems.length > 0 && (
                <button
                  onClick={clearCanvas}
                  className="absolute bottom-4 right-4 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                >
                  Clear Canvas
                </button>
              )}
            </>
          ) : activeTab === 'tokens' ? (
            <div className="space-y-4 max-w-md mx-auto">
              <TokenItem color="bg-hc-purple" name="Primary" hex="#6b21a8" />
              <TokenItem color="bg-hc-bright-gold" name="Secondary" hex="#fcd34d" />
              <TokenItem color="bg-black" name="Surface" hex="#0a0a0a" border />
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Flash UI uses 18px backdrop blur and 85% opacity for its glassmorphism effect.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              <CodeBlock title="Exported JSX">
                {`// Generated Flash UI Layout
export default function MyLayout() {
  return (
    <div className="space-y-4 p-8 bg-black min-h-screen">
${canvasItems
  .map(item => {
    if (item.type === 'card') return '      <div className="flash-card">...</div>';
    if (item.type === 'button-primary')
      return '      <button className="flash-button-primary">Action</button>';
    if (item.type === 'header')
      return '      <h2 className="text-2xl font-bold text-white">Header</h2>';
    return `      {/* ${item.type} */}`;
  })
  .join('\n')}
    </div>
  )
}`}
              </CodeBlock>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ title, children }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black/50 rounded-xl border border-white/10 overflow-hidden">
      <div className="flex justify-between items-center px-4 py-2 bg-white/5 border-b border-white/5">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </span>
        <button
          onClick={copy}
          className="text-[10px] text-hc-bright-gold hover:text-white transition-colors"
        >
          {copied ? 'COPIED!' : 'COPY'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[10px] font-mono text-gray-300">{children}</pre>
    </div>
  );
}

function TabButton({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${
        active
          ? 'bg-hc-purple text-white shadow-[0_0_15px_rgba(107,33,168,0.4)]'
          : 'text-gray-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function TokenItem({ color, name, hex, border }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-6 h-6 rounded-lg ${color} ${border ? 'border border-white/20' : ''}`}
        ></div>
        <span className="text-xs font-bold">{name}</span>
      </div>
      <span className="text-[10px] font-mono text-gray-500">{hex}</span>
    </div>
  );
}

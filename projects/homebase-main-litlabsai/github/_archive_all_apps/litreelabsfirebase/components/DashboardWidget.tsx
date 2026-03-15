'use client';

import React, { useState, useCallback } from 'react';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';

export interface DashboardWidget {
  id: string;
  type: 'ai-assistant' | 'media' | 'crypto' | 'social' | 'messages' | 'notes' | 'weather' | 'marketplace';
  title: string;
  size: 'small' | 'medium' | 'large';
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized?: boolean;
  config?: Record<string, any>;
}

export interface DashboardState {
  widgets: DashboardWidget[];
  currentTab: string;
  theme: 'cyberpunk' | 'glassmorphism' | 'holographic';
}

interface DashboardWidgetProps {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  onResize: (id: string, width: number, height: number) => void;
  onToggleMinimize: (id: string) => void;
  children: React.ReactNode;
}

// Individual widget component
export function DashboardWidgetComponent({
  widget,
  onRemove,
  onResize,
  onToggleMinimize,
  children,
}: DashboardWidgetProps) {
  const [isDraggingResize, setIsDraggingResize] = useState(false);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDraggingResize(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = widget.width;
      const startHeight = widget.height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        onResize(
          widget.id,
          Math.max(300, startWidth + deltaX),
          Math.max(200, startHeight + deltaY)
        );
      };

      const handleMouseUp = () => {
        setIsDraggingResize(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [widget.id, widget.width, widget.height, onResize]
  );

  return (
    <div
      className={`
        bg-black/50 backdrop-blur-md border border-cyan-500/30 rounded-lg
        p-4 shadow-xl transition-all duration-300 flex flex-col
        ${isDraggingResize ? 'opacity-75' : 'opacity-100'}
        ${widget.isMinimized ? 'h-auto' : 'h-full'}
      `}
      style={{
        width: `${widget.width}px`,
        height: `${widget.isMinimized ? 'auto' : widget.height}px`,
        cursor: isDraggingResize ? 'nwse-resize' : 'default',
      }}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-cyan-400 cursor-move" />
          <h3 className="text-sm font-semibold text-cyan-300">{widget.title}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleMinimize(widget.id)}
            className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
            title={widget.isMinimized ? 'Maximize' : 'Minimize'}
          >
            {widget.isMinimized ? (
              <Maximize2 size={14} className="text-cyan-400" />
            ) : (
              <Minimize2 size={14} className="text-cyan-400" />
            )}
          </button>

          <button
            onClick={() => onRemove(widget.id)}
            className="p-1 hover:bg-red-500/20 rounded transition-colors"
            title="Remove widget"
          >
            <X size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Widget Content */}
      {!widget.isMinimized && (
        <div className="flex-1 overflow-y-auto">{children}</div>
      )}

      {/* Resize Handle */}
      {!widget.isMinimized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize
            bg-gradient-to-tl from-cyan-500/30 to-transparent rounded-tl
            hover:from-cyan-500/50 transition-colors"
        />
      )}
    </div>
  );
}

// Dashboard grid container
interface DashboardGridProps {
  widgets: DashboardWidget[];
  onRemoveWidget: (id: string) => void;
  onResizeWidget: (id: string, width: number, height: number) => void;
  onToggleMinimize: (id: string) => void;
  renderWidget: (widget: DashboardWidget) => React.ReactNode;
}

export function DashboardGrid({
  widgets,
  onRemoveWidget,
  onResizeWidget,
  onToggleMinimize,
  renderWidget,
}: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 p-4">
      {widgets.map((widget) => (
        <DashboardWidgetComponent
          key={widget.id}
          widget={widget}
          onRemove={onRemoveWidget}
          onResize={onResizeWidget}
          onToggleMinimize={onToggleMinimize}
        >
          {renderWidget(widget)}
        </DashboardWidgetComponent>
      ))}
    </div>
  );
}

// Hook for managing dashboard state
export function useDashboard(initialWidgets: DashboardWidget[]) {
  const [state, setState] = useState<DashboardState>({
    widgets: initialWidgets,
    currentTab: 'home',
    theme: 'cyberpunk',
  });

  const addWidget = useCallback((widget: DashboardWidget) => {
    setState((prev) => ({
      ...prev,
      widgets: [...prev.widgets, widget],
    }));
  }, []);

  const removeWidget = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((w) => w.id !== id),
    }));
  }, []);

  const updateWidget = useCallback(
    (id: string, updates: Partial<DashboardWidget>) => {
      setState((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === id ? { ...w, ...updates } : w
        ),
      }));
    },
    []
  );

  const resizeWidget = useCallback(
    (id: string, width: number, height: number) => {
      updateWidget(id, { width, height });
    },
    [updateWidget]
  );

  const toggleMinimize = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    }));
  }, []);

  const setCurrentTab = useCallback((tab: string) => {
    setState((prev) => ({ ...prev, currentTab: tab }));
  }, []);

  const setTheme = useCallback((theme: 'cyberpunk' | 'glassmorphism' | 'holographic') => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  return {
    state,
    addWidget,
    removeWidget,
    updateWidget,
    resizeWidget,
    toggleMinimize,
    setCurrentTab,
    setTheme,
  };
}

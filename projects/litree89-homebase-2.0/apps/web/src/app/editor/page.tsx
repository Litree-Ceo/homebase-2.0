'use client';

import React, { useState } from 'react';
import { Grid, Plus, Trash2, Settings, Eye } from 'lucide-react';
import GridLayout, { Layouts, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * @workspace Create Your HomeBase - Drag-and-drop editor
 * Allows users to build custom HomeBase pages with draggable widgets
 */

interface Widget {
  id: string;
  type: 'text' | 'image' | 'video' | 'gallery' | 'avatar' | 'custom';
  title: string;
  content: any;
  layout?: Layout;
}

export default function HomeBaseEditor() {
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: '1',
      type: 'text',
      title: 'Welcome',
      content: 'Welcome to my HomeBase!',
      layout: { x: 0, y: 0, w: 4, h: 2, i: '1' },
    },
  ]);
  const [previewMode, setPreviewMode] = useState(false);
  const [title, setTitle] = useState('My HomeBase');

  const addWidget = (type: Widget['type']) => {
    const newWidget: Widget = {
      id: Math.random().toString(36),
      type,
      title: `New ${type}`,
      content: '',
      layout: {
        x: 0,
        y: Infinity,
        w: 4,
        h: 3,
        i: Math.random().toString(36),
      },
    };
    setWidgets([...widgets, newWidget]);
  };

  const deleteWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const updateWidgetContent = (id: string, content: any) => {
    setWidgets(widgets.map(w => (w.id === id ? { ...w, content } : w)));
  };

  const handleLayoutChange = (layout: Layout[]) => {
    setWidgets(
      widgets.map(w => ({
        ...w,
        layout: layout.find(l => l.i === w.id),
      })),
    );
  };

  const layouts: Layouts = {
    lg: widgets.map(w => w.layout).filter((l): l is Layout => l !== undefined),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">HomeBase Editor</h1>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-2 w-full max-w-xs"
                placeholder="Your HomeBase title"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={previewMode ? 'default' : 'outline'}
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button>
                <Grid className="w-4 h-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar - Widget Palette */}
        {!previewMode && (
          <div className="w-48 border-r border-border bg-muted/30 p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold mb-4">Add Widgets</h2>
            <div className="space-y-2">
              {['text', 'image', 'video', 'gallery', 'avatar', 'custom'].map(type => (
                <Button
                  key={type}
                  variant="outline"
                  className="w-full justify-start capitalize"
                  onClick={() => addWidget(type as Widget['type'])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {type}
                </Button>
              ))}
            </div>

            {/* Quick Guides */}
            <div className="mt-8 pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-muted-foreground mb-2">TIPS</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Drag widgets to move</li>
                <li>• Resize from corner</li>
                <li>• Click settings to edit</li>
              </ul>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className="flex-1 overflow-auto p-8">
          {previewMode ? (
            // Preview Mode
            <div className="max-w-4xl">
              <h1 className="text-4xl font-bold mb-4">{title}</h1>
              <div className="space-y-6">
                {widgets.map(widget => (
                  <Card key={widget.id}>
                    <CardHeader>
                      <CardTitle className="capitalize">{widget.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {widget.type === 'text' && <p>{widget.content}</p>}
                      {widget.type === 'image' && widget.content && (
                        <img
                          src={widget.content}
                          alt={widget.title}
                          className="max-w-full rounded-lg"
                        />
                      )}
                      {widget.type === 'video' && widget.content && (
                        <video src={widget.content} controls className="max-w-full rounded-lg" />
                      )}
                      {widget.type === 'gallery' && (
                        <div className="grid grid-cols-3 gap-2">
                          {Array(6)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square bg-muted rounded-lg flex items-center justify-center"
                              >
                                <span className="text-sm text-muted-foreground">Image {i + 1}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Edit Mode with Grid Layout
            <GridLayout
              className="layout grid-bg rounded-lg border-2 border-dashed border-muted p-4"
              layout={layouts.lg}
              onLayoutChange={handleLayoutChange}
              cols={12}
              rowHeight={60}
              width={1000}
              isDraggable={true}
              isResizable={true}
              compactType="vertical"
              preventCollision={false}
            >
              {widgets.map(widget => (
                <div
                  key={widget.id}
                  className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold capitalize">{widget.title}</h3>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => deleteWidget(widget.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Widget Content Editor */}
                  {widget.type === 'text' && (
                    <textarea
                      value={widget.content}
                      onChange={e => updateWidgetContent(widget.id, e.target.value)}
                      placeholder="Enter text..."
                      className="flex-1 p-2 bg-muted rounded text-xs resize-none"
                    />
                  )}
                  {widget.type === 'image' && (
                    <Input
                      type="url"
                      value={widget.content}
                      onChange={e => updateWidgetContent(widget.id, e.target.value)}
                      placeholder="Image URL..."
                      className="text-xs"
                    />
                  )}
                  {widget.type === 'avatar' && (
                    <div className="flex-1 flex items-center justify-center bg-muted rounded">
                      <span className="text-xs text-muted-foreground">3D Avatar Preview</span>
                    </div>
                  )}
                  {['video', 'gallery', 'custom'].includes(widget.type) && (
                    <div className="flex-1 flex items-center justify-center bg-muted rounded">
                      <span className="text-xs text-muted-foreground">{widget.type} Widget</span>
                    </div>
                  )}
                </div>
              ))}
            </GridLayout>
          )}
        </div>
      </div>
    </div>
  );
}

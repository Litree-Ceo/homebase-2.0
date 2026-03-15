'use client';
import { Builder } from '@builder.io/react';

// Example: Making the 'FlashCard' editable in the Drag & Drop editor
Builder.registerComponent(
  ({ children, title, description, color }) => (
    <div
      className={`flash-card border-${color === 'primary' ? 'hc-bright-gold/20' : 'hc-purple/20'}`}
    >
      <h3
        className={`text-xl font-black mb-2 tracking-tight ${color === 'primary' ? 'text-hc-bright-gold' : 'text-hc-purple'}`}
      >
        {title}
      </h3>
      <p className="text-gray-400 font-medium">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  ),
  {
    name: 'FlashCard',
    inputs: [
      { name: 'title', type: 'string', defaultValue: 'New Flash Card' },
      {
        name: 'description',
        type: 'longText',
        defaultValue: 'Edit this description in Builder.io',
      },
      {
        name: 'color',
        type: 'string',
        enum: ['primary', 'secondary'],
        defaultValue: 'primary',
      },
    ],
  },
);

// Example: Registering a custom button
Builder.registerComponent(
  ({ text, type }) => (
    <button className={type === 'primary' ? 'flash-button-primary' : 'flash-button-secondary'}>
      {text}
    </button>
  ),
  {
    name: 'FlashButton',
    inputs: [
      { name: 'text', type: 'string', defaultValue: 'Click Me' },
      {
        name: 'type',
        type: 'string',
        enum: ['primary', 'secondary'],
        defaultValue: 'primary',
      },
    ],
  },
);

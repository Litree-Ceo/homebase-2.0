'use client';

import { useState } from 'react';

export interface Template {
  id: string;
  category: 'lash' | 'nail' | 'hair';
  title: string;
  description: string;
  template: string;
  variables: string[];
}

const TEMPLATES: Template[] = [
  {
    id: 'lash-dm-response',
    category: 'lash',
    title: 'DM Response - Booking Inquiry',
    description: 'Professional reply to booking questions',
    template: 'Hey {{client_name}}!\n\nClassic: ${{price_classic}} | Volume: ${{price_volume}} | Hybrid: ${{price_hybrid}}\n\nFirst time? New client special: {{promo_discount}}% off!\n\nSpots filling - DM to book',
    variables: ['client_name', 'price_classic', 'price_volume', 'price_hybrid', 'promo_discount'],
  },
  {
    id: 'lash-instagram-post',
    category: 'lash',
    title: 'Instagram Post Caption',
    description: 'Engagement-boosting caption for transformations',
    template: 'From {{before}} to {{after}}\n\nThe transformation is REAL. Tag someone who needs this!\n\nLocation: {{location}}\n\n#lashtech #beforeandafter #beautytransformation',
    variables: ['before', 'after', 'location'],
  },
  {
    id: 'nail-dm-response',
    category: 'nail',
    title: 'DM Response - Service Inquiry',
    description: 'Quick reply for service questions',
    template: 'Yes girl!\n\n{{service}}: ${{price}} | Full Set: ${{full_set_price}}\nFills: ${{fill_price}}\n\n{{specialty}}\n\nOpen {{hours}} - Book now!',
    variables: ['service', 'price', 'full_set_price', 'fill_price', 'specialty', 'hours'],
  },
  {
    id: 'nail-instagram-post',
    category: 'nail',
    title: 'Instagram Post Caption',
    description: 'Showcase your nail art',
    template: 'Currently obsessed with {{style}}\n\nDesign: {{design}}\n\nSave this for your next appointment! DM to book\n\n#nailart #naildesigner #beautifulnails',
    variables: ['style', 'design'],
  },
  {
    id: 'hair-dm-response',
    category: 'hair',
    title: 'DM Response - Appointment',
    description: 'Professional booking reply',
    template: 'Hey {{client_name}}!\n\n{{service}}: ${{price}} | {{time}}\n\nNext opening: {{next_date}}\nDeposit: ${{deposit}} to hold\n\nText me or DM to confirm',
    variables: ['client_name', 'service', 'price', 'time', 'next_date', 'deposit'],
  },
  {
    id: 'hair-instagram-post',
    category: 'hair',
    title: 'Instagram Post Caption',
    description: 'Highlight your styling skills',
    template: 'Color + Cut + Style\n\n{{before}} → {{after}}\n\nThis color took {{hours}} hours and I\'m OBSESSED!\n\n#hairsalon #colorcorrection #hairtransformation',
    variables: ['before', 'after', 'hours'],
  },
];

export function TemplateLibrary() {
  const [selected, setSelected] = useState<Template | null>(null);
  const [category, setCategory] = useState<'lash' | 'nail' | 'hair'>('lash');
  const [filledTemplate, setFilledTemplate] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});

  const filtered = TEMPLATES.filter((t) => t.category === category);

  const selectTemplate = (template: Template) => {
    setSelected(template);
    setVariables({});
    setFilledTemplate('');
  };

  const fillTemplate = () => {
    if (!selected) return;
    let result = selected.template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    setFilledTemplate(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(filledTemplate);
    alert('Template copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">📋 Content Templates</h1>
        <p className="text-white/70">Pre-built templates for your beauty business</p>
      </div>

      {/* Category Buttons */}
      <div className="flex gap-3 mb-8">
        {(['lash', 'nail', 'hair'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategory(cat);
              setSelected(null);
            }}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === cat
                ? 'bg-pink-500 text-white'
                : 'bg-slate-700 text-white/70 hover:bg-slate-600'
            }`}
          >
            {cat === 'lash' ? '🧿 Lash Techs' : cat === 'nail' ? '💅 Nail Techs' : '💇‍♀️ Hair Stylists'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="space-y-3">
            {filtered.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`w-full text-left p-4 rounded-lg border transition ${
                  selected?.id === template.id
                    ? 'border-pink-500 bg-pink-500/10 text-white'
                    : 'border-slate-600 bg-slate-800 text-white/70 hover:border-pink-500/50'
                }`}
              >
                <p className="font-semibold text-sm">{template.title}</p>
                <p className="text-xs text-white/50 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Template Editor */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">{selected.title}</h2>

                <div className="space-y-4 mb-6">
                  {selected.variables.map((varName) => (
                    <div key={varName}>
                      <label className="block text-sm text-white/70 mb-2">{`{{${varName}}}`}</label>
                      <input
                        type="text"
                        value={variables[varName] || ''}
                        onChange={(e) =>
                          setVariables({ ...variables, [varName]: e.target.value })
                        }
                        placeholder={`Enter ${varName}`}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm placeholder-slate-500"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={fillTemplate}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  Fill Template
                </button>
              </div>

              {filledTemplate && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Preview</h3>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded transition"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded p-4 text-white text-sm whitespace-pre-wrap">
                    {filledTemplate}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96 text-white/50">
              <p>Select a template to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

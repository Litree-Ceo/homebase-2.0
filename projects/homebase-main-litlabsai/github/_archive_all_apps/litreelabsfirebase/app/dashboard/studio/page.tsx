'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { getBotTemplates } from '@/lib/bot-builder';

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'code' | 'test' | 'deploy'>('builder');
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant.');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [testQuery, setTestQuery] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [code, setCode] = useState(`// Your custom bot code
async function handleMessage(message, context) {
  // Process the message
  const response = await callAI(message);
  return response;
}

module.exports = { handleMessage };`);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);

  const templates = getBotTemplates();

  const handleTest = async () => {
    if (!testQuery) return;

    const response = await fetch('/api/studio/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'test',
        botId: 'demo_bot',
        query: testQuery,
      }),
    });

    const data = await response.json();
    if (data.success) {
      setTestResponse(data.response);
    }
  };

  const handleDeploy = async () => {
    setIsDeploying(true);

    const response = await fetch('/api/studio/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        config: {
          name: botName || 'My AI Bot',
          description: botDescription,
          systemPrompt,
          model,
          temperature,
        },
      }),
    });

    const data = await response.json();
    if (data.success) {
      const deployment = await fetch('/api/studio/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy',
          botId: data.bot.id,
          environment: 'production',
        }),
      }).then(r => r.json());

      if (deployment.success) {
        setDeploymentUrl(`https://${deployment.deployment.subdomain}`);
      }
    }

    setIsDeploying(false);
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* HEADER */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-black text-white'>LitLabs Studio 🎨</h1>
            <p className='text-white/60 mt-1'>Build, test, and deploy custom AI bots</p>
          </div>
          <div className='px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'>
            <p className='text-sm text-purple-300 font-semibold'>30% Revenue Share</p>
          </div>
        </div>

        {/* TABS */}
        <div className='flex gap-2 border-b border-white/10'>
          {[
            { id: 'builder', label: '🏗️ Builder', icon: '🏗️' },
            { id: 'code', label: '💻 Code Editor', icon: '💻' },
            { id: 'test', label: '🧪 Test', icon: '🧪' },
            { id: 'deploy', label: '🚀 Deploy', icon: '🚀' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-purple-500'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BUILDER TAB */}
        {activeTab === 'builder' && (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* LEFT: Configuration */}
            <div className='space-y-6'>
              <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
                <h2 className='text-xl font-bold text-white mb-4'>⚙️ Bot Configuration</h2>
                
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-semibold text-white mb-2'>Bot Name</label>
                    <input
                      type='text'
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder='My Awesome Bot'
                      className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-white mb-2'>Description</label>
                    <textarea
                      value={botDescription}
                      onChange={(e) => setBotDescription(e.target.value)}
                      placeholder='Describe what your bot does...'
                      rows={3}
                      className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none'
                    />
                  </div>

                  <div>
                    <label htmlFor="ai-model-select-studio" className='block text-sm font-semibold text-white mb-2'>AI Model</label>
                    <select
                      id="ai-model-select-studio"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500/50'
                      aria-label="Select AI model for content generation"
                    >
                      <option value='gemini-1.5-flash'>Gemini 1.5 Flash (Fast)</option>
                      <option value='gemini-1.5-pro'>Gemini 1.5 Pro (Smart)</option>
                      <option value='gpt-4'>GPT-4 (Premium)</option>
                      <option value='gpt-3.5-turbo'>GPT-3.5 Turbo</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-white mb-2'>
                      Temperature: {temperature}
                    </label>
                    <input
                      type='range'
                      min='0'
                      max='1'
                      step='0.1'
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className='w-full'
                      aria-label='Temperature control'
                    />
                    <div className='flex justify-between text-xs text-white/50 mt-1'>
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-semibold text-white mb-2'>System Prompt</label>
                    <textarea
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      placeholder='You are a helpful assistant...'
                      rows={5}
                      className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none font-mono text-sm'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Templates */}
            <div className='space-y-6'>
              <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
                <h2 className='text-xl font-bold text-white mb-4'>📋 Templates</h2>
                
                <div className='space-y-3'>
                  {templates.map((template, idx) => (
                    <div
                      key={idx}
                      className='p-4 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 transition cursor-pointer'
                      onClick={() => {
                        setBotName(template.name || '');
                        setBotDescription(template.description || '');
                        setSystemPrompt(template.systemPrompt || '');
                      }}
                    >
                      <h3 className='font-bold text-white mb-1'>{template.name}</h3>
                      <p className='text-sm text-white/60 mb-2'>{template.description}</p>
                      <div className='flex flex-wrap gap-2'>
                        {template.skills?.map((skill, skillIdx) => (
                          <span
                            key={skillIdx}
                            className='px-2 py-1 rounded-md bg-purple-500/20 text-xs text-purple-300'
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CODE EDITOR TAB */}
        {activeTab === 'code' && (
          <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>💻 Code Editor</h2>
            
            <textarea
              id="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={20}
              className='w-full px-4 py-3 rounded-lg bg-black/50 border border-white/10 text-green-400 font-mono text-sm focus:outline-none focus:border-purple-500/50 resize-none'
              spellCheck={false}
              aria-label="Code editor"
            />

            <div className='flex gap-3 mt-4'>
              <button className='px-6 py-3 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-500/30 transition'>
                💾 Save Code
              </button>
              <button className='px-6 py-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 font-semibold hover:bg-blue-500/30 transition'>
                ✓ Validate Syntax
              </button>
            </div>
          </div>
        )}

        {/* TEST TAB */}
        {activeTab === 'test' && (
          <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>🧪 Test Your Bot</h2>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-semibold text-white mb-2'>Test Query</label>
                <textarea
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder='Type a message to test your bot...'
                  rows={3}
                  className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 resize-none'
                />
              </div>

              <button
                onClick={handleTest}
                className='px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition'
              >
                🧪 Test Bot
              </button>

              {testResponse && (
                <div className='p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'>
                  <p className='text-sm text-purple-300 mb-2'>🤖 Bot Response:</p>
                  <p className='text-white'>{testResponse}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEPLOY TAB */}
        {activeTab === 'deploy' && (
          <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>🚀 Deploy Your Bot</h2>
            
            <div className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
                  <div className='text-3xl mb-3'>🌐</div>
                  <h3 className='font-bold text-white mb-2'>Web Chat</h3>
                  <p className='text-sm text-white/70'>Embed on your website</p>
                </div>

                <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
                  <div className='text-3xl mb-3'>📱</div>
                  <h3 className='font-bold text-white mb-2'>WhatsApp</h3>
                  <p className='text-sm text-white/70'>Connect to WhatsApp Business</p>
                </div>

                <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
                  <div className='text-3xl mb-3'>💬</div>
                  <h3 className='font-bold text-white mb-2'>Slack</h3>
                  <p className='text-sm text-white/70'>Add to Slack workspace</p>
                </div>
              </div>

              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className='w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg font-bold hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50'
              >
                {isDeploying ? '⏳ Deploying...' : '🚀 Deploy to Production'}
              </button>

              {deploymentUrl && (
                <div className='p-6 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'>
                  <p className='text-sm text-green-300 mb-2'>✅ Successfully Deployed!</p>
                  <p className='text-white font-mono text-sm'>{deploymentUrl}</p>
                </div>
              )}

              <div className='p-6 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20'>
                <h3 className='font-bold text-white mb-3'>💰 Revenue Share</h3>
                <p className='text-sm text-white/70 mb-4'>
                  Publish your bot to the LitLabs Marketplace and earn <strong className='text-purple-300'>70%</strong> of all revenue!
                </p>
                <button className='px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition'>
                  🏪 Publish to Marketplace
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

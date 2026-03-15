'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function WhatsAppPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '10:00', close: '16:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: true },
  });
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);
  const [messages] = useState([
    { from: '+1234567890', body: 'Hey! What time are you open today?', timestamp: new Date(), reply: 'I\'m open today until 6:00 PM! Want to book?' },
    { from: '+1987654321', body: 'How much for a haircut?', timestamp: new Date(), reply: 'Haircuts are $35! Want to book an appointment?' },
  ]);

  const handleSaveSettings = () => {
    alert('WhatsApp settings saved! ✅');
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* HEADER */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-black text-white'>WhatsApp Business 📱</h1>
            <p className='text-white/60 mt-1'>AI-powered messaging & appointment booking</p>
          </div>
          <div className='px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30'>
            <p className='text-sm text-green-300 font-semibold'>WhatsApp Add-on • $24/month</p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* SETUP */}
          <div className='space-y-6'>
            <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>⚙️ Setup</h2>
              
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-white mb-2'>
                    WhatsApp Business Phone Number
                  </label>
                  <input
                    type='tel'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder='+1 (555) 123-4567'
                    className='w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-500/50'
                  />
                  <p className='text-xs text-white/50 mt-1'>This must be a WhatsApp Business verified number</p>
                </div>

                <div className='flex items-center justify-between p-4 rounded-lg bg-white/5'>
                  <div>
                    <p className='font-semibold text-white'>AI Auto-Reply</p>
                    <p className='text-xs text-white/60'>Respond to messages automatically</p>
                  </div>
                  <button
                    onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                    className={`relative w-14 h-8 rounded-full transition ${
                      autoReplyEnabled ? 'bg-green-500' : 'bg-white/20'
                    }`}
                    title={autoReplyEnabled ? 'Disable AI Auto-Reply' : 'Enable AI Auto-Reply'}
                    aria-label={autoReplyEnabled ? 'Disable AI Auto-Reply' : 'Enable AI Auto-Reply'}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                        autoReplyEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className='w-full px-6 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/30 transition'
                >
                  💾 Save Settings
                </button>
              </div>
            </div>

            {/* BUSINESS HOURS */}
            <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
              <h2 className='text-xl font-bold text-white mb-4'>⏰ Business Hours</h2>
              
              <div className='space-y-3'>
                {Object.entries(businessHours).map(([day, hours]) => (
                  <div key={day} className='flex items-center gap-3'>
                    <div className='w-24'>
                      <p className='text-sm font-semibold text-white capitalize'>{day}</p>
                    </div>
                    <input
                      type='checkbox'
                      checked={!hours.closed}
                      onChange={(e) => setBusinessHours({
                        ...businessHours,
                        [day]: { ...hours, closed: !e.target.checked },
                      })}
                      className='w-5 h-5'
                      aria-label={`${day} business hours open`}
                    />
                    {!hours.closed && (
                      <>
                        <input
                          type='time'
                          value={hours.open}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, open: e.target.value },
                          })}
                          className='px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm'
                          aria-label={`${day} opening time`}
                        />
                        <span className='text-white/50'>-</span>
                        <input
                          type='time'
                          value={hours.close}
                          onChange={(e) => setBusinessHours({
                            ...businessHours,
                            [day]: { ...hours, close: e.target.value },
                          })}
                          className='px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm'
                          aria-label={`${day} closing time`}
                        />
                      </>
                    )}
                    {hours.closed && (
                      <span className='text-white/40 text-sm'>Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT MESSAGES */}
          <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>💬 Recent Messages</h2>
            
            <div className='space-y-4'>
              {messages.map((msg, idx) => (
                <div key={idx} className='p-4 rounded-lg bg-white/5 border border-white/10'>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='font-semibold text-white'>{msg.from}</p>
                    <p className='text-xs text-white/50'>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className='space-y-2'>
                    <div className='p-3 rounded-lg bg-white/10'>
                      <p className='text-sm text-white'>{msg.body}</p>
                    </div>
                    
                    <div className='p-3 rounded-lg bg-green-500/20 border border-green-500/30'>
                      <p className='text-sm text-green-300'>🤖 AI Reply:</p>
                      <p className='text-sm text-white mt-1'>{msg.reply}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-4 p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20'>
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center'>
                  <span className='text-xl'>🤖</span>
                </div>
                <div>
                  <p className='font-semibold text-white'>AI Assistant Active</p>
                  <p className='text-xs text-white/60'>Responding to messages 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
            <div className='text-3xl mb-3'>🗓️</div>
            <h3 className='font-bold text-white mb-2'>Auto Booking</h3>
            <p className='text-sm text-white/70'>Customers can book appointments directly via WhatsApp</p>
          </div>

          <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
            <div className='text-3xl mb-3'>💬</div>
            <h3 className='font-bold text-white mb-2'>Smart Replies</h3>
            <p className='text-sm text-white/70'>AI answers FAQs about hours, pricing, and services</p>
          </div>

          <div className='p-6 rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900'>
            <div className='text-3xl mb-3'>🌍</div>
            <h3 className='font-bold text-white mb-2'>Multi-Language</h3>
            <p className='text-sm text-white/70'>Communicate with customers in their language</p>
          </div>
        </div>

        {/* SETUP GUIDE */}
        <div className='rounded-xl border border-white/10 bg-slate-900 p-6'>
          <h2 className='text-xl font-bold text-white mb-4'>🚀 Quick Setup Guide</h2>
          
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs font-bold text-green-300'>1</span>
              </div>
              <div>
                <p className='font-semibold text-white'>Apply for WhatsApp Business API</p>
                <p className='text-sm text-white/60'>Visit business.whatsapp.com and apply for API access</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs font-bold text-green-300'>2</span>
              </div>
              <div>
                <p className='font-semibold text-white'>Get Your Access Tokens</p>
                <p className='text-sm text-white/60'>Copy your access token and phone number ID from Meta Business</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs font-bold text-green-300'>3</span>
              </div>
              <div>
                <p className='font-semibold text-white'>Configure Webhook</p>
                <p className='text-sm text-white/60'>Set webhook URL to: https://yourdomain.com/api/whatsapp/webhook</p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5'>
                <span className='text-xs font-bold text-green-300'>4</span>
              </div>
              <div>
                <p className='font-semibold text-white'>Test Your Connection</p>
                <p className='text-sm text-white/60'>Send a test message to verify everything works</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

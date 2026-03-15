# Dual-Mode Voice Input System

Your Next.js app now has a complete **voice transcription system** with two modes:

## 🎤 Two Modes

### 1. **Browser Speech API** (Web Speech)
- ✅ Works instantly - no API key needed
- ✅ Free - uses Chrome/Edge/Safari built-in
- ✅ Fast response
- ❌ Less accurate
- ✅ Good for real-time transcription

**Best for:** Quick demos, user testing, real-time feedback

### 2. **OpenAI Whisper** (Server-side)
- ✅ Highly accurate (industry-leading)
- ✅ Works in any browser
- ✅ Handles accents and background noise well
- ❌ Requires OpenAI API key ($0.02 per minute audio)
- ❌ Slight latency (100-500ms)

**Best for:** Production, important transcriptions, accuracy-critical features

---

## 🚀 Quick Start

### Test the Voice System

1. **Make sure your dev server is running:**
   ```powershell
   cd C:\Users\dying\public
   npm run dev
   ```

2. **Open the voice test page:**
   ```
   http://localhost:3000/voice-test
   ```

3. **Click "Start Recording"** → speak → click "Stop Recording"
   - System will transcribe your speech
   - History shows last 10 transcriptions

---

## 📝 Using in Your Code

### Basic Usage

```tsx
'use client';

import { VoiceInput } from '@/components/VoiceInput';
import { useState } from 'react';

export default function MyPage() {
  const [text, setText] = useState('');

  return (
    <div>
      <VoiceInput 
        onTranscript={(text) => setText(text)}
        mode="browser"  // or "whisper"
      />
      <p>You said: {text}</p>
    </div>
  );
}
```

### Props

```tsx
interface VoiceInputProps {
  onTranscript: (text: string) => void;  // Callback when speech is transcribed
  placeholder?: string;                   // Placeholder text
  mode?: 'browser' | 'whisper';          // Which mode to use (auto-selects if unavailable)
}
```

---

## 🔑 Setting Up Whisper (Optional)

### Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API keys** → **Create new secret key**
4. Copy the key

### Update .env.local

```env
OPENAI_API_KEY=sk_your_actual_key_here
```

That's it! Your app will now:
- Detect both modes are available
- Show "Browser Speech" and "Whisper" toggle buttons
- Use whichever mode you select

---

## 📂 File Structure

```
components/
  └─ VoiceInput.tsx          # Main voice component
  
app/
  ├─ api/transcribe/route.ts # Whisper API endpoint
  └─ voice-test/page.tsx     # Demo page

.env.local
  └─ OPENAI_API_KEY          # Your OpenAI key (optional)
```

---

## 🔧 How It Works

### Browser Mode Flow
1. User clicks "Start Recording"
2. Browser's Web Speech API starts listening
3. Returns partial/final results in real-time
4. Calls `onTranscript()` callback with each result
5. User clicks "Stop Recording" to finish

### Whisper Mode Flow
1. User clicks "Start Recording"
2. Browser records audio (MediaRecorder API)
3. User clicks "Stop Recording"
4. Audio is sent to `/api/transcribe` endpoint
5. Server sends to OpenAI Whisper API
6. Result returned and displayed
7. Callback triggered with final text

---

## 🐛 Troubleshooting

### "Microphone access denied"
- Grant microphone permission to browser
- Check Privacy settings

### "Speech recognition not supported"
- Use Chrome, Edge, or Safari
- Firefox partial support
- Internet Explorer not supported

### "Whisper error: No API key"
- Add `OPENAI_API_KEY` to `.env.local`
- Restart dev server after adding key: `npm run dev`

### Both buttons appear but mode won't change
- Browser might not support Web Speech API
- Check browser console (F12 → Console)

---

## 📊 Cost

### Browser Mode
- **Cost:** FREE ✅
- **Calls:** Unlimited

### Whisper Mode
- **Cost:** $0.02 per minute of audio
- **Example:** 1000 1-minute transcriptions = $20

---

## 🎯 Next Steps

### Integrate Into Your App

1. **Chat interface:** Use transcript as user message
   ```tsx
   <VoiceInput onTranscript={(text) => sendMessage(text)} />
   ```

2. **Search:** Transcribe search queries
   ```tsx
   <VoiceInput onTranscript={(text) => search(text)} />
   ```

3. **Forms:** Fill form fields with voice
   ```tsx
   <VoiceInput onTranscript={(text) => setFormValue(text)} />
   ```

4. **Notes:** Voice-to-notes app
   ```tsx
   <VoiceInput onTranscript={(text) => saveNote(text)} />
   ```

---

## 🚀 God-Mode Auth (Coming Next)

After voice works perfectly, we'll add:
- ✅ Google/Apple/Facebook login
- ✅ Phone number auth
- ✅ Passkeys
- ✅ 2FA
- ✅ Account linking

For now, focus on getting voice working!

---

## 📞 Need Help?

Check the test page at `http://localhost:3000/voice-test` to ensure everything works before integrating into your app.

**Happy voice coding!** 🎤✨

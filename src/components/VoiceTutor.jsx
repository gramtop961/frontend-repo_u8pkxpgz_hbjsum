import { useEffect, useRef, useState } from 'react';
import { Mic, StopCircle, Volume2 } from 'lucide-react';

const backendURL = import.meta.env.VITE_BACKEND_URL || '';

function useSpeech() {
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const [speaking, setSpeaking] = useState(false);

  const speak = (text) => {
    if (!text || !synthRef.current) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    utter.rate = 1.0;
    utter.pitch = 1.0;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    synthRef.current.cancel();
    synthRef.current.speak(utter);
  };

  const stop = () => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    setSpeaking(false);
  };

  return { speak, stop, speaking };
}

function useSTT() {
  const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const recRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [supported] = useState(Boolean(Recognition));

  const start = () => {
    if (!Recognition) return false;
    const rec = new Recognition();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.continuous = false;
    recRef.current = rec;
    setRecording(true);
    rec.start();
    return true;
  };

  const stop = () => {
    if (recRef.current) recRef.current.stop();
  };

  const onResult = (handler) => {
    if (!recRef.current) return;
    recRef.current.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last[0]?.transcript?.trim();
      handler(text || '');
    };
    recRef.current.onend = () => setRecording(false);
    recRef.current.onerror = () => setRecording(false);
  };

  return { start, stop, onResult, recording, supported };
}

function VoiceTutor() {
  const [level, setLevel] = useState('beginner');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi! I am your AI Buddy. Tell me something about your day.' }]);
  const { speak, stop, speaking } = useSpeech();
  const { start: sttStart, stop: sttStop, onResult, recording, supported } = useSTT();
  const [loading, setLoading] = useState(false);

  const send = async (text) => {
    if (!text?.trim()) return;
    setLoading(true);
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');
    try {
      const res = await fetch(`${backendURL}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, level }),
      });
      const data = await res.json();
      const botText = data?.reply || 'I am here to help!';
      setMessages((m) => [
        ...m,
        { role: 'bot', text: botText },
        ...(data?.suggestions?.length ? [{ role: 'tip', text: data.suggestions.join(' ') }] : []),
      ]);
      speak(botText);
    } catch (e) {
      setMessages((m) => [...m, { role: 'bot', text: 'Unable to reach the tutor right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordToggle = async () => {
    if (!recording) {
      const started = sttStart();
      if (started) {
        onResult((text) => {
          if (text) send(text);
        });
      }
    } else {
      sttStop();
    }
  };

  useEffect(() => {
    // Greet via TTS on load
    speak('Welcome to ZPHS Kuchanpally AI Buddy. Tell me about your day.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative max-w-3xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Volume2 className="w-4 h-4" />
          Voice enabled
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="border rounded px-2 py-1 text-sm">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div className="bg-white/70 backdrop-blur border rounded-xl p-4 space-y-3 min-h-[260px]">
        {messages.map((m, i) => (
          <div key={i} className={
            m.role === 'user' ? 'text-right' : m.role === 'tip' ? 'text-gray-500 text-sm' : 'text-left'
          }>
            <span className={
              m.role === 'user' ? 'inline-block bg-blue-600 text-white px-3 py-2 rounded-lg' :
              m.role === 'tip' ? '' : 'inline-block bg-gray-100 px-3 py-2 rounded-lg'
            }>
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={handleRecordToggle} className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${recording ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white hover:bg-gray-50'}`}>
          {recording ? <StopCircle className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
          {recording ? 'Stop' : (supported ? 'Speak' : 'Speak (not supported)')}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          className="flex-1 border rounded-lg px-3 py-2"
          onKeyDown={(e) => { if (e.key === 'Enter') send(input); }}
        />
        <button onClick={() => send(input)} disabled={loading} className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50">
          Send
        </button>
        <button onClick={() => stop()} className="px-3 py-2 rounded-lg border">Stop voice</button>
      </div>
    </section>
  );
}

export default VoiceTutor;

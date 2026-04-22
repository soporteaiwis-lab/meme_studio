import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Bot, User } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { cn } from '@/src/lib/utils';
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy **Armin Salazar**, tu asistente IA. Sube una imagen y dime qué te gustaría hacer (ej: "Aplica estilo Pixar", o "Crea un meme gracioso").' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech recognition API
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
        alert("El dictado por voz no está soportado en este navegador.");
        return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = `
        Eres Armin Salazar, CEO de aiwis IA & TI, y el Arquitecto Maestro de ARMIN SUNO IA.
        Estás ayudando a un usuario a crear memes y editar imágenes.
        Actúa como un experto en prompt engineering, da consejos técnicos de edición visual de manera concisa.
        Estructura de tu respuesta:
        1. Entendido: Qué quieres lograr
        2. Prompt de Estilo sugerido: (para la IA de imagen)
        3. Consejos de composición en el lienzo (Canvas).
        
        Usuario dice: ${userMessage}
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'Error procesando.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error de conexión con la IA de Armin. Revisa tu API key.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[rgba(15,15,20,0.8)] backdrop-blur-[10px] border-b border-white/10 p-4 gap-3 z-10 w-full">
      <div className="flex justify-between items-center flex-none">
        <h1 className="text-xs font-bold tracking-widest uppercase text-blue-400">AI Meme Studio PWA</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-white">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> GEMINI PRO ACTIVE
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 relative scrollbar-none">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-md",
              msg.role === 'assistant' ? "bg-gradient-to-tr from-blue-600 to-purple-600 text-white" : "bg-slate-700 text-slate-300"
            )}>
              {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={cn(
              "px-4 py-2 rounded-2xl max-w-[85%] text-sm",
              msg.role === 'user' 
                ? "bg-blue-600/20 text-blue-100 rounded-tr-none border border-blue-500/20" 
                : "bg-black/40 text-slate-200 rounded-tl-none border border-white/5"
            )}>
              {msg.role === 'assistant' ? (
                <div className="markdown-body prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 flex-row">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shrink-0 animate-pulse">
              <Bot size={18} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 text-gray-200 rounded-tl-none border border-white/5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl p-2 shadow-inner flex-none">
        <button 
          onClick={toggleListen}
          className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors", 
            isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-gradient-to-tr from-blue-600 to-purple-600 text-white"
          )}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
        <div className="flex-1 relative flex items-center">
           <input 
             type="text"
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
             placeholder="Saca la cara de esta persona estilo Pixar..."
             className="w-full bg-transparent text-slate-200 text-sm italic focus:outline-none placeholder:text-slate-500 px-2"
           />
        </div>
        <button 
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-500 shadow-lg shadow-blue-900/40 shrink-0 disabled:opacity-50 transition-colors"
        >
          <Send size={16} color="white" />
        </button>
      </div>
    </div>
  );
}

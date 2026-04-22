import React, { useState } from 'react';
import Chat from './components/Chat';
import MediaUploader from './components/MediaUploader';
import CanvasEditor from './components/CanvasEditor';

export default function App() {
  const [mediaLayers, setMediaLayers] = useState<string[]>([]);

  const handleImageReady = (dataUrl: string) => {
    setMediaLayers(prev => [...prev, dataUrl]);
  };

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden relative">
      
      {/* Background Glows */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] pointer-events-none z-0 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(64, 58, 253, 0.15) 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] pointer-events-none z-0 mix-blend-screen" style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)' }}></div>

      {/* Top Section: AI Chatbot */}
      <header className="flex-none h-auto sm:h-[140px] z-10 w-full relative">
        <Chat />
      </header>

      {/* Middle Section: Media Upload & Tools */}
      <section className="flex-none pb-2 sm:h-[120px] bg-[rgba(10,10,12,0.5)] z-10 w-full relative">
         <MediaUploader onImageReady={handleImageReady} />
      </section>

      {/* Bottom Section: Canvas Editor */}
      <main className="flex-1 w-full bg-[#15151a] relative z-10" style={{ background: 'radial-gradient(circle at center, #15151a 0%, #0a0a0c 100%)' }}>
         <CanvasEditor mediaLayers={mediaLayers} setMediaLayers={setMediaLayers} />
      </main>

      {/* Required Footer */}
      <footer className="h-[40px] w-full bg-[#050507] flex items-center justify-center px-6 border-t border-white/5 z-20">
        <p className="text-[9px] tracking-[0.05em] text-slate-400/60 font-sans uppercase text-center w-full">
          Un regalo para mi cuñado <span className="text-slate-400 font-bold">CAMILO GARCIA</span>. De parte de Armin Salazar, CEO de aiwis IA & TI. Versión 1.0 beta
        </p>
      </footer>
    </div>
  );
}

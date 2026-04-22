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
    <div className="flex flex-col h-full w-full mx-auto max-w-lg bg-background shdaow-2xl overflow-hidden relative sm:border-x sm:border-white/10">
      
      {/* Top Section: AI Chatbot */}
      <div className="flex-1 min-h-[30%] max-h-[40%] p-3 pb-1">
        <Chat />
      </div>

      {/* Middle Section: Media Upload & Tools */}
      <div className="px-3 py-2 z-10 w-full">
         <MediaUploader onImageReady={handleImageReady} />
      </div>

      {/* Bottom Section: Canvas Editor */}
      <div className="flex-[2] w-full p-3 pt-1 mb-[50px] relative">
         <CanvasEditor mediaLayers={mediaLayers} setMediaLayers={setMediaLayers} />
      </div>

      {/* Required Footer (Absolute bottom) */}
      <footer className="absolute bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-white/5 py-2 px-3 text-center z-50">
        <p className="text-[10px] text-gray-500 font-light tracking-wide leading-tight">
          Un regalo para mi cuñado CAMILO GARCIA.<br/>
          De parte de Armin Salazar, CEO de aiwis IA & TI. Versión 1.0 beta
        </p>
      </footer>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, Video, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MediaUploaderProps {
  onImageReady: (dataUrl: string) => void;
  className?: string;
}

export default function MediaUploader({ onImageReady, className }: MediaUploaderProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setVideoFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === 'string') {
        onImageReady(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset
  };

  const attemptExtractFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    onImageReady(dataUrl);
    setVideoFile(null); // Close video mode
  };

  return (
    <div className={cn("flex flex-col gap-2 h-full justify-center px-1", className)}>
      {videoFile ? (
        <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 p-2 text-center h-full flex flex-col">
          <p className="text-sm text-slate-300 mb-1">Busca el momento exacto y extrae el frame (ahorra memoria)</p>
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            controls
            className="w-full flex-1 min-h-0 object-contain rounded-lg bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex justify-center gap-4 mt-2">
            <button
              onClick={() => setVideoFile(null)}
              className="px-4 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors uppercase"
            >
              Cancelar
            </button>
            <button
              onClick={attemptExtractFrame}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors shadow-lg uppercase"
            >
              Extraer Frame
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Recursos y Carga</span>
          </div>
          <div className="flex w-full gap-2 overflow-hidden h-[70px]">
            {/* Subir archivo genérico (Imagen) */}
            <label className="flex-1 bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/5 hover:bg-slate-700 cursor-pointer transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-lg">🖼️</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">Galería</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                aria-label="Subir desde galería"
              />
            </label>

            {/* Subir video y extraer frame */}
            <label className="flex-1 bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/5 hover:bg-slate-700 cursor-pointer transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-lg">📼</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">Video</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleImageUpload}
                aria-label="Extraer frame de video"
              />
            </label>

            {/* Cámara nativa */}
            <label className="flex-1 bg-slate-800 rounded-lg flex flex-col items-center justify-center gap-1 border border-white/5 hover:bg-slate-700 cursor-pointer transition-colors shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <span className="text-lg">📷</span>
              <span className="text-[10px] uppercase font-bold text-slate-300">Cámara</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageUpload}
                aria-label="Abrir cámara"
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}

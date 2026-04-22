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
    <div className={cn("flex flex-col gap-3", className)}>
      {videoFile ? (
        <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10 p-2 text-center">
          <p className="text-sm text-gray-300 mb-2">Busca el momento exacto y extrae el frame (ahorra memoria)</p>
          <video
            ref={videoRef}
            src={URL.createObjectURL(videoFile)}
            controls
            className="w-full max-h-[300px] object-contain rounded-lg bg-black"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex justify-center gap-4 mt-3">
            <button
              onClick={() => setVideoFile(null)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={attemptExtractFrame}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-500 transition-colors shadow-lg"
            >
              Extraer Frame
            </button>
          </div>
        </div>
      ) : (
        <div className="flex max-w-full overflow-x-auto gap-3 pb-2 scrollbar-none snap-x snap-mandatory">
          {/* Subir archivo genérico (Imagen) */}
          <label className="flex-1 min-w-[100px] aspect-square flex flex-col items-center justify-center gap-2 bg-surface hover:bg-surface-hover rounded-2xl border border-white/10 cursor-pointer transition-colors snap-start focus-within:ring-2 focus-within:ring-primary">
            <ImageIcon className="w-8 h-8 text-blue-400" />
            <span className="text-xs font-medium text-gray-300">Galería</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Subir desde galería"
            />
          </label>

          {/* Subir video y extraer frame */}
          <label className="flex-1 min-w-[100px] aspect-square flex flex-col items-center justify-center gap-2 bg-surface hover:bg-surface-hover rounded-2xl border border-white/10 cursor-pointer transition-colors snap-start focus-within:ring-2 focus-within:ring-primary">
            <Video className="w-8 h-8 text-purple-400" />
            <span className="text-xs font-medium text-gray-300 text-center px-1">Video a Foto</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleImageUpload}
              aria-label="Extraer frame de video"
            />
          </label>

          {/* Cámara nativa */}
          <label className="flex-1 min-w-[100px] aspect-square flex flex-col items-center justify-center gap-2 bg-surface hover:bg-surface-hover rounded-2xl border border-white/10 cursor-pointer transition-colors snap-start focus-within:ring-2 focus-within:ring-primary">
            <Camera className="w-8 h-8 text-pink-400" />
            <span className="text-xs font-medium text-gray-300">Cámara</span>
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
      )}
    </div>
  );
}

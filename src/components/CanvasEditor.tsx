import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer, Text } from 'react-konva';
import useImage from 'use-image';
import { Download, Share2, Trash2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CanvasEditorProps {
  mediaLayers: string[]; // array of base64 images
  setMediaLayers: React.Dispatch<React.SetStateAction<string[]>>;
}

const ImageNode = ({ 
  src, 
  isSelected, 
  onSelect, 
  onChange,
  onDelete
}: any) => {
  const [image] = useImage(src);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // trRef.current.nodes([shapeRef.current]);
      // trRef.current.getLayer().batchDraw();
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (!image) return null;

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        image={image}
        draggable
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // Reset internal scaling since it affects stroke widths etc
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
        // default position/size bounds
        width={300}
        height={(image.height / image.width) * 300}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function CanvasEditor({ mediaLayers, setMediaLayers }: CanvasEditorProps) {
  const [selectedId, selectShape] = useState<number | null>(null);
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Resize observer to keep the canvas filling the area nicely
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  const deleteSelected = () => {
    if (selectedId !== null) {
      const newLayers = [...mediaLayers];
      newLayers.splice(selectedId, 1);
      setMediaLayers(newLayers);
      selectShape(null);
    }
  };

  const handleExport = () => {
    if(!stageRef.current) return;
    // ensure no transformer is shown
    selectShape(null); 
    setTimeout(() => {
       const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
       downloadURI(uri, 'meme-studio-export.png');
    }, 100);
  };
  
  const downloadURI = (uri: string, name: string) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if(!stageRef.current) return;
    selectShape(null);
    setTimeout(async () => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
      if (navigator.share) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const file = new File([blob], 'armin-meme.png', { type: 'image/png' });
          await navigator.share({
            title: 'Mi Obra Maestra con IA',
            text: '¡Mira lo que creé con MemeStudio IA Beta!',
            files: [file]
          });
        } catch (error) {
          console.error("Error al compartir", error);
        }
      } else {
        alert("Web Share API no soportada en este navegador, usa el botón descargar.");
      }
    }, 100);
  };

  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Editor Controls Bar */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {selectedId !== null && (
          <button onClick={deleteSelected} className="p-3 bg-red-500/20 text-red-500 rounded-full backdrop-blur hover:bg-red-500/40 shadow-lg border border-white/10 transition-colors">
            <Trash2 size={20} />
          </button>
        )}
        <button onClick={handleExport} className="p-3 bg-surface text-gray-200 rounded-full backdrop-blur hover:bg-surface-hover shadow-lg border border-white/10 transition-colors">
          <Download size={20} />
        </button>
        <button onClick={handleShare} className="p-3 bg-primary text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors">
          <Share2 size={20} />
        </button>
      </div>

      <div className="flex-1 bg-black rounded-lg overflow-hidden border border-white/5 shadow-inner" ref={containerRef}>
        {stageSize.width > 0 && (
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            ref={stageRef}
          >
            <Layer>
              {/* Background instructions if empty */}
              {mediaLayers.length === 0 && (
                <Text
                  text="Agrega imágenes desde la galería o la cámara. Usa el chat de IA para que Armin te de ideas."
                  x={20}
                  y={stageSize.height / 2 - 20}
                  width={stageSize.width - 40}
                  fontSize={16}
                  fill="rgba(255,255,255,0.4)"
                  align="center"
                />
              )}
              {mediaLayers.map((layer, i) => (
                <ImageNode
                  key={i}
                  src={layer}
                  isSelected={i === selectedId}
                  onSelect={() => selectShape(i)}
                  onChange={(newAttrs: any) => {
                    // Update bounds logic could be kept in state here if complex saving is needed
                  }}
                />
              ))}
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  );
}

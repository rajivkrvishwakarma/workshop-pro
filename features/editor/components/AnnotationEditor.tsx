import { EditorCanvas } from './EditorCanvas';
import { EditorToolbar } from './EditorToolbar';
import { useEditorContext as useEditorStore } from '../store/EditorContext';
import { Maximize2, Minus, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface AnnotationEditorProps {
  imageUrl?: string;
  className?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  unit?: string;
  holfass?: {
    side: 'none' | 'left' | 'right' | 'both';
    left: { top: number | ''; middle: number | ''; bottom: number | '' };
    right: { top: number | ''; middle: number | ''; bottom: number | '' };
  };
  kabja?: 'none' | 'left' | 'right';
  hasVentilator?: boolean;
  ventilatorImageUrl?: string;
  readOnly?: boolean;
  onViewFullScreen?: () => void;
}

export function AnnotationEditor({ imageUrl, className = '', canvasWidth, canvasHeight, unit, holfass, kabja, hasVentilator, ventilatorImageUrl, readOnly = false, onViewFullScreen }: AnnotationEditorProps) {
  const { scale, setScale, setPosition, undo, redo } = useEditorStore((state) => state);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const handleZoomIn = () => setScale(Math.min(10, scale * 1.2));
  const handleZoomOut = () => setScale(Math.max(0.1, scale / 1.2));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={`relative w-full h-full flex flex-col ${className}`}>
      {!readOnly && <EditorToolbar />}
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex flex-col items-center gap-1 bg-background/95 backdrop-blur shadow-md border rounded-lg p-1 z-50">
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={handleZoomIn} title="Zoom In">
          <Plus className="w-4 h-4" />
        </Button>
        <div className="h-px w-4 bg-border my-1"></div>
        <span className="text-xs font-medium text-center text-foreground py-1">
          {Math.round(scale * 100)}%
        </span>
        <div className="h-px w-4 bg-border my-1"></div>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={handleZoomOut} title="Zoom Out">
          <Minus className="w-4 h-4" />
        </Button>
        <div className="h-px w-4 bg-border my-1"></div>
        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={handleReset} title="Reset View">
          <Maximize2 className="w-4 h-4" />
        </Button>
        {onViewFullScreen && (
          <>
            <div className="h-px w-4 bg-border my-1"></div>
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-md" onClick={onViewFullScreen} title="View Full Screen">
              <Eye className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      <EditorCanvas imageUrl={imageUrl} canvasWidth={canvasWidth} canvasHeight={canvasHeight} unit={unit} holfass={holfass} kabja={kabja} hasVentilator={hasVentilator} ventilatorImageUrl={ventilatorImageUrl} />
    </div>
  );
}

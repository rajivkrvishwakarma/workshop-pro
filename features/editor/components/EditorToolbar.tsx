import { 
  MousePointer2, 
  Hand, 
  Pen, 
  Minus, 
  ArrowRight, 
  Square, 
  Circle, 
  Ruler, 
  Eraser,
  Undo2,
  Redo2,
  Download
} from 'lucide-react';
import { useEditorContext as useEditorStore } from '../store/EditorContext';

const TOOLS: { id: ToolType; icon: React.ReactNode; label: string }[] = [
  { id: 'select', icon: <MousePointer2 className="w-4 h-4" />, label: 'Select' },
  { id: 'pan', icon: <Hand className="w-4 h-4" />, label: 'Pan (Space)' },
  { id: 'pen', icon: <Pen className="w-4 h-4" />, label: 'Draw' },
  { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
  { id: 'arrow', icon: <ArrowRight className="w-4 h-4" />, label: 'Arrow' },
  { id: 'rect', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
  { id: 'dimension', icon: <Ruler className="w-4 h-4" />, label: 'Dimension' },
  { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
];

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'];

export function EditorToolbar() {
  const { tool, setTool, strokeColor, setStrokeColor, undo, redo, historyIndex, history, stageRef } = useEditorStore();
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleExport = () => {
    if (!stageRef) return;
    const uri = stageRef.toDataURL({ mimeType: 'image/png', quality: 1, pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'annotation-export.png';
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50">
      <div className="flex items-center gap-1 bg-background/95 backdrop-blur shadow-md border rounded-lg p-1 max-w-[95vw] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-1 border-r pr-1 mr-1">
          <button onClick={undo} disabled={!canUndo} className={`p-2 rounded-md transition-colors ${canUndo ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`} title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
          <button onClick={redo} disabled={!canRedo} className={`p-2 rounded-md transition-colors ${canRedo ? 'text-muted-foreground hover:bg-muted hover:text-foreground' : 'text-muted-foreground/30 cursor-not-allowed'}`} title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>
        </div>
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={`p-2 rounded-md transition-colors ${
              tool === t.id 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t.icon}
          </button>
        ))}
        <div className="flex items-center border-l pl-1 ml-1">
          <button onClick={handleExport} className="p-2 rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground" title="Export as PNG"><Download className="w-4 h-4" /></button>
        </div>
      </div>

      {['pen', 'line', 'arrow', 'rect', 'circle', 'dimension'].includes(tool) && (
        <div className="flex items-center gap-2 bg-background/95 backdrop-blur shadow-md border rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-2">
          {COLORS.map(c => (
             <button 
               key={c}
               onClick={() => setStrokeColor(c)}
               className={`w-5 h-5 rounded-full border-2 transition-transform ${strokeColor === c ? 'border-primary scale-110 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'}`}
               style={{ backgroundColor: c }}
               title={`Color: ${c}`}
             />
           ))}
        </div>
      )}
    </div>
  );
}

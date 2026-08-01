import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text, Group, Arrow, Image } from 'react-konva';
import useImage from 'use-image';
import { KonvaEventObject } from 'konva/lib/Node';
import { useEditorContext as useEditorStore } from '../store/EditorContext';
import { BackgroundLayer } from './BackgroundLayer';
import { DrawingLayer } from './DrawingLayer';
import { v4 as uuidv4 } from 'uuid';
import { EditorElement } from '../types';

interface EditorCanvasProps {
  imageUrl?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  unit?: string;
  holfass?: any;
  kabja?: 'none' | 'left' | 'right';
  hasVentilator?: boolean;
  ventilatorImageUrl?: string;
}

function BoundsLayer({ canvasWidth, canvasHeight, unit = 'inch', imageUrl, holfass, kabja, hasVentilator, ventilatorImageUrl }: { canvasWidth: number; canvasHeight: number; unit?: string; imageUrl?: string; holfass?: any, kabja?: 'none'|'left'|'right', hasVentilator?: boolean, ventilatorImageUrl?: string }) {
  const [image] = useImage(imageUrl || '');
  const [ventImage] = useImage(ventilatorImageUrl || '');

  if (!canvasWidth && !canvasHeight && !image) return null;
  
  const displayWidth = image ? image.width : canvasWidth;
  const displayHeight = image ? image.height : canvasHeight;
  
  return (
    <Layer listening={false}>
      <Rect
        x={0}
        y={0}
        width={displayWidth}
        height={displayHeight}
        stroke="#3b82f6"
        strokeWidth={3}
        dash={[8, 8]}
        opacity={0.5}
      />
      
      {/* Bottom Dimension (Width) */}
      {canvasWidth > 0 && (
        <Group>
          <Arrow
            points={[0, displayHeight + 30, displayWidth, displayHeight + 30]}
            stroke="#3b82f6"
            strokeWidth={2}
            pointerLength={12}
            pointerWidth={12}
            pointerAtBothEnds={true}
          />
          <Text
            x={0}
            y={displayHeight + 40}
            width={displayWidth}
            text={`${canvasWidth} ${unit}`}
            fontSize={30}
            fontStyle="bold"
            fill="#3b82f6"
            align="center"
          />
        </Group>
      )}

      {/* Left Dimension (Height) */}
      {canvasHeight > 0 && (
        <Group>
          <Arrow
            points={[-40, 0, -40, displayHeight]}
            stroke="#3b82f6"
            strokeWidth={2}
            pointerLength={12}
            pointerWidth={12}
            pointerAtBothEnds={true}
          />
          <Text
            x={-80}
            y={displayHeight}
            width={displayHeight}
            text={`${canvasHeight} ${unit}`}
            fontSize={30}
            fontStyle="bold"
            fill="#3b82f6"
            align="center"
            rotation={-90}
          />
        </Group>
      )}

      {/* Holfass Left */}
      {(holfass?.side === 'left' || holfass?.side === 'both') && (
        <Group>
          {Number(holfass.left?.top) > 0 && (
            <Group>
              <Arrow points={[0, 40, -120, 40]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={-280} y={15} width={150} text={`${holfass.left.top} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="right" />
            </Group>
          )}
          {Number(holfass.left?.middle) > 0 && (
            <Group>
              <Arrow points={[0, displayHeight / 2, -120, displayHeight / 2]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={-280} y={displayHeight / 2 - 20} width={150} text={`${holfass.left.middle} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="right" />
            </Group>
          )}
          {Number(holfass.left?.bottom) > 0 && (
            <Group>
              <Arrow points={[0, displayHeight - 40, -120, displayHeight - 40]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={-280} y={displayHeight - 65} width={150} text={`${holfass.left.bottom} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="right" />
            </Group>
          )}
        </Group>
      )}

      {/* Holfass Right */}
      {(holfass?.side === 'right' || holfass?.side === 'both') && (
        <Group>
          {Number(holfass.right?.top) > 0 && (
            <Group>
              <Arrow points={[displayWidth, 40, displayWidth + 120, 40]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={displayWidth + 130} y={15} width={150} text={`${holfass.right.top} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="left" />
            </Group>
          )}
          {Number(holfass.right?.middle) > 0 && (
            <Group>
              <Arrow points={[displayWidth, displayHeight / 2, displayWidth + 120, displayHeight / 2]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={displayWidth + 130} y={displayHeight / 2 - 20} width={150} text={`${holfass.right.middle} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="left" />
            </Group>
          )}
          {Number(holfass.right?.bottom) > 0 && (
            <Group>
              <Arrow points={[displayWidth, displayHeight - 40, displayWidth + 120, displayHeight - 40]} stroke="#f59e0b" strokeWidth={2} pointerLength={12} pointerWidth={12} />
              <Text x={displayWidth + 130} y={displayHeight - 65} width={150} text={`${holfass.right.bottom} ${unit}`} fontSize={24} fontStyle="bold" fill="#f59e0b" align="left" />
            </Group>
          )}
        </Group>
      )}
      {/* Kabja (Hinges) Rendering */}
      {kabja === 'left' && (
        <Group x={-8}>
          <Rect y={displayHeight * 0.15} width={8} height={40} fill="#4b5563" cornerRadius={2} />
          <Rect y={displayHeight * 0.5 - 20} width={8} height={40} fill="#4b5563" cornerRadius={2} />
          <Rect y={displayHeight * 0.85 - 40} width={8} height={40} fill="#4b5563" cornerRadius={2} />
        </Group>
      )}
      {kabja === 'right' && (
        <Group x={displayWidth}>
          <Rect y={displayHeight * 0.15} width={8} height={40} fill="#4b5563" cornerRadius={2} />
          <Rect y={displayHeight * 0.5 - 20} width={8} height={40} fill="#4b5563" cornerRadius={2} />
          <Rect y={displayHeight * 0.85 - 40} width={8} height={40} fill="#4b5563" cornerRadius={2} />
        </Group>
      )}

      {/* Ventilator */}
      {hasVentilator && (
        <Group x={0} y={-displayHeight * 0.25 - 10}>
          {ventImage ? (
             <Image image={ventImage} width={displayWidth} height={displayHeight * 0.25} />
          ) : (
             <Rect width={displayWidth} height={displayHeight * 0.25} stroke="#3b82f6" strokeWidth={2} dash={[8, 8]} opacity={0.5} />
          )}
          <Text x={0} y={displayHeight * 0.25 / 2 - 15} width={displayWidth} text={`Ventilator`} fontSize={24} fontStyle="bold" fill="#3b82f6" align="center" opacity={0.5} />
        </Group>
      )}
    </Layer>
  );
}

export function EditorCanvas({ imageUrl, canvasWidth, canvasHeight, unit, holfass, kabja, hasVentilator, ventilatorImageUrl }: EditorCanvasProps) {
  const { scale, position, setScale, setPosition, tool, strokeColor, strokeWidth, addElement, updateElement, elements, getElements, setSelectedIds, setStageRef, commitHistory } = useEditorStore((state) => state);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const currentShapeId = useRef<string | null>(null);
  
  const [editingText, setEditingText] = useState<{ id?: string, x: number, y: number, text: string } | null>(null);

  const [image, status] = useImage(imageUrl || '');
  const [hasFitToView, setHasFitToView] = useState(false);

  useEffect(() => {
    const contentW = image ? image.width : (canvasWidth || 0);
    const contentH = image ? image.height : (canvasHeight || 0);
    const isReady = (image && status === 'loaded') || (!imageUrl && contentW > 0 && contentH > 0);

    if (isReady && !hasFitToView && dimensions.width > 0 && dimensions.height > 0) {
      const padding = 60;
      
      // Calculate the bounding box of the image + its surrounding annotations
      const minX = -120; // accounts for left dimensions and arrows
      const maxX = contentW + 160; // accounts for right holfass
      const minY = hasVentilator ? -contentH * 0.25 - 60 : -40; // accounts for ventilator at the top
      const maxY = contentH + 120; // accounts for bottom dimension texts
      
      const totalW = maxX - minX;
      const totalH = maxY - minY;
      
      const scaleX = (dimensions.width - padding * 2) / totalW;
      const scaleY = (dimensions.height - padding * 2) / totalH;
      const finalScale = Math.min(scaleX, scaleY);
      
      setScale(finalScale);
      setPosition({
        x: dimensions.width / 2 - (minX + totalW / 2) * finalScale,
        y: dimensions.height / 2 - (minY + totalH / 2) * finalScale
      });
      setHasFitToView(true);
    }
  }, [image, status, imageUrl, canvasWidth, canvasHeight, dimensions.width, dimensions.height, hasFitToView, setScale, setPosition, hasVentilator]);

  // Resize observer to make canvas responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getRelativePointerPosition = (stage: any) => {
    const pointer = stage.getPointerPosition();
    if (!pointer) return null;
    return {
      x: (pointer.x - stage.x()) / stage.scaleX(),
      y: (pointer.y - stage.y()) / stage.scaleY()
    };
  };

  const handlePointerDown = (e: KonvaEventObject<PointerEvent>) => {
    // If editing text, clicks should not start drawing
    if (editingText) return;

    // If clicking on empty stage in select mode, deselect all
    if (tool === 'select' && e.target === e.target.getStage()) {
      setSelectedIds([]);
      return;
    }

    if (tool === 'pan' || tool === 'select' || tool === 'eraser') return;
    
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    setIsDrawing(true);
    const id = uuidv4();
    currentShapeId.current = id;

    if (tool === 'pen' || tool === 'line' || tool === 'arrow' || tool === 'dimension') {
      addElement({
        id,
        type: tool,
        x: 0, y: 0, 
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: strokeColor,
        strokeWidth,
        ...(tool === 'dimension' ? { unit: 'inch' } : {})
      } as EditorElement);
    } else if (tool === 'rect' || tool === 'circle') {
      addElement({
        id,
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        stroke: strokeColor,
        strokeWidth,
      } as EditorElement);
    }
  };

  const handlePointerMove = (e: KonvaEventObject<PointerEvent>) => {
    if (!isDrawing || !currentShapeId.current) return;
    
    const stage = e.target.getStage();
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const el = getElements().find((el) => el.id === currentShapeId.current);
    if (!el) return;

    if (tool === 'pen') {
      updateElement(el.id, { points: [...(el as any).points, pos.x, pos.y] });
    } else if (tool === 'line' || tool === 'arrow' || tool === 'dimension') {
      const p = (el as any).points;
      updateElement(el.id, { points: [p[0], p[1], pos.x, pos.y] });
    } else if (tool === 'rect') {
      updateElement(el.id, { width: pos.x - el.x, height: pos.y - el.y });
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(pos.x - el.x, 2) + Math.pow(pos.y - el.y, 2));
      updateElement(el.id, { radius });
    }
  };

  const handlePointerUp = () => {
    if (isDrawing) {
      commitHistory();
    }
    setIsDrawing(false);
    currentShapeId.current = null;
  };

  const handleDblClick = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    const clickedId = e.target.id();
    const existingElement = getElements().find(el => el.id === clickedId && el.type === 'text');

    if (existingElement) {
      setEditingText({
        id: existingElement.id,
        x: existingElement.x,
        y: existingElement.y,
        text: (existingElement as any).text || ''
      });
    } else {
      setEditingText({
        x: pos.x,
        y: pos.y,
        text: ''
      });
    }
  };

  const handleTextSubmit = () => {
    if (editingText && editingText.text.trim()) {
      if (editingText.id) {
        updateElement(editingText.id, { text: editingText.text } as any);
      } else {
        addElement({
          id: uuidv4(),
          type: 'text',
          x: editingText.x,
          y: editingText.y,
          text: editingText.text,
          stroke: strokeColor,
          strokeWidth: 1,
        } as any);
      }
      commitHistory();
    }
    setEditingText(null);
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    // Pan with trackpad or mouse wheel if not pressing ctrl/meta
    if (!e.evt.ctrlKey && !e.evt.metaKey) {
      setPosition({
        x: position.x - e.evt.deltaX,
        y: position.y - e.evt.deltaY,
      });
      return;
    }

    // Zoom
    const scaleBy = 1.05;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    // Limit scale
    if (newScale < 0.1 || newScale > 10) return;
    
    setScale(newScale);

    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const isDraggable = tool === 'pan';

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (e.target === e.target.getStage()) {
      setPosition({ x: e.target.x(), y: e.target.y() });
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-[#f8f9fa] overflow-hidden relative">
      <div className="absolute inset-0">
        <Stage
        ref={setStageRef}
        width={dimensions.width}
        height={dimensions.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={handleWheel}
        draggable={isDraggable}
        onDragMove={handleDragMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDblClick={handleDblClick}
        style={{ cursor: tool === 'pan' ? (isDraggable ? 'grabbing' : 'grab') : (tool === 'select' ? 'default' : 'crosshair') }}
      >
        <BackgroundLayer width={dimensions.width} height={dimensions.height} imageUrl={imageUrl} />
        {canvasWidth !== undefined && canvasHeight !== undefined && (
          <BoundsLayer canvasWidth={canvasWidth} canvasHeight={canvasHeight} unit={unit} imageUrl={imageUrl} holfass={holfass} kabja={kabja} hasVentilator={hasVentilator} ventilatorImageUrl={ventilatorImageUrl} />
        )}
        <DrawingLayer />
      </Stage>
      </div>

      {editingText && (
        <textarea
          autoFocus
          value={editingText.text}
          onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
          onBlur={handleTextSubmit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleTextSubmit();
            }
            if (e.key === 'Escape') {
              setEditingText(null);
            }
          }}
          style={{
            position: 'absolute',
            top: editingText.y * scale + position.y,
            left: editingText.x * scale + position.x,
            zIndex: 100,
            background: 'transparent',
            color: strokeColor,
            border: '2px dashed #ccc',
            outline: 'none',
            fontSize: `${30 * scale}px`,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
            padding: '4px',
            minWidth: '200px',
            minHeight: '60px',
            resize: 'none',
            borderRadius: '4px'
          }}
        />
      )}
    </div>
  );
}

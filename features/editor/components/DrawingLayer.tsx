import { Layer, Line, Rect, Circle, Arrow, Transformer, Group, Text } from 'react-konva';
import { useEditorContext as useEditorStore } from '../store/EditorContext';
import { useEffect, useRef } from 'react';
import { EditorElement } from '../types';
import Konva from 'konva';

export function DrawingLayer() {
  const { elements, selectedIds, setSelectedIds, updateElement, tool, deleteElement, commitHistory } = useEditorStore();
  const trRef = useRef<Konva.Transformer>(null);

  // Attach transformer to selected nodes
  useEffect(() => {
    if (tool !== 'select') {
      if (trRef.current) trRef.current.nodes([]);
      return;
    }

    if (trRef.current) {
      const stage = trRef.current.getStage();
      if (stage) {
        const selectedNodes = selectedIds.map(id => stage.findOne(`#${id}`)).filter(Boolean) as Konva.Node[];
        trRef.current.nodes(selectedNodes);
        trRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedIds, elements, tool]);

  const handleSelect = (e: any, id: string) => {
    if (tool === 'eraser') {
      deleteElement(id);
      commitHistory();
      return;
    }
    if (tool !== 'select') return;
    
    // Multi-select with shift
    if (e.evt.shiftKey) {
      setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(s => s !== id) : [...selectedIds, id]);
    } else {
      setSelectedIds([id]);
    }
  };

  const renderElement = (el: EditorElement) => {
    const commonProps = {
      id: el.id,
      x: el.x,
      y: el.y,
      rotation: el.rotation || 0,
      stroke: el.stroke,
      strokeWidth: el.strokeWidth,
      fill: el.fill,
      draggable: tool === 'select' && selectedIds.includes(el.id),
      onClick: (e: any) => handleSelect(e, el.id),
      onTap: (e: any) => handleSelect(e, el.id),
      onDragEnd: (e: any) => {
        updateElement(el.id, { x: e.target.x(), y: e.target.y() });
        commitHistory();
      },
      onTransformEnd: (e: any) => {
        const node = e.target;
        updateElement(el.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width: node.width() * node.scaleX(),
          height: node.height() * node.scaleY(),
        });
        node.scaleX(1);
        node.scaleY(1);
        commitHistory();
      }
    };

    switch (el.type) {
      case 'pen':
        return (
          <Line
            {...commonProps}
            points={(el as any).points}
            tension={0.5} // smooth curve
            lineCap="round"
            lineJoin="round"
            x={0} // pens points are absolute
            y={0}
          />
        );
      case 'line':
        return (
          <Line
            {...commonProps}
            points={(el as any).points}
            lineCap="round"
            lineJoin="round"
            x={0}
            y={0}
          />
        );
      case 'arrow':
        return (
          <Arrow
            {...commonProps}
            points={(el as any).points}
            pointerLength={10}
            pointerWidth={10}
            lineCap="round"
            lineJoin="round"
            x={0}
            y={0}
          />
        );
      case 'rect':
        return (
          <Rect
            {...commonProps}
            width={el.width || 0}
            height={el.height || 0}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={(el as any).radius || 0}
          />
        );
      case 'dimension': {
        const [x1, y1, x2, y2] = (el as any).points;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        return (
          <Group key={el.id} {...commonProps}>
            <Arrow
              points={[x1, y1, x2, y2]}
              stroke={el.stroke}
              strokeWidth={el.strokeWidth}
              pointerLength={10}
              pointerWidth={10}
              pointerAtBothEnds={true}
              lineCap="round"
              lineJoin="round"
            />
            {length > 20 && (
              <Text
                x={midX}
                y={midY - 25}
                text={`${Math.round(length)} ${(el as any).unit || 'inch'}`}
                fontSize={32}
                fontStyle="bold"
                fill={el.stroke}
                align="center"
                verticalAlign="middle"
                offsetX={30}
                rotation={angle > 90 || angle < -90 ? angle + 180 : angle}
              />
            )}
          </Group>
        );
      }
      case 'text':
        return (
          <Text
            {...commonProps}
            text={(el as any).text}
            fontSize={32}
            fontFamily="sans-serif"
            fontStyle="bold"
            fill={el.stroke}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layer>
      {elements.map(renderElement)}
      {tool === 'select' && (
        <Transformer 
          ref={trRef} 
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </Layer>
  );
}

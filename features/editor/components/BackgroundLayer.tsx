import { useMemo } from 'react';
import { Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { useEditorContext as useEditorStore } from '../store/EditorContext';

interface BackgroundLayerProps {
  width: number;
  height: number;
  imageUrl?: string;
}

export function BackgroundLayer({ width, height, imageUrl }: BackgroundLayerProps) {
  const { scale, position } = useEditorStore();
  const [image] = useImage(imageUrl || '');

  // Generate a tiny dot grid pattern in memory
  const gridPattern = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.arc(20, 20, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }, []);

  // We need the rect to cover the entire visible viewport.
  // Since the stage is scaled and panned, we inverse the transform to find the viewport bounds.
  // Wait, if the Rect is inside a scaled Layer, it will scale the pattern too.
  // To keep the pattern scale constant (like Excalidraw), we can keep the Rect unscaled,
  // or we can adjust the pattern offset. Let's just make an infinite rect and scale the pattern inversely.
  
  const viewportRect = {
    x: -position.x / scale,
    y: -position.y / scale,
    width: width / scale,
    height: height / scale,
  };

  return (
    <Layer>
      {/* Infinite Grid Background */}
      {gridPattern && (
        <Rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.width}
          height={viewportRect.height}
          fillPatternImage={gridPattern as any}
          fillPatternScale={{ x: 1 / scale, y: 1 / scale }}
          fillPatternOffset={{
            x: position.x,
            y: position.y,
          }}
          listening={false} // don't intercept events
        />
      )}

      {/* Reference Image */}
      {image && (
        <KonvaImage
          image={image}
          x={0}
          y={0}
          opacity={0.8}
          listening={false} // locked as background
        />
      )}
    </Layer>
  );
}

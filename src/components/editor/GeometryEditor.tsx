'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { GeometryToolbar, type GeometryTool } from './GeometryToolbar';
import { GeometryPropertiesPanel } from './GeometryPropertiesPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  Shape,
  CoordinateConfig,
  MathShape,
} from '@/lib/editor/shape-definitions';
import {
  createShape,
  createDefaultCoordinateConfig,
  isLineBasedShape,
} from '@/lib/editor/shape-definitions';

// Dynamic import to avoid SSR issues with Konva/react-konva
const KonvaCanvas = dynamic(() => import('./KonvaCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      Loading geometry canvas...
    </div>
  ),
});

interface GeometryEditorProps {
  width?: number;
  height?: number;
  shapes?: Shape[];
  onShapesChange?: (shapes: Shape[]) => void;
  coordinateConfig?: CoordinateConfig;
  onCoordinateConfigChange?: (config: CoordinateConfig) => void;
  editable?: boolean;
  onSave?: (shapes: Shape[]) => void;
}

export function GeometryEditor({
  width = 700,
  height = 450,
  shapes: initialShapes = [],
  onShapesChange,
  coordinateConfig: initialCoordConfig,
  onCoordinateConfigChange,
  editable = true,
  onSave,
}: GeometryEditorProps) {
  // CRITICAL: Use local state but sync with props via useEffect
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<GeometryTool>({ type: 'select' });
  const [coordConfig, setCoordConfig] = useState<CoordinateConfig>(
    initialCoordConfig || createDefaultCoordinateConfig()
  );
  const [drawingLine, setDrawingLine] = useState(false);
  const [lineStart, setLineStart] = useState<{ x: number; y: number } | null>(null);

  // Sync shapes from props when they change externally (e.g. dialog reset on open)
  useEffect(() => {
    setShapes(initialShapes);
  }, [initialShapes]);

  // Sync coordinate config from props
  useEffect(() => {
    if (initialCoordConfig) {
      setCoordConfig(initialCoordConfig);
    }
  }, [initialCoordConfig]);

  const selectedShape = shapes.find((s) => s.id === selectedShapeId) || null;

  const updateShapes = useCallback(
    (newShapes: Shape[]) => {
      setShapes(newShapes);
      onShapesChange?.(newShapes);
    },
    [onShapesChange]
  );

  const handleCoordinateConfigChange = useCallback(
    (partial: Partial<CoordinateConfig>) => {
      const updated = { ...coordConfig, ...partial };
      setCoordConfig(updated);
      onCoordinateConfigChange?.(updated);
    },
    [coordConfig, onCoordinateConfigChange]
  );

  const handleCanvasClick = useCallback(
    (x: number, y: number) => {
      if (!editable) return;

      if (activeTool.type === 'select') {
        setSelectedShapeId(null);
        return;
      }

      if (activeTool.type === 'delete') {
        if (selectedShapeId) {
          updateShapes(shapes.filter((s) => s.id !== selectedShapeId));
          setSelectedShapeId(null);
        }
        return;
      }

      if (activeTool.type === 'shape') {
        const { category, shapeType } = activeTool;

        // Handle line-based shapes with two clicks
        if (isLineBasedShape(shapeType)) {
          if (!drawingLine) {
            setDrawingLine(true);
            setLineStart({ x, y });
          } else {
            const newShape = createShape(
              shapeType,
              category,
              lineStart!.x,
              lineStart!.y
            ) as MathShape;
            newShape.x2 = x;
            newShape.y2 = y;
            updateShapes([...shapes, newShape]);
            setSelectedShapeId(newShape.id);
            setDrawingLine(false);
            setLineStart(null);
            setActiveTool({ type: 'select' });
          }
          return;
        }

        // Regular shapes: click to place
        const newShape = createShape(shapeType, category, x, y);
        updateShapes([...shapes, newShape]);
        setSelectedShapeId(newShape.id);
      }
    },
    [
      activeTool,
      shapes,
      selectedShapeId,
      editable,
      updateShapes,
      drawingLine,
      lineStart,
    ]
  );

  const handleSelectShape = useCallback((id: string | null) => {
    setSelectedShapeId(id);
  }, []);

  const handleUpdateShape = useCallback(
    (id: string, attrs: Partial<Shape>) => {
      updateShapes(shapes.map((s) => (s.id === id ? { ...s, ...attrs } : s)));
    },
    [shapes, updateShapes]
  );

  const handleDeleteShape = useCallback(
    (id: string) => {
      updateShapes(shapes.filter((s) => s.id !== id));
      setSelectedShapeId(null);
    },
    [shapes, updateShapes]
  );

  // Keyboard shortcut for delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        handleDeleteShape(selectedShapeId);
      }
      if (e.key === 'Escape') {
        setSelectedShapeId(null);
        setDrawingLine(false);
        setLineStart(null);
        setActiveTool({ type: 'select' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, handleDeleteShape]);

  const handleSave = useCallback(() => {
    onSave?.(shapes);
  }, [onSave, shapes]);

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <div className="flex flex-col lg:flex-row" style={{ minHeight: height }}>
        {/* Canvas */}
        <div className="flex-1 relative" style={{ minWidth: width * 0.5 }}>
          <KonvaCanvas
            width={width}
            height={height}
            shapes={shapes}
            selectedShapeId={selectedShapeId}
            coordinateConfig={coordConfig}
            onCanvasClick={handleCanvasClick}
            onSelectShape={handleSelectShape}
            onUpdateShape={handleUpdateShape}
            editable={editable}
            isDrawingLine={drawingLine}
            lineStart={lineStart}
          />

          {/* Save button (only when used standalone, not inside dialog) */}
          {onSave && editable && (
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          )}

          {/* Drawing line indicator */}
          {drawingLine && (
            <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md shadow-sm">
              Click to set line endpoint (Esc to cancel)
            </div>
          )}

          {/* Active tool indicator */}
          {activeTool.type === 'shape' && (
            <div className="absolute bottom-2 left-2 z-10 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md shadow-sm">
              Click on canvas to place shape
            </div>
          )}
        </div>

        {/* Right panel - Toolbar + Properties */}
        {editable && (
          <div className="w-full lg:w-64 border-l bg-muted/20 flex flex-col shrink-0 overflow-hidden">
            <ScrollArea className="flex-1 lg:max-h-[40vh]">
              <GeometryToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
              />
            </ScrollArea>
            <div className="border-t overflow-y-auto lg:max-h-[50vh]">
              <GeometryPropertiesPanel
                shape={selectedShape}
                coordinateConfig={coordConfig}
                onUpdate={handleUpdateShape}
                onDelete={handleDeleteShape}
                onCoordinateConfigChange={handleCoordinateConfigChange}
                showCoordinateSettings
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeometryEditor;

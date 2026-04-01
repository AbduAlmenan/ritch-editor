'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pentagon, Grid3X3, Loader2 } from 'lucide-react';
import type {
  Shape,
  CoordinateConfig,
} from '@/lib/editor/shape-definitions';
import {
  createDefaultCoordinateConfig,
} from '@/lib/editor/shape-definitions';
import { GeometryEditor } from './GeometryEditor';

export interface GeometryEditorSaveData {
  shapes: Shape[];
  coordinateConfig: CoordinateConfig;
  width: number;
  height: number;
}

interface GeometryEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: GeometryEditorSaveData) => void;
  /** When true, Z-axis and full coordinate system is pre-enabled */
  showCoordinateSystem?: boolean;
}

export function GeometryEditorDialog({
  open,
  onOpenChange,
  onSave,
  showCoordinateSystem = false,
}: GeometryEditorDialogProps) {
  // Use refs to avoid stale state issues
  const shapesRef = useRef<Shape[]>([]);
  const coordConfigRef = useRef<CoordinateConfig>(createDefaultCoordinateConfig());
  const [, setTick] = useState(0);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      const defaultConfig = createDefaultCoordinateConfig();
      if (showCoordinateSystem) {
        defaultConfig.showZAxis = true;
        defaultConfig.showAxes = true;
        defaultConfig.showGrid = true;
        defaultConfig.showLabels = true;
        defaultConfig.showTickMarks = true;
        defaultConfig.showOrigin = true;
        defaultConfig.showAxisArrows = true;
      }
      shapesRef.current = [];
      coordConfigRef.current = defaultConfig;
      // Force re-render by incrementing tick
      setTick((t) => t + 1);
    }
  }, [open, showCoordinateSystem]);

  const handleShapesChange = useCallback((newShapes: Shape[]) => {
    shapesRef.current = newShapes;
  }, []);

  const handleCoordinateConfigChange = useCallback((newConfig: CoordinateConfig) => {
    coordConfigRef.current = newConfig;
  }, []);

  const handleSave = useCallback(() => {
    onSave({
      shapes: shapesRef.current,
      coordinateConfig: coordConfigRef.current,
      width: 700,
      height: 450,
    });
    onOpenChange(false);
  }, [onSave, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Key to force GeometryEditor to reset when dialog re-opens
  const editorKey = open ? Date.now() : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-2 shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {showCoordinateSystem ? (
              <Grid3X3 className="h-5 w-5" />
            ) : (
              <Pentagon className="h-5 w-5" />
            )}
            {showCoordinateSystem
              ? 'XYZ Coordinate System & Geometry Editor'
              : 'Geometry Canvas Editor'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0 px-2 pb-2">
          <Suspense fallback={
            <div className="flex items-center justify-center h-[450px] gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading geometry editor...
            </div>
          }>
            <GeometryEditor
              key={editorKey}
              width={700}
              height={450}
              shapes={shapesRef.current}
              onShapesChange={handleShapesChange}
              coordinateConfig={coordConfigRef.current}
              onCoordinateConfigChange={handleCoordinateConfigChange}
              editable={true}
            />
          </Suspense>
        </div>

        <DialogFooter className="px-6 py-3 shrink-0 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Insert into Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default GeometryEditorDialog;

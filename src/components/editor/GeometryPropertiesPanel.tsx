'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
  Shape,
  MathShape,
  PhysicsShape,
  CoordinateConfig,
} from '@/lib/editor/shape-definitions';
import {
  isLineBasedShape,
  hasWidthHeight,
  hasRadius,
  hasMagnitudeDirection,
  hasSides,
  getShapeDisplayName,
} from '@/lib/editor/shape-definitions';

interface GeometryPropertiesPanelProps {
  shape: Shape | null;
  coordinateConfig: CoordinateConfig;
  onUpdate: (id: string, attrs: Partial<Shape>) => void;
  onDelete: (id: string) => void;
  onCoordinateConfigChange: (config: Partial<CoordinateConfig>) => void;
  showCoordinateSettings?: boolean;
}

export function GeometryPropertiesPanel({
  shape,
  coordinateConfig,
  onUpdate,
  onDelete,
  onCoordinateConfigChange,
  showCoordinateSettings = false,
}: GeometryPropertiesPanelProps) {
  if (!shape && !showCoordinateSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
        <p className="text-sm">Select a shape to edit its properties</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Shape Properties */}
        {shape && (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {getShapeDisplayName(shape.type)}
              </h3>
              <button
                onClick={() => onDelete(shape.id)}
                className="text-xs text-destructive hover:underline"
              >
                Delete
              </button>
            </div>

            <Separator />

            {/* Position */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Position
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={Math.round(shape.x)}
                    onChange={(e) =>
                      onUpdate(shape.id, { x: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={Math.round(shape.y)}
                    onChange={(e) =>
                      onUpdate(shape.id, { y: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Size */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Size
              </h4>

              {hasWidthHeight(shape.type) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Width</Label>
                    <Input
                      type="number"
                      value={Math.round((shape as MathShape).width || 0)}
                      onChange={(e) =>
                        onUpdate(shape.id, {
                          width: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={Math.round((shape as MathShape).height || 0)}
                      onChange={(e) =>
                        onUpdate(shape.id, {
                          height: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {hasRadius(shape.type) && (
                <div className="space-y-1">
                  <Label className="text-xs">Radius</Label>
                  <Input
                    type="number"
                    value={Math.round((shape as MathShape).radius || 0)}
                    onChange={(e) =>
                      onUpdate(shape.id, {
                        radius: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {hasSides(shape.type) && (
                <div className="space-y-1">
                  <Label className="text-xs">Sides</Label>
                  <Input
                    type="number"
                    min={3}
                    max={12}
                    value={(shape as MathShape).sides || 6}
                    onChange={(e) =>
                      onUpdate(shape.id, {
                        sides: parseInt(e.target.value) || 6,
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              )}

              {hasMagnitudeDirection(shape.type) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Magnitude</Label>
                    <Input
                      type="number"
                      value={Math.round((shape as PhysicsShape).magnitude || 0)}
                      onChange={(e) =>
                        onUpdate(shape.id, {
                          magnitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Direction (°)</Label>
                    <Input
                      type="number"
                      value={Math.round(shape.rotation)}
                      onChange={(e) =>
                        onUpdate(shape.id, {
                          rotation: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {isLineBasedShape(shape.type) &&
                (shape as MathShape).x2 !== undefined && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">X₂</Label>
                      <Input
                        type="number"
                        value={Math.round((shape as MathShape).x2 || 0)}
                        onChange={(e) =>
                          onUpdate(shape.id, {
                            x2: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Y₂</Label>
                      <Input
                        type="number"
                        value={Math.round((shape as MathShape).y2 || 0)}
                        onChange={(e) =>
                          onUpdate(shape.id, {
                            y2: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                )}
            </div>

            <Separator />

            {/* Rotation */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Rotation
              </h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Angle</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(shape.rotation)}°
                  </span>
                </div>
                <Slider
                  value={[shape.rotation]}
                  onValueChange={([v]) => onUpdate(shape.id, { rotation: v })}
                  min={0}
                  max={360}
                  step={1}
                />
              </div>
            </div>

            <Separator />

            {/* Appearance */}
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Appearance
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Fill</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        shape.fillColor === 'transparent'
                          ? '#ffffff'
                          : shape.fillColor
                      }
                      onChange={(e) =>
                        onUpdate(shape.id, { fillColor: e.target.value })
                      }
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <button
                      className="text-xs text-muted-foreground underline"
                      onClick={() =>
                        onUpdate(shape.id, { fillColor: 'transparent' })
                      }
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Stroke</Label>
                  <input
                    type="color"
                    value={shape.strokeColor}
                    onChange={(e) =>
                      onUpdate(shape.id, { strokeColor: e.target.value })
                    }
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Stroke Width</Label>
                  <span className="text-xs text-muted-foreground">
                    {shape.strokeWidth}px
                  </span>
                </div>
                <Slider
                  value={[shape.strokeWidth]}
                  onValueChange={([v]) => onUpdate(shape.id, { strokeWidth: v })}
                  min={0}
                  max={10}
                  step={0.5}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(shape.opacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[shape.opacity]}
                  onValueChange={([v]) => onUpdate(shape.id, { opacity: v })}
                  min={0.1}
                  max={1}
                  step={0.05}
                />
              </div>
            </div>

            <Separator />

            {/* Label */}
            <div className="space-y-1">
              <Label className="text-xs">Label</Label>
              <Input
                value={shape.label || ''}
                onChange={(e) =>
                  onUpdate(shape.id, { label: e.target.value })
                }
                placeholder="Add label..."
                className="h-8 text-xs"
              />
            </div>

            <Separator />
          </>
        )}

        {/* Coordinate Settings */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-10" />
            </svg>
            Coordinate System
          </h4>

          {/* Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Grid</Label>
              <Switch
                checked={coordinateConfig.showGrid}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showGrid: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Minor Grid</Label>
              <Switch
                checked={coordinateConfig.showMinorGrid}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showMinorGrid: v })
                }
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Grid Spacing</Label>
                <span className="text-xs text-muted-foreground">
                  {coordinateConfig.gridSpacing}px
                </span>
              </div>
              <Slider
                value={[coordinateConfig.gridSpacing]}
                onValueChange={([v]) =>
                  onCoordinateConfigChange({ gridSpacing: v })
                }
                min={20}
                max={80}
                step={5}
              />
            </div>
          </div>

          <Separator />

          {/* Axes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Axes</Label>
              <Switch
                checked={coordinateConfig.showAxes}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showAxes: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Tick Marks</Label>
              <Switch
                checked={coordinateConfig.showTickMarks}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showTickMarks: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Number Labels</Label>
              <Switch
                checked={coordinateConfig.showLabels}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showLabels: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Axis Arrows</Label>
              <Switch
                checked={coordinateConfig.showAxisArrows}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showAxisArrows: v })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Origin "O"</Label>
              <Switch
                checked={coordinateConfig.showOrigin}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showOrigin: v })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Z-Axis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Z-Axis</Label>
              <Switch
                checked={coordinateConfig.showZAxis}
                onCheckedChange={(v) =>
                  onCoordinateConfigChange({ showZAxis: v })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Axis Colors */}
          <div className="space-y-2">
            <Label className="text-xs">Axis Colors</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] text-red-600">X</Label>
                <input
                  type="color"
                  value={coordinateConfig.xAxisColor}
                  onChange={(e) =>
                    onCoordinateConfigChange({ xAxisColor: e.target.value })
                  }
                  className="w-full h-7 rounded border cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-green-600">Y</Label>
                <input
                  type="color"
                  value={coordinateConfig.yAxisColor}
                  onChange={(e) =>
                    onCoordinateConfigChange({ yAxisColor: e.target.value })
                  }
                  className="w-full h-7 rounded border cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-blue-600">Z</Label>
                <input
                  type="color"
                  value={coordinateConfig.zAxisColor}
                  onChange={(e) =>
                    onCoordinateConfigChange({ zAxisColor: e.target.value })
                  }
                  className="w-full h-7 rounded border cursor-pointer"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Axis Labels */}
          <div className="space-y-2">
            <Label className="text-xs">Axis Names</Label>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">X Name</Label>
                <Input
                  value={coordinateConfig.xLabel}
                  onChange={(e) =>
                    onCoordinateConfigChange({ xLabel: e.target.value })
                  }
                  className="h-7 text-xs"
                  maxLength={3}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Y Name</Label>
                <Input
                  value={coordinateConfig.yLabel}
                  onChange={(e) =>
                    onCoordinateConfigChange({ yLabel: e.target.value })
                  }
                  className="h-7 text-xs"
                  maxLength={3}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Z Name</Label>
                <Input
                  value={coordinateConfig.zLabel}
                  onChange={(e) =>
                    onCoordinateConfigChange({ zLabel: e.target.value })
                  }
                  className="h-7 text-xs"
                  maxLength={3}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Origin Label</Label>
              <Input
                value={coordinateConfig.originLabel}
                onChange={(e) =>
                  onCoordinateConfigChange({ originLabel: e.target.value })
                }
                className="h-7 text-xs"
                maxLength={3}
              />
            </div>
          </div>

          <Separator />

          {/* Axis dimensions */}
          <div className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Axis Width</Label>
                <span className="text-xs text-muted-foreground">
                  {coordinateConfig.axisWidth}px
                </span>
              </div>
              <Slider
                value={[coordinateConfig.axisWidth]}
                onValueChange={([v]) =>
                  onCoordinateConfigChange({ axisWidth: v })
                }
                min={0.5}
                max={4}
                step={0.5}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label className="text-xs">Label Size</Label>
                <span className="text-xs text-muted-foreground">
                  {coordinateConfig.labelFontSize}px
                </span>
              </div>
              <Slider
                value={[coordinateConfig.labelFontSize]}
                onValueChange={([v]) =>
                  onCoordinateConfigChange({ labelFontSize: v })
                }
                min={8}
                max={16}
                step={1}
              />
            </div>
          </div>

          <Separator />

          {/* Grid Colors */}
          <div className="space-y-2">
            <Label className="text-xs">Grid Colors</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Grid</Label>
                <input
                  type="color"
                  value={coordinateConfig.gridColor}
                  onChange={(e) =>
                    onCoordinateConfigChange({ gridColor: e.target.value })
                  }
                  className="w-full h-7 rounded border cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Minor Grid</Label>
                <input
                  type="color"
                  value={coordinateConfig.minorGridColor}
                  onChange={(e) =>
                    onCoordinateConfigChange({
                      minorGridColor: e.target.value,
                    })
                  }
                  className="w-full h-7 rounded border cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default GeometryPropertiesPanel;

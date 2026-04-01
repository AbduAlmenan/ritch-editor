'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Ellipse,
  Line,
  RegularPolygon,
  Text,
  Arrow,
  Transformer,
} from 'react-konva';
import type Konva from 'konva';
import type {
  Shape,
  CoordinateConfig,
  MathShape,
  PhysicsShape,
} from '@/lib/editor/shape-definitions';
import { isLineBasedShape, getForceColor } from '@/lib/editor/shape-definitions';

interface KonvaCanvasProps {
  width: number;
  height: number;
  shapes: Shape[];
  selectedShapeId: string | null;
  coordinateConfig: CoordinateConfig;
  onCanvasClick: (x: number, y: number) => void;
  onSelectShape: (id: string | null) => void;
  onUpdateShape: (id: string, attrs: Partial<Shape>) => void;
  editable: boolean;
  isDrawingLine: boolean;
  lineStart: { x: number; y: number } | null;
}

export default function KonvaCanvas({
  width,
  height,
  shapes,
  selectedShapeId,
  coordinateConfig,
  onCanvasClick,
  onSelectShape,
  onUpdateShape,
  editable,
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width, height });
  const shapeRefs = useRef<Record<string, any>>({});
  const transformerRef = useRef<Konva.Transformer>(null);

  // Responsive sizing
  useEffect(() => {
    const updateSize = () => {
      if (stageRef.current) {
        const container = stageRef.current.container().parentElement;
        if (container) {
          const w = Math.min(container.clientWidth, width);
          setStageSize({ width: w, height });
        }
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  // Update transformer when selection changes
  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;
    const stage = stageRef.current;
    if (!stage) return;

    if (selectedShapeId) {
      const node = shapeRefs.current[selectedShapeId];
      if (node) {
        tr.nodes([node]);
        tr.getLayer()?.batchDraw();
        return;
      }
    }
    tr.nodes([]);
    tr.getLayer()?.batchDraw();
  }, [selectedShapeId, shapes]);

  const handleStageClick = useCallback(
    (e: any) => {
      if (
        e.target === e.target.getStage() ||
        e.target.name() === 'grid' ||
        e.target.name() === 'axis'
      ) {
        onSelectShape(null);
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos && editable) {
          onCanvasClick(pos.x, pos.y);
        }
      }
    },
    [editable, onCanvasClick, onSelectShape]
  );

  const handleShapeClick = useCallback(
    (id: string, e: any) => {
      e.cancelBubble = true;
      onSelectShape(id);
    },
    [onSelectShape]
  );

  const handleDragEnd = useCallback(
    (id: string, e: any) => {
      onUpdateShape(id, {
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    [onUpdateShape]
  );

  const handleTransformEnd = useCallback(
    (id: string, e: any) => {
      const node = e.target;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const attrs: Partial<Shape> = {
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
      };

      const shape = shapes.find((s) => s.id === id);
      if (shape && isLineBasedShape(shape.type)) {
        const dx = (shape as MathShape).x2! - shape.x;
        const dy = (shape as MathShape).y2! - shape.y;
        attrs.x2 = shape.x + dx * scaleX;
        attrs.y2 = shape.y + dy * scaleY;
      }

      onUpdateShape(id, attrs);
    },
    [shapes, onUpdateShape]
  );

  const registerShapeRef = useCallback((id: string, node: any) => {
    if (node) {
      shapeRefs.current[id] = node;
    } else {
      delete shapeRefs.current[id];
    }
  }, []);

  // ─── Coordinate System Rendering ──────────────────────────────────────

  const gridSpacing = coordinateConfig.gridSpacing || 40;
  const centerX = stageSize.width / 2;
  const centerY = stageSize.height / 2;
  const minorSpacing = coordinateConfig.minorGridSpacing || gridSpacing / 5;

  // X/Y ranges
  const xMin = coordinateConfig.xRange?.[0] ?? -10;
  const xMax = coordinateConfig.xRange?.[1] ?? 10;
  const yMin = coordinateConfig.yRange?.[0] ?? -10;
  const yMax = coordinateConfig.yRange?.[1] ?? 10;
  const zMin = coordinateConfig.zRange?.[0] ?? -5;
  const zMax = coordinateConfig.zRange?.[1] ?? 5;

  // Z-axis direction (isometric: up-left at 210 degrees)
  const zAngle = (Math.PI * 7) / 6;
  const zDirX = Math.cos(zAngle); // ~-0.866
  const zDirY = Math.sin(zAngle); // ~-0.5

  // Compute visible range based on canvas size
  const visXMin = Math.max(xMin, Math.floor(-centerX / gridSpacing));
  const visXMax = Math.min(xMax, Math.ceil((stageSize.width - centerX) / gridSpacing));
  const visYMin = Math.max(yMin, Math.floor(-(stageSize.height - centerY) / gridSpacing));
  const visYMax = Math.min(yMax, Math.ceil(centerY / gridSpacing));

  // Grid lines
  const gridElements = useMemo(() => {
    const lines: {
      key: string;
      points: number[];
      stroke: string;
      strokeWidth: number;
      name: string;
      dash?: number[];
    }[] = [];

    if (coordinateConfig.showGrid) {
      // Minor grid
      if (coordinateConfig.showMinorGrid && minorSpacing > 0) {
        for (
          let x = centerX % minorSpacing;
          x < stageSize.width;
          x += minorSpacing
        ) {
          lines.push({
            key: `mgv-${x}`,
            points: [x, 0, x, stageSize.height],
            stroke: coordinateConfig.minorGridColor || '#f3f4f6',
            strokeWidth: 0.3,
            name: 'grid',
          });
        }
        for (
          let y = centerY % minorSpacing;
          y < stageSize.height;
          y += minorSpacing
        ) {
          lines.push({
            key: `mgh-${y}`,
            points: [0, y, stageSize.width, y],
            stroke: coordinateConfig.minorGridColor || '#f3f4f6',
            strokeWidth: 0.3,
            name: 'grid',
          });
        }
      }

      // Major grid
      for (let i = visXMin; i <= visXMax; i++) {
        const x = centerX + i * gridSpacing;
        if (x < 0 || x > stageSize.width) continue;
        lines.push({
          key: `gv-${i}`,
          points: [x, 0, x, stageSize.height],
          stroke: coordinateConfig.gridColor || '#e5e7eb',
          strokeWidth: coordinateConfig.gridWidth ?? 0.5,
          name: 'grid',
        });
      }
      for (let i = visYMin; i <= visYMax; i++) {
        const y = centerY - i * gridSpacing;
        if (y < 0 || y > stageSize.height) continue;
        lines.push({
          key: `gh-${i}`,
          points: [0, y, stageSize.width, y],
          stroke: coordinateConfig.gridColor || '#e5e7eb',
          strokeWidth: coordinateConfig.gridWidth ?? 0.5,
          name: 'grid',
        });
      }
    }

    return lines;
  }, [
    coordinateConfig.showGrid,
    coordinateConfig.showMinorGrid,
    coordinateConfig.gridColor,
    coordinateConfig.minorGridColor,
    coordinateConfig.gridWidth,
    gridSpacing,
    minorSpacing,
    centerX,
    centerY,
    stageSize.width,
    stageSize.height,
    visXMin,
    visXMax,
    visYMin,
    visYMax,
  ]);

  // Axis labels
  const axisLabels = useMemo(() => {
    const labels: {
      key: string;
      x: number;
      y: number;
      text: string;
      fontSize: number;
      fill: string;
      offsetX?: number;
      offsetY?: number;
    }[] = [];

    if (!coordinateConfig.showLabels) return labels;

    const fs = coordinateConfig.labelFontSize || 10;
    const lc = coordinateConfig.labelColor || '#666';

    // X axis labels
    for (let i = visXMin; i <= visXMax; i++) {
      if (i === 0) continue;
      const x = centerX + i * gridSpacing;
      if (x > 10 && x < stageSize.width - 20) {
        labels.push({
          key: `xl-${i}`,
          x,
          y: centerY + fs + 2,
          text: String(i),
          fontSize: fs,
          fill: coordinateConfig.xAxisColor || lc,
          offsetX: -4,
          offsetY: -fs / 2,
        });
      }
    }

    // Y axis labels
    for (let i = visYMin; i <= visYMax; i++) {
      if (i === 0) continue;
      const y = centerY - i * gridSpacing;
      if (y > 10 && y < stageSize.height - 10) {
        labels.push({
          key: `yl-${i}`,
          x: centerX - fs - 2,
          y,
          text: String(i),
          fontSize: fs,
          fill: coordinateConfig.yAxisColor || lc,
          offsetX: -fs / 2,
          offsetY: -fs / 3,
        });
      }
    }

    return labels;
  }, [
    coordinateConfig.showLabels,
    coordinateConfig.labelFontSize,
    coordinateConfig.labelColor,
    coordinateConfig.xAxisColor,
    coordinateConfig.yAxisColor,
    gridSpacing,
    centerX,
    centerY,
    stageSize.width,
    stageSize.height,
    visXMin,
    visXMax,
    visYMin,
    visYMax,
  ]);

  // Tick marks
  const tickMarks = useMemo(() => {
    const ticks: { key: string; points: number[]; stroke: string; strokeWidth: number }[] = [];
    if (!coordinateConfig.showTickMarks) return ticks;

    const aw = coordinateConfig.axisWidth || 1.5;
    const tickLen = 4;

    for (let i = visXMin; i <= visXMax; i++) {
      if (i === 0) continue;
      const x = centerX + i * gridSpacing;
      if (x > 0 && x < stageSize.width) {
        ticks.push({
          key: `xt-${i}`,
          points: [x, centerY - tickLen, x, centerY + tickLen],
          stroke: coordinateConfig.xAxisColor || coordinateConfig.axisColor,
          strokeWidth: aw,
        });
      }
    }
    for (let i = visYMin; i <= visYMax; i++) {
      if (i === 0) continue;
      const y = centerY - i * gridSpacing;
      if (y > 0 && y < stageSize.height) {
        ticks.push({
          key: `yt-${i}`,
          points: [centerX - tickLen, y, centerX + tickLen, y],
          stroke: coordinateConfig.yAxisColor || coordinateConfig.axisColor,
          strokeWidth: aw,
        });
      }
    }
    return ticks;
  }, [
    coordinateConfig.showTickMarks,
    coordinateConfig.axisWidth,
    coordinateConfig.xAxisColor,
    coordinateConfig.yAxisColor,
    coordinateConfig.axisColor,
    gridSpacing,
    centerX,
    centerY,
    stageSize.width,
    stageSize.height,
    visXMin,
    visXMax,
    visYMin,
    visYMax,
  ]);

  // Z-axis elements
  const zAxisElements = useMemo(() => {
    const elems: any[] = [];
    if (!coordinateConfig.showZAxis) return elems;

    const aw = coordinateConfig.axisWidth || 1.5;
    const zc = coordinateConfig.zAxisColor || '#2563eb';
    const zLen = 120; // z-axis visual length in pixels
    const fs = coordinateConfig.labelFontSize || 10;
    const lc = coordinateConfig.labelColor || '#666';

    // Z-axis line
    const zEndX = centerX + zDirX * zLen;
    const zEndY = centerY + zDirY * zLen;

    // Dashed projection lines to show Z direction
    elems.push(
      <Line
        key="z-axis"
        points={[centerX, centerY, zEndX, zEndY]}
        stroke={zc}
        strokeWidth={aw}
        dash={[6, 3]}
        name="axis"
        listening={false}
      />
    );

    // Z-axis arrow
    if (coordinateConfig.showAxisArrows) {
      const arrowSize = 8;
      const perpX = -zDirY;
      const perpY = zDirX;
      elems.push(
        <Line
          key="z-arrow"
          points={[
            zEndX + perpX * arrowSize + zDirX * arrowSize,
            zEndY + perpY * arrowSize + zDirY * arrowSize,
            zEndX,
            zEndY,
            zEndX - perpX * arrowSize + zDirX * arrowSize,
            zEndY - perpY * arrowSize + zDirY * arrowSize,
          ]}
          stroke={zc}
          strokeWidth={aw}
          listening={false}
        />
      );
    }

    // Z label
    elems.push(
      <Text
        key="z-label"
        x={zEndX + zDirX * 14}
        y={zEndY + zDirY * 14}
        text={coordinateConfig.zLabel || 'z'}
        fontSize={fs + 1}
        fill={zc}
        fontStyle="bold"
        listening={false}
      />
    );

    // Z tick marks and labels
    if (coordinateConfig.showTickMarks || coordinateConfig.showLabels) {
      const zTicks = 5;
      for (let i = 1; i <= zTicks; i++) {
        const t = i / zTicks;
        const px = centerX + zDirX * zLen * t;
        const py = centerY + zDirY * zLen * t;

        if (coordinateConfig.showTickMarks) {
          const perpX = -zDirY;
          const perpY = zDirX;
          elems.push(
            <Line
              key={`zt-${i}`}
              points={[
                px - perpX * 3,
                py - perpY * 3,
                px + perpX * 3,
                py + perpY * 3,
              ]}
              stroke={zc}
              strokeWidth={1}
              listening={false}
            />
          );
        }

        if (coordinateConfig.showLabels) {
          elems.push(
            <Text
              key={`zl-${i}`}
              x={px + (-zDirY) * 12}
              y={py + zDirX * 12}
              text={String(i)}
              fontSize={fs - 2}
              fill={zc}
              listening={false}
            />
          );
        }

        // Optional: Z-plane grid lines from X axis
        if (coordinateConfig.showGrid && i <= 3) {
          const gridLineLen = zLen * t;
          for (let xi = -3; xi <= 3; xi++) {
            if (xi === 0) continue;
            const xStart = centerX + xi * gridSpacing;
            const yStart = centerY;
            elems.push(
              <Line
                key={`zg-x-${xi}-${i}`}
                points={[
                  xStart,
                  yStart,
                  xStart + zDirX * gridLineLen,
                  yStart + zDirY * gridLineLen,
                ]}
                stroke={coordinateConfig.minorGridColor || '#f3f4f6'}
                strokeWidth={0.3}
                dash={[3, 4]}
                listening={false}
              />
            );
          }
          // Y axis grid in Z direction
          for (let yi = -3; yi <= 3; yi++) {
            if (yi === 0) continue;
            const xStart = centerX;
            const yStart = centerY - yi * gridSpacing;
            elems.push(
              <Line
                key={`zg-y-${yi}-${i}`}
                points={[
                  xStart,
                  yStart,
                  xStart + zDirX * gridLineLen,
                  yStart + zDirY * gridLineLen,
                ]}
                stroke={coordinateConfig.minorGridColor || '#f3f4f6'}
                strokeWidth={0.3}
                dash={[3, 4]}
                listening={false}
              />
            );
          }
        }
      }
    }

    return elems;
  }, [
    coordinateConfig,
    gridSpacing,
    centerX,
    centerY,
    zDirX,
    zDirY,
  ]);

  // Axes lines
  const axisElements = useMemo(() => {
    if (!coordinateConfig.showAxes) return <></>;

    const aw = coordinateConfig.axisWidth || 1.5;
    const xc = coordinateConfig.xAxisColor || coordinateConfig.axisColor;
    const yc = coordinateConfig.yAxisColor || coordinateConfig.axisColor;
    const fs = coordinateConfig.labelFontSize || 10;

    return (
      <>
        {/* X axis */}
        <Line
          points={[0, centerY, stageSize.width, centerY]}
          stroke={xc}
          strokeWidth={aw}
          name="axis"
          listening={false}
        />
        {/* Y axis */}
        <Line
          points={[centerX, 0, centerX, stageSize.height]}
          stroke={yc}
          strokeWidth={aw}
          name="axis"
          listening={false}
        />

        {/* Axis arrows */}
        {coordinateConfig.showAxisArrows && (
          <>
            <Line
              points={[
                stageSize.width - 15,
                centerY - 6,
                stageSize.width,
                centerY,
                stageSize.width - 15,
                centerY + 6,
              ]}
              stroke={xc}
              strokeWidth={aw}
              listening={false}
            />
            <Line
              points={[
                centerX - 6,
                15,
                centerX,
                0,
                centerX + 6,
                15,
              ]}
              stroke={yc}
              strokeWidth={aw}
              listening={false}
            />
          </>
        )}

        {/* Axis name labels */}
        <Text
          x={stageSize.width - 18}
          y={centerY + 8}
          text={coordinateConfig.xLabel || 'x'}
          fontSize={fs + 1}
          fill={xc}
          fontStyle="bold"
          listening={false}
        />
        <Text
          x={centerX + 8}
          y={4}
          text={coordinateConfig.yLabel || 'y'}
          fontSize={fs + 1}
          fill={yc}
          fontStyle="bold"
          listening={false}
        />
      </>
    );
  }, [
    coordinateConfig.showAxes,
    coordinateConfig.showAxisArrows,
    coordinateConfig.axisWidth,
    coordinateConfig.xAxisColor,
    coordinateConfig.yAxisColor,
    coordinateConfig.axisColor,
    coordinateConfig.labelFontSize,
    coordinateConfig.xLabel,
    coordinateConfig.yLabel,
    centerX,
    centerY,
    stageSize.width,
    stageSize.height,
  ]);

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={height}
      onClick={handleStageClick}
      onTap={handleStageClick}
      style={{ backgroundColor: '#fafafa' }}
    >
      <Layer>
        {/* Grid */}
        {gridElements.map((line) => (
          <Line
            key={line.key}
            points={line.points}
            stroke={line.stroke}
            strokeWidth={line.strokeWidth}
            dash={line.dash}
            listening={false}
          />
        ))}

        {/* Z-axis (behind main axes) */}
        {zAxisElements}

        {/* Main axes */}
        {axisElements}

        {/* Tick marks */}
        {tickMarks.map((tick) => (
          <Line
            key={tick.key}
            points={tick.points}
            stroke={tick.stroke}
            strokeWidth={tick.strokeWidth}
            listening={false}
          />
        ))}

        {/* Origin */}
        {coordinateConfig.showOrigin && (
          <Text
            x={centerX + 5}
            y={centerY + 5}
            text={coordinateConfig.originLabel || 'O'}
            fontSize={(coordinateConfig.labelFontSize || 10) - 1}
            fill={coordinateConfig.labelColor || '#666'}
            fontStyle="bold"
            listening={false}
          />
        )}

        {/* Axis labels */}
        {axisLabels.map((label) => (
          <Text
            key={label.key}
            x={label.x + (label.offsetX || 0)}
            y={label.y + (label.offsetY || 0)}
            text={label.text}
            fontSize={label.fontSize}
            fill={label.fill}
            listening={false}
          />
        ))}

        {/* Shapes */}
        {shapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            isSelected={shape.id === selectedShapeId}
            editable={editable}
            onClick={(e) => handleShapeClick(shape.id, e)}
            onDragEnd={(e) => handleDragEnd(shape.id, e)}
            onTransformEnd={(e) => handleTransformEnd(shape.id, e)}
            registerRef={(node) => registerShapeRef(shape.id, node)}
          />
        ))}

        {/* Transformer */}
        <Transformer
          ref={transformerRef as any}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) return oldBox;
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
        />
      </Layer>
    </Stage>
  );
}

// ─── Shape Renderer ────────────────────────────────────────────────────

function ShapeRenderer({
  shape,
  isSelected,
  editable,
  onClick,
  onDragEnd,
  onTransformEnd,
  registerRef,
}: {
  shape: Shape;
  isSelected: boolean;
  editable: boolean;
  onClick: (e: any) => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: (e: any) => void;
  registerRef: (node: any) => void;
}) {
  const commonProps = {
    x: shape.x,
    y: shape.y,
    rotation: shape.rotation,
    draggable: editable,
    opacity: shape.opacity,
    onClick,
    onTap: onClick,
    onDragEnd,
    onTransformEnd,
    ref: (node: any) => registerRef(node),
    ...(isSelected && editable ? { stroke: '#4a90d9', strokeWidth: 1 } : {}),
  };

  const { type } = shape;
  const ms = shape as MathShape;
  const ps = shape as PhysicsShape;

  // ─── BASIC 2D SHAPES ─────────────────────────────────────────────

  if (type === 'circle' || type === 'coordinatePoint' || type === 'gridPoint') {
    const r = type === 'gridPoint' ? 4 : shape.radius || 50;
    const fill =
      type === 'coordinatePoint' || type === 'gridPoint'
        ? shape.strokeColor
        : shape.fillColor;
    return (
      <Circle
        {...commonProps}
        radius={r}
        fill={fill}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'point') {
    return (
      <Circle
        {...commonProps}
        radius={shape.radius || 5}
        fill={shape.strokeColor}
        stroke={shape.strokeColor}
      />
    );
  }

  if (type === 'ellipse') {
    return (
      <Ellipse
        {...commonProps}
        radiusX={(shape.width || 120) / 2}
        radiusY={(shape.height || 70) / 2}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'rectangle' || type === 'square') {
    return (
      <Rect
        {...commonProps}
        width={shape.width || 100}
        height={shape.height || 80}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'triangle' || type === 'equilateralTriangle') {
    const w = shape.width || 100;
    const h = shape.height || 87;
    return (
      <Line
        {...commonProps}
        points={[0, h, w / 2, 0, w, h]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'rightTriangle') {
    const w = shape.width || 100;
    const h = shape.height || 80;
    return (
      <Line
        {...commonProps}
        points={[0, h, 0, 0, w, h]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'isoscelesTriangle') {
    const w = shape.width || 100;
    const h = shape.height || 90;
    return (
      <Line
        {...commonProps}
        points={[w * 0.15, h, w / 2, 0, w * 0.85, h]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // Regular polygon (including pentagon through dodecagon)
  if (
    type === 'regularPolygon' ||
    [
      'pentagon', 'hexagon', 'heptagon', 'octagon',
      'nonagon', 'decagon', 'hendecagon', 'dodecagon',
    ].includes(type)
  ) {
    return (
      <RegularPolygon
        {...commonProps}
        sides={ms.sides || 6}
        radius={shape.radius || 50}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'parallelogram') {
    const w = shape.width || 120;
    const h = shape.height || 70;
    const offset = h * 0.3;
    return (
      <Line
        {...commonProps}
        points={[offset, h, w, h, w - offset, 0, 0, 0]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'trapezoid') {
    const w = shape.width || 120;
    const h = shape.height || 70;
    const indent = w * 0.2;
    return (
      <Line
        {...commonProps}
        points={[indent, 0, w - indent, 0, w, h, 0, h]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'rhombus') {
    const w = shape.width || 80;
    const h = shape.height || 100;
    return (
      <Line
        {...commonProps}
        points={[w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'kite') {
    const w = shape.width || 80;
    const h = shape.height || 100;
    return (
      <Line
        {...commonProps}
        points={[w / 2, 0, w, h * 0.35, w / 2, h, 0, h * 0.35]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'cross') {
    const w = shape.width || 80;
    const arm = w * 0.3;
    return (
      <Line
        {...commonProps}
        points={[
          arm, 0, w - arm, 0, w - arm, arm, w, arm,
          w, w - arm, w - arm, w - arm, w - arm, w,
          arm, w, arm, w - arm, 0, w - arm,
          0, arm, arm, arm, arm, 0,
        ]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'chevron') {
    const w = shape.width || 80;
    const h = shape.height || 60;
    const indent = w * 0.25;
    return (
      <Line
        {...commonProps}
        points={[0, h, indent, 0, w, 0, w, h / 2, w - indent, h]}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // ─── CURVES & ARCS ────────────────────────────────────────────────

  if (type === 'semicircle') {
    const w = shape.width || 100;
    const r = w / 2;
    const pts: number[] = [];
    for (let a = Math.PI; a >= 0; a -= 0.08) {
      pts.push(r + Math.cos(a) * r, -Math.sin(a) * r);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'quarterCircle') {
    const s = shape.width || 60;
    const pts: number[] = [0, 0];
    for (let a = 0; a <= Math.PI / 2; a += 0.08) {
      pts.push(Math.cos(a) * s, -Math.sin(a) * s);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'arc' || type === 'angle' || type === 'circleSection') {
    const r = shape.radius || 40;
    const startA = ((ms.startAngle || 0) * Math.PI) / 180;
    const endA = ((ms.endAngle || 90) * Math.PI) / 180;
    const pts: number[] = [];
    for (let a = startA; a <= endA; a += 0.05) {
      pts.push(Math.cos(a) * r, -Math.sin(a) * r);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'ellipseArc') {
    const w = shape.width || 120;
    const h = shape.height || 70;
    const startA = ((ms.startAngle || 0) * Math.PI) / 180;
    const endA = ((ms.endAngle || 180) * Math.PI) / 180;
    const pts: number[] = [];
    for (let a = startA; a <= endA; a += 0.05) {
      pts.push((Math.cos(a) * w) / 2, (-Math.sin(a) * h) / 2);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'spiral') {
    const maxR = shape.radius || 50;
    const pts: number[] = [];
    for (let a = 0; a < Math.PI * 4; a += 0.1) {
      const r = (a / (Math.PI * 4)) * maxR;
      pts.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.3}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'sineWave' || type === 'transverseWave' || type === 'standingWave') {
    const w = shape.width || 150;
    const amp = (shape.height || 40) / 2;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const y = Math.sin((x / w) * Math.PI * 4) * amp;
      pts.push(x, y);
    }
    if (type === 'standingWave') {
      // Add envelope
      const pts2: number[] = [];
      for (let x = 0; x <= w; x += 2) {
        const y = Math.sin((x / w) * Math.PI * 2) * amp;
        pts2.push(x, y);
      }
      return (
        <>
          <Line
            {...commonProps}
            points={pts2}
            tension={0.2}
            stroke={shape.strokeColor}
            strokeWidth={0.5}
            dash={[4, 4]}
            listening={false}
          />
          <Line
            {...commonProps}
            points={pts}
            tension={0.2}
            stroke={shape.strokeColor}
            strokeWidth={shape.strokeWidth}
          />
        </>
      );
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.2}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'cosineWave') {
    const w = shape.width || 150;
    const amp = (shape.height || 40) / 2;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const y = Math.cos((x / w) * Math.PI * 4) * amp;
      pts.push(x, y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.2}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'longitudinalWave') {
    const w = shape.width || 150;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const y = Math.sin((x / w) * Math.PI * 4) * 8;
      pts.push(x, y);
    }
    // Draw dots for compression/rarefaction
    const dots: any[] = [];
    for (let i = 0; i < 15; i++) {
      const bx = (i / 14) * w;
      const offset = Math.sin((bx / w) * Math.PI * 4) * 8;
      dots.push(
        <Circle
          key={`lw-${i}`}
          x={shape.x + bx}
          y={shape.y + offset}
          radius={4}
          fill={shape.strokeColor}
          draggable={false}
        />
      );
    }
    return (
      <>
        <Line
          {...commonProps}
          points={pts}
          tension={0}
          stroke={shape.strokeColor}
          strokeWidth={1}
          dash={[2, 2]}
          listening={false}
        />
        {dots}
      </>
    );
  }

  if (type === 'parabola' || type === 'parabolaCurve') {
    const w = shape.width || 100;
    const h = shape.height || 80;
    const pts: number[] = [];
    for (let x = -w / 2; x <= w / 2; x += 2) {
      const y = (x * x) / (w / 2) * (h / 4);
      pts.push(x + w / 2, -y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'hyperbola' || type === 'hyperbolaCurve') {
    const w = shape.width || 120;
    const h = shape.height || 80;
    const pts: number[] = [];
    for (let x = 10; x <= w / 2; x += 2) {
      const y = h / (x / (w / 8));
      pts.push(x + w / 2, -y);
    }
    for (let x = -w / 2; x <= -10; x += 2) {
      const y = h / (-x / (w / 8));
      pts.push(x + w / 2, -y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'bezierCurve') {
    const w = shape.width || 150;
    const pts: number[] = [0, 0, w * 0.3, -50, w * 0.7, 50, w, 0];
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.5}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'cardioid') {
    const r = shape.radius || 50;
    const pts: number[] = [];
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const rr = r * (1 - Math.cos(a));
      pts.push(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.3}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'lemniscate') {
    const r = shape.radius || 50;
    const pts: number[] = [];
    for (let a = 0; a < Math.PI * 2; a += 0.05) {
      const denom = 1 + Math.sin(a) * Math.sin(a);
      const x = (r * Math.cos(a)) / denom;
      const y = (r * Math.sin(a) * Math.cos(a)) / denom;
      pts.push(x, y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.2}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // ─── LINES & SEGMENTS ────────────────────────────────────────────

  if (type === 'line' || type === 'ray' || type === 'lineSegment') {
    const dx = (ms.x2 || shape.x + 150) - shape.x;
    const dy = (ms.y2 || shape.y) - shape.y;
    const ext = type === 'line' ? 500 : type === 'ray' ? 500 : 0;
    let ex = dx;
    let ey = dy;
    if (ext > 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        ex = (dx / len) * ext;
        ey = (dy / len) * ext;
      }
    }
    return (
      <Line
        {...commonProps}
        points={[0, 0, ex, ey]}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'parallelLines') {
    const w = shape.width || 150;
    const gap = shape.height || 30;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, -gap / 2, w, -gap / 2]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          {...commonProps}
          points={[0, gap / 2, w, gap / 2]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'perpendicularLines') {
    const w = shape.width || 120;
    const h = shape.height || 100;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, w, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          {...commonProps}
          points={[w / 2, -h / 2, w / 2, h / 2]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        {/* Right angle marker */}
        <Line
          points={[shape.x + w / 2, shape.y, shape.x + w / 2 - 8, shape.y, shape.x + w / 2 - 8, shape.y - 8]}
          stroke={shape.strokeColor}
          strokeWidth={1}
          listening={false}
        />
      </>
    );
  }

  if (type === 'intersectingLines') {
    const w = shape.width || 150;
    const h = shape.height || 100;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, h * 0.3, w, h * 0.7]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          {...commonProps}
          points={[w * 0.2, 0, w * 0.8, h]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'angleBisector') {
    const w = 100;
    const angleRad = ((ms.angle || 45) * Math.PI) / 180;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, w, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          {...commonProps}
          points={[0, 0, w * Math.cos(-angleRad), w * Math.sin(-angleRad)]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        {/* Bisector */}
        <Line
          points={[
            shape.x,
            shape.y,
            shape.x + w * 0.7 * Math.cos(-angleRad / 2),
            shape.y + w * 0.7 * Math.sin(-angleRad / 2),
          ]}
          stroke={shape.strokeColor}
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      </>
    );
  }

  // ─── VECTORS ─────────────────────────────────────────────────────

  if (
    type === 'vector' ||
    type === 'vectorAddition' ||
    type === 'unitVector' ||
    type === 'positionVector' ||
    type === 'arrow'
  ) {
    const dx = (ms.x2 || shape.x + 120) - shape.x;
    const dy = (ms.y2 || shape.y - 60) - shape.y;
    return (
      <Arrow
        {...commonProps}
        points={[0, 0, dx, dy]}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth + 1}
        fill={shape.strokeColor}
        pointerLength={10}
        pointerWidth={8}
      />
    );
  }

  if (type === 'plane') {
    const w = shape.width || 120;
    const h = shape.height || 80;
    return (
      <Line
        {...commonProps}
        points={[0, h * 0.3, w, h * 0.7, w + 10, h * 0.1, 10, -h * 0.3]}
        closed
        fill={shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // ─── FORCE ARROWS (Physics) ──────────────────────────────────────

  const forceTypes = [
    'forceArrow', 'netForce', 'weight', 'normalForce',
    'frictionForce', 'tension', 'appliedForce', 'reactionForce',
  ];
  if (forceTypes.includes(type)) {
    const dx = (ps.x2 || shape.x + 120) - shape.x;
    const dy = (ps.y2 || shape.y) - shape.y;
    const color = getForceColor(type);
    return (
      <Arrow
        {...commonProps}
        points={[0, 0, dx, dy]}
        stroke={color}
        strokeWidth={shape.strokeWidth + 1}
        fill={color}
        pointerLength={12}
        pointerWidth={10}
      />
    );
  }

  // ─── MOTION ARROWS (Physics) ─────────────────────────────────────

  const motionTypes = ['velocityArrow', 'accelerationArrow', 'momentumArrow', 'displacementArrow'];
  if (motionTypes.includes(type)) {
    const dx = (ps.x2 || shape.x + 120) - shape.x;
    const dy = (ps.y2 || shape.y) - shape.y;
    const colors: Record<string, string> = {
      velocityArrow: '#3182ce',
      accelerationArrow: '#38a169',
      momentumArrow: '#d69e2e',
      displacementArrow: '#805ad5',
    };
    const c = colors[type] || shape.strokeColor;
    return (
      <Arrow
        {...commonProps}
        points={[0, 0, dx, dy]}
        stroke={c}
        strokeWidth={shape.strokeWidth + 1}
        fill={c}
        pointerLength={10}
        pointerWidth={8}
      />
    );
  }

  // ─── STARS ───────────────────────────────────────────────────────

  if (['star3', 'star4', 'star5', 'star6'].includes(type)) {
    const outerR = shape.radius || 50;
    const innerR = outerR * 0.4;
    const points = ms.sides || 5;
    const pts: number[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      pts.push(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        closed
        fill={shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // ─── SIMPLE MACHINES (Physics) ───────────────────────────────────

  if (type === 'spring' || type === 'springMass') {
    const w = shape.width || 150;
    const coils = 8;
    const amplitude = (shape.height || 40) / 2;
    const pts: number[] = [0, 0];
    for (let i = 0; i <= coils; i++) {
      const x = (i / coils) * w;
      const y = i % 2 === 0 ? -amplitude : amplitude;
      pts.push(x, y);
    }
    pts.push(w, 0);
    const elems: any[] = [
      <Line
        key="spring"
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />,
    ];
    if (type === 'springMass') {
      elems.push(
        <Rect
          key="mass"
          x={shape.x + w + 5}
          y={shape.y - 15}
          width={30}
          height={30}
          fill={shape.fillColor === 'transparent' ? '#666' : shape.fillColor}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
      );
    }
    return <>{elems}</>;
  }

  if (type === 'damper') {
    const w = shape.width || 120;
    const hw = w / 2;
    return (
      <>
        <Line {...commonProps} points={[0, 0, hw - 10, 0]} stroke={shape.strokeColor} strokeWidth={shape.strokeWidth} />
        <Rect
          x={shape.x + hw - 15}
          y={shape.y - 12}
          width={30}
          height={24}
          fill={shape.fillColor === 'transparent' ? '#e5e7eb' : shape.fillColor}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Line {...commonProps} points={[hw + 10, 0, w, 0]} stroke={shape.strokeColor} strokeWidth={shape.strokeWidth} />
      </>
    );
  }

  if (type === 'pendulum' || type === 'simplePendulum') {
    const h = shape.height || 150;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, 0, h]}
          stroke={shape.strokeColor}
          strokeWidth={2}
        />
        <Circle
          x={shape.x}
          y={shape.y + h}
          radius={15}
          fill={
            shape.fillColor === 'transparent' ? '#666' : shape.fillColor
          }
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
      </>
    );
  }

  if (type === 'torsionalPendulum') {
    const w = shape.width || 60;
    const h = shape.height || 60;
    return (
      <>
        <Rect
          {...commonProps}
          width={w}
          height={h}
          fill={shape.fillColor === 'transparent' ? '#e5e7eb' : shape.fillColor}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          points={[shape.x + w / 2, shape.y - 20, shape.x + w / 2, shape.y]}
          stroke={shape.strokeColor}
          strokeWidth={2}
          listening={false}
        />
        <Circle
          x={shape.x + w / 2}
          y={shape.y}
          radius={3}
          fill={shape.strokeColor}
          listening={false}
        />
        {/* Rotation arrow */}
        <Line
          points={[
            shape.x + w + 5, shape.y + 5,
            shape.x + w + 5, shape.y - 15,
            shape.x + w - 5, shape.y - 15,
          ]}
          stroke={shape.strokeColor}
          strokeWidth={1.5}
          listening={false}
        />
      </>
    );
  }

  if (type === 'lever') {
    const w = shape.width || 200;
    const h = shape.height || 10;
    return (
      <>
        <Line
          {...commonProps}
          points={[-10, h, w + 10, h]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 2}
        />
        <Line
          points={[shape.x + w / 2, shape.y + h, shape.x + w / 2 - 12, shape.y + h + 25]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          listening={false}
        />
        <Line
          points={[shape.x + w / 2, shape.y + h, shape.x + w / 2 + 12, shape.y + h + 25]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          listening={false}
        />
      </>
    );
  }

  if (type === 'fulcrum') {
    const w = shape.width || 40;
    const h = shape.height || 30;
    return (
      <Line
        {...commonProps}
        points={[0, 0, w / 2, h, w, 0]}
        closed
        fill={shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'pulley') {
    const r = shape.radius || 30;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill={
            shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor
          }
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 1}
        />
        <Circle
          x={shape.x}
          y={shape.y}
          radius={4}
          fill={shape.strokeColor}
          listening={false}
        />
      </>
    );
  }

  if (type === 'inclinedPlane') {
    const w = shape.width || 150;
    const h = shape.height || 80;
    return (
      <Line
        {...commonProps}
        points={[0, h, w, h, w, 0]}
        closed
        fill={
          shape.fillColor === 'transparent' ? '#f5f5f5' : shape.fillColor
        }
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'wedge') {
    const w = shape.width || 80;
    const h = shape.height || 60;
    return (
      <Line
        {...commonProps}
        points={[w, 0, w, h, 0, h / 2]}
        closed
        fill={
          shape.fillColor === 'transparent' ? '#f5f5f5' : shape.fillColor
        }
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'screw') {
    const w = shape.width || 30;
    const h = shape.height || 100;
    const pts: number[] = [0, 0, w, 0];
    for (let y = 10; y < h; y += 10) {
      pts.push(y % 20 === 0 ? w + 5 : w - 5, y);
    }
    pts.push(0, h, w, h);
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'wheelAxle' || type === 'gear') {
    const r = shape.radius || 40;
    const elems: any[] = [
      <Circle
        key="outer"
        {...commonProps}
        radius={r}
        fill={
          shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor
        }
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth + 1}
      />,
      <Circle
        key="inner"
        x={shape.x}
        y={shape.y}
        radius={6}
        fill={shape.strokeColor}
        listening={false}
      />,
    ];
    if (type === 'gear') {
      // Gear teeth
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const a = (i * Math.PI * 2) / teeth;
        elems.push(
          <Rect
            key={`tooth-${i}`}
            x={shape.x + Math.cos(a) * (r - 3) - 4}
            y={shape.y + Math.sin(a) * (r - 3) - 4}
            width={8}
            height={8}
            rotation={(a * 180) / Math.PI}
            offset={{ x: 4, y: 4 }}
            fill={shape.strokeColor}
            listening={false}
          />
        );
      }
    } else {
      // Wheel & axle: cross inside
      elems.push(
        <Line key="axle-h" points={[shape.x - r, shape.y, shape.x + r, shape.y]} stroke={shape.strokeColor} strokeWidth={1} listening={false} />,
        <Line key="axle-v" points={[shape.x, shape.y - r, shape.x, shape.y + r]} stroke={shape.strokeColor} strokeWidth={1} listening={false} />
      );
    }
    return <>{elems}</>;
  }

  // ─── PROJECTILE & CIRCULAR MOTION ────────────────────────────────

  if (type === 'projectilePath') {
    const w = shape.width || 150;
    const h = shape.height || 100;
    const pts: number[] = [];
    for (let t = 0; t <= 1; t += 0.02) {
      pts.push(t * w, -4 * h * t * (1 - t));
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
        dash={[5, 3]}
      />
    );
  }

  if (type === 'circularMotion') {
    const r = shape.radius || 60;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          dash={[4, 4]}
        />
        <Arrow
          points={[shape.x, shape.y - r, shape.x + r * 0.3, shape.y - r * 0.95]}
          stroke={shape.strokeColor}
          strokeWidth={2}
          fill={shape.strokeColor}
          pointerLength={8}
          pointerWidth={6}
          listening={false}
        />
        <Circle
          x={shape.x + r * 0.3}
          y={shape.y - r * 0.95}
          radius={5}
          fill={shape.strokeColor}
          listening={false}
        />
      </>
    );
  }

  // ─── WAVES (Physics) ─────────────────────────────────────────────

  if (type === 'waveFront') {
    const w = shape.width || 120;
    const h = shape.height || 80;
    const cx = w / 2;
    const cy = h / 2;
    return (
      <>
        {[20, 40, 55].map((r, i) => (
          <Line
            key={`wf-${i}`}
            points={(() => {
              const pts: number[] = [];
              for (let a = -0.6; a <= 0.6; a += 0.05) {
                pts.push(cx + Math.sin(a) * r, cy - Math.cos(a) * r);
              }
              return pts;
            })()}
            tension={0}
            stroke={shape.strokeColor}
            strokeWidth={1}
            listening={false}
          />
        ))}
      </>
    );
  }

  if (type === 'interference') {
    const w = shape.width || 150;
    const h = shape.height || 80;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const y =
        Math.sin((x / w) * Math.PI * 6) * 15 +
        Math.sin((x / w) * Math.PI * 8) * 10;
      pts.push(x, y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.2}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'diffraction') {
    const w = shape.width || 150;
    const h = shape.height || 80;
    const cx = w / 2;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const dist = Math.abs(x - cx);
      const envelope = dist < 20 ? 1 : Math.exp(-Math.pow((dist - 20) / 50, 2));
      const y = Math.sin((x / w) * Math.PI * 10) * 15 * envelope;
      pts.push(x, y);
    }
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.2}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  // ─── THERMODYNAMICS ──────────────────────────────────────────────

  if (type === 'thermometer') {
    const h = shape.height || 100;
    const w = shape.width || 20;
    return (
      <>
        <Rect
          {...commonProps}
          x={shape.x - w / 2 + 5}
          y={shape.y}
          width={w - 10}
          height={h - 20}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          cornerRadius={w / 4}
        />
        <Circle
          x={shape.x + 5}
          y={shape.y + h - 12}
          radius={12}
          fill="#ef4444"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Rect
          x={shape.x}
          y={shape.y + h * 0.3}
          width={10}
          height={h * 0.5}
          fill="#ef4444"
          listening={false}
        />
      </>
    );
  }

  if (type === 'heatFlow') {
    const w = shape.width || 120;
    return (
      <>
        <Rect
          {...commonProps}
          x={shape.x - 10}
          y={shape.y - 20}
          width={30}
          height={40}
          fill="#fecaca"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Arrow
          points={[shape.x + 30, shape.y, shape.x + w - 30, shape.y]}
          stroke="#ef4444"
          strokeWidth={2}
          fill="#ef4444"
          pointerLength={10}
          pointerWidth={8}
          listening={false}
        />
        <Rect
          x={shape.x + w - 20}
          y={shape.y - 20}
          width={30}
          height={40}
          fill="#bfdbfe"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
      </>
    );
  }

  if (type === 'piston') {
    const w = shape.width || 80;
    const h = shape.height || 60;
    return (
      <>
        <Rect
          {...commonProps}
          x={shape.x}
          y={shape.y}
          width={w}
          height={10}
          fill={shape.fillColor === 'transparent' ? '#d1d5db' : shape.fillColor}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Rect
          x={shape.x + 10}
          y={shape.y + 10}
          width={w - 20}
          height={h - 10}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Line
          points={[shape.x + w / 2, shape.y + 10, shape.x + w / 2, shape.y + h]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          listening={false}
        />
      </>
    );
  }

  if (type === 'expansion' || type === 'compression') {
    const w = shape.width || 120;
    const h = shape.height || 40;
    const isCompression = type === 'compression';
    const arrowDir = isCompression ? -1 : 1;
    return (
      <>
        <Rect
          {...commonProps}
          x={shape.x}
          y={shape.y + 5}
          width={w}
          height={h - 10}
          fill={shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          draggable={false}
        />
        <Arrow
          points={[
            shape.x - 5,
            shape.y + h / 2,
            shape.x + 15,
            shape.y + h / 2,
          ]}
          stroke={shape.strokeColor}
          strokeWidth={2}
          fill={shape.strokeColor}
          pointerLength={8}
          pointerWidth={6}
          listening={false}
        />
        <Arrow
          points={[
            shape.x + w + 5,
            shape.y + h / 2,
            shape.x + w - 15,
            shape.y + h / 2,
          ]}
          stroke={shape.strokeColor}
          strokeWidth={2}
          fill={shape.strokeColor}
          pointerLength={8}
          pointerWidth={6}
          listening={false}
        />
      </>
    );
  }

  // ─── ELECTRICITY ─────────────────────────────────────────────────

  if (type === 'resistor') {
    const w = shape.width || 80;
    const pts: number[] = [0, 0];
    const zw = w * 0.6;
    const segments = 6;
    const segW = zw / segments;
    for (let i = 0; i < segments; i++) {
      const x = w * 0.2 + i * segW;
      const y = i % 2 === 0 ? -12 : 12;
      pts.push(x, y);
    }
    pts.push(w, 0);
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'capacitor') {
    const gap = 8;
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, 15, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          points={[shape.x + 20, shape.y - 18, shape.x + 20, shape.y + 18]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 1}
          listening={false}
        />
        <Line
          points={[shape.x + 28, shape.y - 18, shape.x + 28, shape.y + 18]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 1}
          listening={false}
        />
        <Line
          {...commonProps}
          points={[33, 0, 48, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'inductor') {
    const w = shape.width || 80;
    const pts: number[] = [];
    const coils = 4;
    const coilW = w * 0.6 / coils;
    pts.push(0, 0);
    for (let i = 0; i < coils; i++) {
      const cx = w * 0.2 + i * coilW + coilW / 2;
      for (let a = Math.PI; a >= 0; a -= 0.15) {
        pts.push(cx + Math.cos(a) * coilW / 2, -Math.sin(a) * 10);
      }
    }
    pts.push(w, 0);
    return (
      <Line
        {...commonProps}
        points={pts}
        tension={0.3}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'battery') {
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, 15, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          points={[shape.x + 15, shape.y - 18, shape.x + 15, shape.y + 18]}
          stroke={shape.strokeColor}
          strokeWidth={3}
          listening={false}
        />
        <Line
          points={[shape.x + 22, shape.y - 10, shape.x + 22, shape.y + 10]}
          stroke={shape.strokeColor}
          strokeWidth={1.5}
          listening={false}
        />
        <Text
          x={shape.x + 13}
          y={shape.y - 28}
          text="+"
          fontSize={12}
          fill={shape.strokeColor}
          listening={false}
        />
        <Text
          x={shape.x + 20}
          y={shape.y + 14}
          text="-"
          fontSize={12}
          fill={shape.strokeColor}
          listening={false}
        />
        <Line
          {...commonProps}
          points={[22, 0, 40, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'switchClosed' || type === 'switchOpen') {
    const w = shape.width || 60;
    const isOpen = type === 'switchOpen';
    return (
      <>
        <Line
          {...commonProps}
          points={[0, 0, w * 0.3, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Circle x={shape.x + w * 0.3} y={shape.y} radius={3} fill={shape.strokeColor} listening={false} />
        <Line
          points={[
            shape.x + w * 0.3,
            shape.y,
            shape.x + w * 0.7,
            shape.y - (isOpen ? -20 : 0),
          ]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          listening={false}
        />
        <Circle x={shape.x + w * 0.7} y={shape.y} radius={3} fill={shape.strokeColor} listening={false} />
        <Line
          {...commonProps}
          points={[w * 0.7, 0, w, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'ammeter') {
    const r = shape.radius || 20;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Text
          x={shape.x - 6}
          y={shape.y - 7}
          text="A"
          fontSize={16}
          fill={shape.strokeColor}
          listening={false}
        />
      </>
    );
  }

  if (type === 'voltmeter') {
    const r = shape.radius || 20;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Text
          x={shape.x - 5}
          y={shape.y - 7}
          text="V"
          fontSize={16}
          fill={shape.strokeColor}
          listening={false}
        />
      </>
    );
  }

  if (type === 'lightBulb') {
    const r = shape.radius || 25;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="#fef08a"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          points={[shape.x - 6, shape.y + r, shape.x + 6, shape.y + r + 8]}
          stroke={shape.strokeColor}
          strokeWidth={1.5}
          listening={false}
        />
        <Line
          points={[shape.x + 6, shape.y + r, shape.x - 6, shape.y + r + 8]}
          stroke={shape.strokeColor}
          strokeWidth={1.5}
          listening={false}
        />
        <Line
          points={[shape.x - 6, shape.y + r + 8, shape.x + 6, shape.y + r + 8]}
          stroke={shape.strokeColor}
          strokeWidth={1.5}
          listening={false}
        />
      </>
    );
  }

  // ─── OPTICS ──────────────────────────────────────────────────────

  if (type === 'convexLens') {
    const h = shape.height || 80;
    return (
      <Line
        {...commonProps}
        points={[
          0, -h / 2,
          -10, -h / 4,
          -10, h / 4,
          0, h / 2,
          10, h / 4,
          10, -h / 4,
          0, -h / 2,
        ]}
        closed
        fill="#dbeafe"
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'concaveLens') {
    const h = shape.height || 80;
    return (
      <Line
        {...commonProps}
        points={[
          0, -h / 2,
          10, -h / 4,
          10, h / 4,
          0, h / 2,
          -10, h / 4,
          -10, -h / 4,
          0, -h / 2,
        ]}
        closed
        fill="#dbeafe"
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'convexMirror') {
    const w = shape.width || 60;
    return (
      <Line
        {...commonProps}
        points={[0, -w / 2, 8, 0, 0, w / 2]}
        tension={0.5}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth + 2}
      />
    );
  }

  if (type === 'concaveMirror') {
    const w = shape.width || 60;
    return (
      <Line
        {...commonProps}
        points={[0, -w / 2, -8, 0, 0, w / 2]}
        tension={0.5}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth + 2}
      />
    );
  }

  if (type === 'prism') {
    const w = shape.width || 60;
    const h = shape.height || 70;
    return (
      <Line
        {...commonProps}
        points={[w / 2, 0, w, h, 0, h]}
        closed
        fill={
          shape.fillColor === 'transparent'
            ? 'linear-gradient(135deg, #fef3c7, #bfdbfe)'
            : shape.fillColor
        }
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'lightRay') {
    const dx = (ps.x2 || shape.x + 120) - shape.x;
    const dy = (ps.y2 || shape.y) - shape.y;
    return (
      <Line
        {...commonProps}
        points={[0, 0, dx, dy]}
        stroke="#eab308"
        strokeWidth={shape.strokeWidth}
        dash={[8, 4]}
      />
    );
  }

  // ─── FLUID MECHANICS ─────────────────────────────────────────────

  if (type === 'fluidFlow') {
    const w = shape.width || 150;
    const h = shape.height || 40;
    return (
      <>
        <Arrow
          {...commonProps}
          points={[0, 0, w, 0]}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          fill={shape.strokeColor}
          pointerLength={10}
          pointerWidth={6}
        />
        {[0.25, 0.5, 0.75].map((t, i) => (
          <Line
            key={`ff-${i}`}
            points={[shape.x + t * w, shape.y - h / 2, shape.x + t * w, shape.y + h / 2]}
            stroke={shape.strokeColor}
            strokeWidth={0.5}
            dash={[2, 2]}
            listening={false}
          />
        ))}
      </>
    );
  }

  if (type === 'pressureGauge') {
    const r = shape.radius || 25;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="#f9fafb"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 1}
        />
        <Line
          points={[shape.x, shape.y, shape.x + r * 0.6, shape.y - r * 0.6]}
          stroke="#ef4444"
          strokeWidth={2}
          listening={false}
        />
      </>
    );
  }

  if (type === 'venturiTube') {
    const w = shape.width || 120;
    const h = shape.height || 60;
    return (
      <Line
        {...commonProps}
        points={[
          0, -h * 0.4,
          w * 0.3, -h * 0.4,
          w * 0.45, -h * 0.15,
          w * 0.55, -h * 0.15,
          w * 0.7, -h * 0.4,
          w, -h * 0.4,
          w, h * 0.4,
          w * 0.7, h * 0.4,
          w * 0.55, h * 0.15,
          w * 0.45, h * 0.15,
          w * 0.3, h * 0.4,
          0, h * 0.4,
        ]}
        closed
        fill={shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />
    );
  }

  if (type === 'bernoulli') {
    const w = shape.width || 150;
    const h = shape.height || 60;
    return (
      <>
        <Line
          {...commonProps}
          points={[
            0, -h * 0.3,
            w * 0.4, -h * 0.1,
            w * 0.6, -h * 0.1,
            w, -h * 0.3,
          ]}
          tension={0}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Line
          {...commonProps}
          points={[
            0, h * 0.3,
            w * 0.4, h * 0.1,
            w * 0.6, h * 0.1,
            w, h * 0.3,
          ]}
          tension={0}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Arrow
          points={[shape.x + 10, shape.y, shape.x + w * 0.45, shape.y]}
          stroke="#2563eb"
          strokeWidth={1.5}
          fill="#2563eb"
          pointerLength={8}
          pointerWidth={5}
          listening={false}
        />
        <Arrow
          points={[shape.x + w * 0.45, shape.y, shape.x + w - 10, shape.y]}
          stroke="#dc2626"
          strokeWidth={2}
          fill="#dc2626"
          pointerLength={8}
          pointerWidth={5}
          listening={false}
        />
      </>
    );
  }

  // ─── ROTATIONAL ──────────────────────────────────────────────────

  if (type === 'torque' || type === 'angularVelocity' || type === 'angularAcceleration') {
    const r = shape.radius || 40;
    const colors: Record<string, string> = {
      torque: '#7c3aed',
      angularVelocity: '#2563eb',
      angularAcceleration: '#dc2626',
    };
    const c = colors[type] || shape.strokeColor;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="transparent"
          stroke={c}
          strokeWidth={shape.strokeWidth}
          dash={[6, 3]}
        />
        {/* Curved arrow */}
        <Line
          points={[
            shape.x + r * 0.8, shape.y + r * 0.5,
            shape.x + r * 0.3, shape.y - r * 0.8,
            shape.x + r * 0.5, shape.y - r * 0.6,
          ]}
          stroke={c}
          strokeWidth={2}
          listening={false}
        />
      </>
    );
  }

  if (type === 'flywheel') {
    const r = shape.radius || 40;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill={
            shape.fillColor === 'transparent' ? '#f0f0f0' : shape.fillColor
          }
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth + 1}
        />
        <Circle
          x={shape.x}
          y={shape.y}
          radius={8}
          fill={shape.strokeColor}
          listening={false}
        />
        <Circle
          x={shape.x}
          y={shape.y}
          radius={r * 0.6}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={1}
          listening={false}
        />
      </>
    );
  }

  if (type === 'gyroscope') {
    const r = shape.radius || 35;
    return (
      <>
        <Circle
          {...commonProps}
          radius={r}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
        <Ellipse
          x={shape.x}
          y={shape.y}
          radiusX={r}
          radiusY={r * 0.3}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          rotation={45}
          listening={false}
        />
        <Ellipse
          x={shape.x}
          y={shape.y}
          radiusX={r}
          radiusY={r * 0.3}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
          rotation={-45}
          listening={false}
        />
        <Circle
          x={shape.x}
          y={shape.y}
          radius={5}
          fill={shape.strokeColor}
          listening={false}
        />
      </>
    );
  }

  // ─── SPECIAL MATH ────────────────────────────────────────────────

  if (type === 'numberLine') {
    const w = shape.width || 200;
    const tickCount = 10;
    const tickSpacing = w / tickCount;
    const elems: any[] = [
      <Line
        key="nl"
        {...commonProps}
        points={[0, 0, w, 0]}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />,
      <Line
        key="nl-arrow"
        points={[w - 5, -4, w, 0, w - 5, 4]}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
        listening={false}
      />,
    ];
    for (let i = 0; i <= tickCount; i++) {
      const tx = i * tickSpacing;
      elems.push(
        <Line
          key={`nl-t-${i}`}
          points={[shape.x + tx, shape.y - 4, shape.x + tx, shape.y + 4]}
          stroke={shape.strokeColor}
          strokeWidth={1}
          listening={false}
        />,
        <Text
          key={`nl-l-${i}`}
          x={shape.x + tx - 3}
          y={shape.y + 6}
          text={String(i)}
          fontSize={8}
          fill={shape.strokeColor}
          listening={false}
        />
      );
    }
    return <>{elems}</>;
  }

  if (type === 'functionPlot') {
    const w = shape.width || 150;
    const h = shape.height || 100;
    const pts: number[] = [];
    for (let x = 0; x <= w; x += 2) {
      const nx = (x - w / 2) / (w / 6);
      const y = Math.sin(nx) * (h / 3);
      pts.push(x, h / 2 - y);
    }
    return (
      <>
        <Rect
          {...commonProps}
          x={0}
          y={0}
          width={w}
          height={h}
          fill="transparent"
          stroke={shape.strokeColor}
          strokeWidth={0.5}
          dash={[2, 2]}
          listening={false}
        />
        <Line
          {...commonProps}
          points={pts}
          tension={0.2}
          stroke={shape.strokeColor}
          strokeWidth={shape.strokeWidth}
        />
      </>
    );
  }

  if (type === 'ruler') {
    const w = shape.width || 200;
    const h = shape.height || 30;
    const elems: any[] = [
      <Rect
        key="ruler"
        {...commonProps}
        width={w}
        height={h}
        fill="#fefce8"
        stroke={shape.strokeColor}
        strokeWidth={1}
        cornerRadius={2}
      />,
    ];
    for (let i = 0; i <= 20; i++) {
      const tx = (i / 20) * w;
      const tickH = i % 5 === 0 ? h * 0.6 : h * 0.3;
      elems.push(
        <Line
          key={`r-${i}`}
          points={[shape.x + tx, shape.y + h, shape.x + tx, shape.y + h - tickH]}
          stroke={shape.strokeColor}
          strokeWidth={0.5}
          listening={false}
        />
      );
    }
    return <>{elems}</>;
  }

  if (type === 'protractor') {
    const r = shape.radius || 60;
    const pts: number[] = [];
    for (let a = 0; a <= Math.PI; a += 0.05) {
      pts.push(Math.cos(a) * r, -Math.sin(a) * r);
    }
    const elems: any[] = [
      <Line
        key="protractor"
        {...commonProps}
        points={pts}
        stroke={shape.strokeColor}
        strokeWidth={shape.strokeWidth}
      />,
      <Line
        key="protractor-base"
        points={[shape.x - r, shape.y, shape.x + r, shape.y]}
        stroke={shape.strokeColor}
        strokeWidth={1}
        listening={false}
      />,
    ];
    // Degree marks
    for (let deg = 0; deg <= 180; deg += 10) {
      const a = (deg * Math.PI) / 180;
      const len = deg % 30 === 0 ? 10 : 5;
      elems.push(
        <Line
          key={`pd-${deg}`}
          points={[
            shape.x + Math.cos(a) * (r - len),
            shape.y - Math.sin(a) * (r - len),
            shape.x + Math.cos(a) * r,
            shape.y - Math.sin(a) * r,
          ]}
          stroke={shape.strokeColor}
          strokeWidth={deg % 30 === 0 ? 1 : 0.5}
          listening={false}
        />
      );
      if (deg % 30 === 0) {
        elems.push(
          <Text
            key={`pl-${deg}`}
            x={shape.x + Math.cos(a) * (r - 16) - 6}
            y={shape.y - Math.sin(a) * (r - 16) - 4}
            text={String(deg)}
            fontSize={7}
            fill={shape.strokeColor}
            listening={false}
          />
        );
      }
    }
    return <>{elems}</>;
  }

  // ─── DEFAULT FALLBACK ────────────────────────────────────────────
  return (
    <Rect
      {...commonProps}
      width={60}
      height={40}
      fill={shape.fillColor}
      stroke={shape.strokeColor}
      strokeWidth={shape.strokeWidth}
    />
  );
}

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { Shape, CoordinateConfig } from './shape-definitions';
import { createDefaultCoordinateConfig } from './shape-definitions';

export interface GeometryCanvasOptions {
  HTMLAttributes: Record<string, string>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    geometryCanvas: {
      insertGeometryCanvas: (attributes?: {
        shapes?: Shape[];
        width?: number;
        height?: number;
        coordinateConfig?: CoordinateConfig;
      }) => ReturnType;
    };
  }
}

export const GeometryCanvas = Node.create<GeometryCanvasOptions>({
  name: 'geometryCanvas',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      shapes: {
        default: [],
        parseHTML: element => {
          const data = element.getAttribute('data-shapes');
          if (!data) return [];
          try {
            return JSON.parse(data);
          } catch {
            return [];
          }
        },
        renderHTML: attributes => ({
          'data-shapes': JSON.stringify(attributes.shapes || []),
        }),
      },
      width: {
        default: 700,
        parseHTML: element => parseInt(element.getAttribute('data-width') || '700', 10),
        renderHTML: attributes => ({
          'data-width': String(attributes.width || 700),
        }),
      },
      height: {
        default: 450,
        parseHTML: element => parseInt(element.getAttribute('data-height') || '450', 10),
        renderHTML: attributes => ({
          'data-height': String(attributes.height || 450),
        }),
      },
      coordinateConfig: {
        default: null,
        parseHTML: element => {
          const data = element.getAttribute('data-coordinate-config');
          if (!data) return null;
          try {
            return JSON.parse(data);
          } catch {
            return null;
          }
        },
        renderHTML: attributes => {
          const cfg = attributes.coordinateConfig;
          if (!cfg) return {};
          return {
            'data-coordinate-config': JSON.stringify(cfg),
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-geometry-canvas]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(
        { 'data-geometry-canvas': '' },
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: 'geometry-canvas-wrapper',
          contenteditable: 'false',
        }
      ),
      ['div', { class: 'geometry-label' }, '\uD83D\uDCCF Geometry Canvas \u2014 Double-click to edit'],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GeometryCanvasNodeView);
  },

  addCommands() {
    return {
      insertGeometryCanvas:
        (attributes) =>
        ({ commands }) => {
          const shapes = attributes?.shapes || [];
          const width = attributes?.width || 700;
          const height = attributes?.height || 450;
          const coordinateConfig = attributes?.coordinateConfig || null;

          return commands.insertContent({
            type: this.name,
            attrs: { shapes, width, height, coordinateConfig },
          });
        },
    };
  },
});

// ─── React NodeView Component ──────────────────────────────────────────
// Renders an inline read-only preview of the geometry canvas in the editor.
// Uses next/dynamic for SSR-safe loading of Konva.

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Use next/dynamic with ssr:false to avoid ChunkLoadError with Konva
const KonvaCanvasPreview = dynamic(
  () => import('@/components/editor/KonvaCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading canvas...
      </div>
    ),
  }
);

function GeometryCanvasNodeView({ node }: { node: any }) {
  const attrs = node.attrs as {
    shapes: Shape[];
    width: number;
    height: number;
    coordinateConfig: CoordinateConfig | null;
  };

  const shapes = attrs.shapes || [];
  const width = attrs.width || 700;
  const height = attrs.height || 450;

  // Use stored coordinate config or default
  const coordinateConfig = attrs.coordinateConfig || createDefaultCoordinateConfig();

  // Responsive preview width
  const previewWidth = Math.min(width, 580);
  const previewHeight = Math.round(height * (previewWidth / width));

  return (
    <NodeViewWrapper className="geometry-canvas-wrapper" style={{ width: '100%' }}>
      <Suspense fallback={
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading canvas...
        </div>
      }>
        <KonvaCanvasPreview
          width={previewWidth}
          height={previewHeight}
          shapes={shapes}
          selectedShapeId={null}
          coordinateConfig={coordinateConfig}
          onCanvasClick={() => {}}
          onSelectShape={() => {}}
          onUpdateShape={() => {}}
          editable={false}
          isDrawingLine={false}
          lineStart={null}
        />
      </Suspense>
      <div className="geometry-label">
        {shapes.length > 0
          ? `\uD83D\uDCCF Geometry Canvas (${shapes.length} shapes, ${coordinateConfig.showZAxis ? 'XYZ' : 'XY'} coordinate)`
          : `\uD83D\uDCCF ${coordinateConfig.showZAxis ? 'XYZ' : 'XY'} Coordinate System`}
      </div>
    </NodeViewWrapper>
  );
}

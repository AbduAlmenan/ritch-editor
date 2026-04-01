'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  MousePointer2,
  Trash2,
  Search,
  Grid3X3,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  SHAPE_REGISTRY,
  MATH_SUBCATEGORIES,
  PHYSICS_SUBCATEGORIES,
  type ShapeCategory,
} from '@/lib/editor/shape-definitions';

export type GeometryTool =
  | { type: 'select' }
  | { type: 'shape'; category: ShapeCategory; shapeType: string }
  | { type: 'delete' };

interface GeometryToolbarProps {
  activeTool: GeometryTool;
  onToolChange: (tool: GeometryTool) => void;
}

export function GeometryToolbar({ activeTool, onToolChange }: GeometryToolbarProps) {
  const [activeTab, setActiveTab] = useState<'math' | 'physics' | 'coord'>('math');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const isActive = (tool: GeometryTool) => {
    if (activeTool.type !== tool.type) return false;
    if (tool.type === 'shape' && activeTool.type === 'shape') {
      return activeTool.shapeType === tool.shapeType;
    }
    return true;
  };

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Filter shapes by search
  const filteredRegistry = useMemo(() => {
    if (!searchQuery.trim()) return SHAPE_REGISTRY;
    const q = searchQuery.toLowerCase();
    return SHAPE_REGISTRY.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q) ||
        s.subcategory.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Group filtered shapes by category + subcategory
  const mathShapes = filteredRegistry.filter((s) => s.category === 'math');
  const physicsShapes = filteredRegistry.filter((s) => s.category === 'physics');

  // Group by subcategory
  const mathGroups = useMemo(() => {
    const groups = new Map<string, typeof mathShapes>();
    for (const sub of MATH_SUBCATEGORIES) {
      const items = mathShapes.filter((s) => s.subcategory === sub);
      if (items.length > 0) groups.set(sub, items);
    }
    // Also add any uncategorized
    const uncategorized = mathShapes.filter(
      (s) => !MATH_SUBCATEGORIES.includes(s.subcategory)
    );
    if (uncategorized.length > 0) groups.set('Other', uncategorized);
    return groups;
  }, [mathShapes]);

  const physicsGroups = useMemo(() => {
    const groups = new Map<string, typeof physicsShapes>();
    for (const sub of PHYSICS_SUBCATEGORIES) {
      const items = physicsShapes.filter((s) => s.subcategory === sub);
      if (items.length > 0) groups.set(sub, items);
    }
    const uncategorized = physicsShapes.filter(
      (s) => !PHYSICS_SUBCATEGORIES.includes(s.subcategory)
    );
    if (uncategorized.length > 0) groups.set('Other', uncategorized);
    return groups;
  }, [physicsShapes]);

  const renderShapeButton = (
    shape: { type: string; label: string; icon: string; category: ShapeCategory }
  ) => (
    <Tooltip key={shape.type}>
      <TooltipTrigger asChild>
        <Button
          variant={
            isActive({ type: 'shape', category: shape.category, shapeType: shape.type })
              ? 'default'
              : 'outline'
          }
          size="sm"
          onClick={() =>
            onToolChange({ type: 'shape', category: shape.category, shapeType: shape.type })
          }
          className="h-7 text-[10px] px-1.5 font-normal truncate"
        >
          <span className="mr-0.5 text-xs">{shape.icon}</span>
          <span className="truncate max-w-[50px]">{shape.label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="text-xs">{shape.label}</span>
      </TooltipContent>
    </Tooltip>
  );

  const renderGroup = (
    name: string,
    items: { type: string; label: string; icon: string; category: ShapeCategory }[],
    prefix: string
  ) => {
    const groupKey = `${prefix}-${name}`;
    const isCollapsed = collapsedGroups.has(groupKey);
    return (
      <div key={groupKey} className="mb-1">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="flex items-center gap-1 w-full text-[10px] text-muted-foreground uppercase tracking-wider px-1 py-0.5 hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
          {name}
          <span className="ml-auto text-[9px] font-normal normal-case">
            {items.length}
          </span>
        </button>
        {!isCollapsed && (
          <div className="grid grid-cols-2 gap-1 px-0.5">
            {items.map(renderShapeButton)}
          </div>
        )}
      </div>
    );
  };

  const totalFiltered = filteredRegistry.length;

  return (
    <div className="space-y-2 p-2">
      {/* Tool selection */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isActive({ type: 'select' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange({ type: 'select' })}
              className="h-8 w-8 p-0"
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Select & Move</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isActive({ type: 'delete' }) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange({ type: 'delete' })}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Shape</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shapes..."
          className="h-7 pl-7 text-xs"
        />
        {searchQuery && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground">
            {totalFiltered}
          </span>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'math' | 'physics' | 'coord')}
      >
        <TabsList className="w-full h-8">
          <TabsTrigger value="math" className="text-xs flex-1 h-7">
            Math
          </TabsTrigger>
          <TabsTrigger value="physics" className="text-xs flex-1 h-7">
            Physics
          </TabsTrigger>
          <TabsTrigger value="coord" className="text-xs flex-1 h-7">
            <Grid3X3 className="h-3 w-3 mr-0.5" />
            Coord
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Shape lists */}
      <ScrollArea className="max-h-[500px] overflow-y-auto">
        {activeTab === 'math' && (
          <div className="space-y-0.5">
            {mathGroups.size === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-2 text-center">
                No shapes found
              </p>
            ) : (
              Array.from(mathGroups.entries()).map(([name, items]) =>
                renderGroup(name, items, 'math')
              )
            )}
          </div>
        )}

        {activeTab === 'physics' && (
          <div className="space-y-0.5">
            {physicsGroups.size === 0 ? (
              <p className="text-xs text-muted-foreground px-1 py-2 text-center">
                No shapes found
              </p>
            ) : (
              Array.from(physicsGroups.entries()).map(([name, items]) =>
                renderGroup(name, items, 'physics')
              )
            )}
          </div>
        )}

        {activeTab === 'coord' && (
          <div className="space-y-1 px-1">
            <p className="text-xs text-muted-foreground text-center py-4">
              Coordinate settings are available in the properties panel below.
            </p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              The coordinate system supports:
            </p>
            <ul className="text-[10px] text-muted-foreground space-y-0.5 ml-2">
              <li>• X-Y grid with minor grid lines</li>
              <li>• Tick marks & number labels</li>
              <li>• Z-axis (isometric projection)</li>
              <li>• Custom axis colors & labels</li>
              <li>• Adjustable ranges</li>
            </ul>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default GeometryToolbar;

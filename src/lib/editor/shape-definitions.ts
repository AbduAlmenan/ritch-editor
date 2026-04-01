// shape-definitions.ts - 100+ shape types with categories, subcategories, and factory functions

export type ShapeCategory = 'math' | 'physics' | 'coordinate' | 'drawing';

export interface ShapeBase {
  id: string;
  type: string;
  category: ShapeCategory;
  x: number;
  y: number;
  rotation: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  label?: string;
  locked?: boolean;
}

export interface MathShape extends ShapeBase {
  category: 'math';
  type: string;
  width?: number;
  height?: number;
  radius?: number;
  sides?: number;
  x2?: number;
  y2?: number;
  magnitude?: number;
  direction?: number;
  angle?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface PhysicsShape extends ShapeBase {
  category: 'physics';
  type: string;
  width?: number;
  height?: number;
  magnitude?: number;
  direction?: number;
  mass?: number;
  x2?: number;
  y2?: number;
}

export interface CoordinateConfig {
  showGrid: boolean;
  showAxes: boolean;
  showZAxis: boolean;
  showMinorGrid: boolean;
  gridSpacing: number;
  minorGridSpacing: number;
  showLabels: boolean;
  showTickMarks: boolean;
  showOrigin: boolean;
  showAxisArrows: boolean;
  axisColor: string;
  gridColor: string;
  minorGridColor: string;
  labelColor: string;
  xAxisColor: string;
  yAxisColor: string;
  zAxisColor: string;
  axisWidth: number;
  gridWidth: number;
  labelFontSize: number;
  xRange: [number, number];
  yRange: [number, number];
  zRange: [number, number];
  xLabel: string;
  yLabel: string;
  zLabel: string;
  originLabel: string;
}

export interface GeometryCanvasConfig {
  width: number;
  height: number;
  shapes: (MathShape | PhysicsShape)[];
  coordinateConfig: CoordinateConfig;
  backgroundColor: string;
}

export type Shape = MathShape | PhysicsShape;

// ─── Shape Registry ───────────────────────────────────────────────────────

export interface ShapeDefinition {
  type: string;
  label: string;
  icon: string;
  subcategory: string;
  category: ShapeCategory;
}

// MATH SHAPES

const mathBasic2D: ShapeDefinition[] = [
  { type: 'circle', label: 'Circle', icon: '⬤', subcategory: 'Basic 2D', category: 'math' },
  { type: 'ellipse', label: 'Ellipse', icon: '⬭', subcategory: 'Basic 2D', category: 'math' },
  { type: 'rectangle', label: 'Rectangle', icon: '▬', subcategory: 'Basic 2D', category: 'math' },
  { type: 'square', label: 'Square', icon: '■', subcategory: 'Basic 2D', category: 'math' },
  { type: 'triangle', label: 'Triangle', icon: '▲', subcategory: 'Basic 2D', category: 'math' },
  { type: 'rightTriangle', label: 'Right Triangle', icon: '⊿', subcategory: 'Basic 2D', category: 'math' },
  { type: 'equilateralTriangle', label: 'Equilateral △', icon: '△', subcategory: 'Basic 2D', category: 'math' },
  { type: 'isoscelesTriangle', label: 'Isosceles △', icon: '▵', subcategory: 'Basic 2D', category: 'math' },
  { type: 'regularPolygon', label: 'Polygon', icon: '⬠', subcategory: 'Basic 2D', category: 'math' },
  { type: 'parallelogram', label: 'Parallelogram', icon: '▱', subcategory: 'Basic 2D', category: 'math' },
  { type: 'trapezoid', label: 'Trapezoid', icon: '⏢', subcategory: 'Basic 2D', category: 'math' },
  { type: 'rhombus', label: 'Rhombus', icon: '◆', subcategory: 'Basic 2D', category: 'math' },
  { type: 'kite', label: 'Kite', icon: '◆', subcategory: 'Basic 2D', category: 'math' },
  { type: 'arrow', label: 'Arrow', icon: '→', subcategory: 'Basic 2D', category: 'math' },
  { type: 'chevron', label: 'Chevron', icon: '›', subcategory: 'Basic 2D', category: 'math' },
];

const mathCurves: ShapeDefinition[] = [
  { type: 'semicircle', label: 'Semicircle', icon: '◡', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'quarterCircle', label: 'Quarter Circle', icon: '⌒', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'arc', label: 'Arc', icon: '⌒', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'spiral', label: 'Spiral', icon: '🌀', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'sineWave', label: 'Sine Wave', icon: '〰', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'cosineWave', label: 'Cosine Wave', icon: '∿', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'parabola', label: 'Parabola', icon: '∩', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'hyperbola', label: 'Hyperbola', icon: '◯', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'bezierCurve', label: 'Bézier Curve', icon: '〰', subcategory: 'Curves & Arcs', category: 'math' },
  { type: 'cardioid', label: 'Cardioid', icon: '♡', subcategory: 'Curves & Arcs', category: 'math' },
];

const mathLines: ShapeDefinition[] = [
  { type: 'line', label: 'Line', icon: '⟶', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'ray', label: 'Ray', icon: '→', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'lineSegment', label: 'Segment', icon: '|', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'parallelLines', label: 'Parallel Lines', icon: '∥', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'perpendicularLines', label: 'Perp. Lines', icon: '⊥', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'intersectingLines', label: 'Intersecting', icon: '×', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'angle', label: 'Angle', icon: '∠', subcategory: 'Lines & Segments', category: 'math' },
  { type: 'angleBisector', label: 'Angle Bisector', icon: '∠', subcategory: 'Lines & Segments', category: 'math' },
];

const mathVectors: ShapeDefinition[] = [
  { type: 'vector', label: 'Vector', icon: '⇀', subcategory: 'Vectors & Matrices', category: 'math' },
  { type: 'vectorAddition', label: 'Vector Add', icon: '⇀+', subcategory: 'Vectors & Matrices', category: 'math' },
  { type: 'unitVector', label: 'Unit Vector', icon: '̂', subcategory: 'Vectors & Matrices', category: 'math' },
  { type: 'positionVector', label: 'Position Vec', icon: '⇀', subcategory: 'Vectors & Matrices', category: 'math' },
  { type: 'plane', label: 'Plane', icon: '▱', subcategory: 'Vectors & Matrices', category: 'math' },
  { type: 'coordinatePoint', label: 'Coord Point', icon: '●', subcategory: 'Vectors & Matrices', category: 'math' },
];

const mathConics: ShapeDefinition[] = [
  { type: 'circleSection', label: 'Circle Section', icon: '◡', subcategory: 'Conic Sections', category: 'math' },
  { type: 'ellipseArc', label: 'Ellipse Arc', icon: '⌒', subcategory: 'Conic Sections', category: 'math' },
  { type: 'parabolaCurve', label: 'Parabola', icon: '∩', subcategory: 'Conic Sections', category: 'math' },
  { type: 'hyperbolaCurve', label: 'Hyperbola', icon: '◯', subcategory: 'Conic Sections', category: 'math' },
  { type: 'lemniscate', label: 'Lemniscate', icon: '∞', subcategory: 'Conic Sections', category: 'math' },
];

const mathPolygons: ShapeDefinition[] = [
  { type: 'pentagon', label: 'Pentagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'hexagon', label: 'Hexagon', icon: '⬡', subcategory: 'Polygons', category: 'math' },
  { type: 'heptagon', label: 'Heptagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'octagon', label: 'Octagon', icon: '⯃', subcategory: 'Polygons', category: 'math' },
  { type: 'nonagon', label: 'Nonagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'decagon', label: 'Decagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'hendecagon', label: 'Hendecagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'dodecagon', label: 'Dodecagon', icon: '⬠', subcategory: 'Polygons', category: 'math' },
  { type: 'star3', label: '3-Star', icon: '✦', subcategory: 'Polygons', category: 'math' },
  { type: 'star4', label: '4-Star', icon: '✦', subcategory: 'Polygons', category: 'math' },
  { type: 'star5', label: '5-Star', icon: '★', subcategory: 'Polygons', category: 'math' },
  { type: 'star6', label: '6-Star', icon: '✶', subcategory: 'Polygons', category: 'math' },
  { type: 'cross', label: 'Cross', icon: '✚', subcategory: 'Polygons', category: 'math' },
];

const mathSpecial: ShapeDefinition[] = [
  { type: 'gridPoint', label: 'Grid Point', icon: '·', subcategory: 'Special Math', category: 'math' },
  { type: 'numberLine', label: 'Number Line', icon: '⟶', subcategory: 'Special Math', category: 'math' },
  { type: 'functionPlot', label: 'Function Plot', icon: '📈', subcategory: 'Special Math', category: 'math' },
  { type: 'ruler', label: 'Ruler', icon: '📏', subcategory: 'Special Math', category: 'math' },
  { type: 'protractor', label: 'Protractor', icon: '∠', subcategory: 'Special Math', category: 'math' },
  { type: 'point', label: 'Point', icon: '●', subcategory: 'Special Math', category: 'math' },
];

// PHYSICS SHAPES

const physicsForces: ShapeDefinition[] = [
  { type: 'forceArrow', label: 'Force', icon: '→', subcategory: 'Forces', category: 'physics' },
  { type: 'netForce', label: 'Net Force', icon: '⇒', subcategory: 'Forces', category: 'physics' },
  { type: 'weight', label: 'Weight', icon: '↓', subcategory: 'Forces', category: 'physics' },
  { type: 'normalForce', label: 'Normal', icon: '↑', subcategory: 'Forces', category: 'physics' },
  { type: 'frictionForce', label: 'Friction', icon: '←', subcategory: 'Forces', category: 'physics' },
  { type: 'tension', label: 'Tension', icon: '↗', subcategory: 'Forces', category: 'physics' },
  { type: 'appliedForce', label: 'Applied', icon: '⇢', subcategory: 'Forces', category: 'physics' },
  { type: 'reactionForce', label: 'Reaction', icon: '⇠', subcategory: 'Forces', category: 'physics' },
];

const physicsMotion: ShapeDefinition[] = [
  { type: 'velocityArrow', label: 'Velocity', icon: '⇢', subcategory: 'Motion', category: 'physics' },
  { type: 'accelerationArrow', label: 'Acceleration', icon: '⤏', subcategory: 'Motion', category: 'physics' },
  { type: 'momentumArrow', label: 'Momentum', icon: '⇀', subcategory: 'Motion', category: 'physics' },
  { type: 'displacementArrow', label: 'Displacement', icon: '↝', subcategory: 'Motion', category: 'physics' },
  { type: 'projectilePath', label: 'Projectile', icon: '∩', subcategory: 'Motion', category: 'physics' },
  { type: 'circularMotion', label: 'Circular Motion', icon: '↻', subcategory: 'Motion', category: 'physics' },
];

const physicsMachines: ShapeDefinition[] = [
  { type: 'lever', label: 'Lever', icon: '⚙', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'pulley', label: 'Pulley', icon: '◯', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'inclinedPlane', label: 'Inclined Plane', icon: '⊿', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'wedge', label: 'Wedge', icon: '▵', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'screw', label: 'Screw', icon: '🔄', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'wheelAxle', label: 'Wheel & Axle', icon: '◎', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'gear', label: 'Gear', icon: '⚙', subcategory: 'Simple Machines', category: 'physics' },
  { type: 'fulcrum', label: 'Fulcrum', icon: '△', subcategory: 'Simple Machines', category: 'physics' },
];

const physicsSprings: ShapeDefinition[] = [
  { type: 'spring', label: 'Spring', icon: '∿', subcategory: 'Springs & Pendulums', category: 'physics' },
  { type: 'damper', label: 'Damper', icon: '┃', subcategory: 'Springs & Pendulums', category: 'physics' },
  { type: 'pendulum', label: 'Pendulum', icon: '⊖', subcategory: 'Springs & Pendulums', category: 'physics' },
  { type: 'simplePendulum', label: 'Simple Pend.', icon: '⊖', subcategory: 'Springs & Pendulums', category: 'physics' },
  { type: 'torsionalPendulum', label: 'Torsional Pend.', icon: '↻', subcategory: 'Springs & Pendulums', category: 'physics' },
  { type: 'springMass', label: 'Spring-Mass', icon: '∿●', subcategory: 'Springs & Pendulums', category: 'physics' },
];

const physicsWaves: ShapeDefinition[] = [
  { type: 'transverseWave', label: 'Transverse', icon: '〰', subcategory: 'Waves', category: 'physics' },
  { type: 'longitudinalWave', label: 'Longitudinal', icon: '⇢⇠', subcategory: 'Waves', category: 'physics' },
  { type: 'standingWave', label: 'Standing', icon: '∿∿', subcategory: 'Waves', category: 'physics' },
  { type: 'waveFront', label: 'Wave Front', icon: '≋', subcategory: 'Waves', category: 'physics' },
  { type: 'interference', label: 'Interference', icon: '≋≋', subcategory: 'Waves', category: 'physics' },
  { type: 'diffraction', label: 'Diffraction', icon: '≋▷', subcategory: 'Waves', category: 'physics' },
];

const physicsThermo: ShapeDefinition[] = [
  { type: 'thermometer', label: 'Thermometer', icon: '🌡', subcategory: 'Thermodynamics', category: 'physics' },
  { type: 'heatFlow', label: 'Heat Flow', icon: '⇢', subcategory: 'Thermodynamics', category: 'physics' },
  { type: 'piston', label: 'Piston', icon: '⊡', subcategory: 'Thermodynamics', category: 'physics' },
  { type: 'expansion', label: 'Expansion', icon: '↔', subcategory: 'Thermodynamics', category: 'physics' },
  { type: 'compression', label: 'Compression', icon: '→←', subcategory: 'Thermodynamics', category: 'physics' },
];

const physicsElectricity: ShapeDefinition[] = [
  { type: 'resistor', label: 'Resistor', icon: '⏚', subcategory: 'Electricity', category: 'physics' },
  { type: 'capacitor', label: 'Capacitor', icon: '┃┃', subcategory: 'Electricity', category: 'physics' },
  { type: 'inductor', label: 'Inductor', icon: '∿∿', subcategory: 'Electricity', category: 'physics' },
  { type: 'battery', label: 'Battery', icon: '🔋', subcategory: 'Electricity', category: 'physics' },
  { type: 'switchClosed', label: 'Switch (On)', icon: '─●', subcategory: 'Electricity', category: 'physics' },
  { type: 'switchOpen', label: 'Switch (Off)', icon: '─○', subcategory: 'Electricity', category: 'physics' },
  { type: 'ammeter', label: 'Ammeter', icon: 'A', subcategory: 'Electricity', category: 'physics' },
  { type: 'voltmeter', label: 'Voltmeter', icon: 'V', subcategory: 'Electricity', category: 'physics' },
  { type: 'lightBulb', label: 'Light Bulb', icon: '💡', subcategory: 'Electricity', category: 'physics' },
];

const physicsOptics: ShapeDefinition[] = [
  { type: 'convexLens', label: 'Convex Lens', icon: '◯', subcategory: 'Optics', category: 'physics' },
  { type: 'concaveLens', label: 'Concave Lens', icon: '◑', subcategory: 'Optics', category: 'physics' },
  { type: 'convexMirror', label: 'Convex Mirror', icon: ')', subcategory: 'Optics', category: 'physics' },
  { type: 'concaveMirror', label: 'Concave Mirror', icon: '(', subcategory: 'Optics', category: 'physics' },
  { type: 'prism', label: 'Prism', icon: '△', subcategory: 'Optics', category: 'physics' },
  { type: 'lightRay', label: 'Light Ray', icon: '⇢', subcategory: 'Optics', category: 'physics' },
];

const physicsFluid: ShapeDefinition[] = [
  { type: 'fluidFlow', label: 'Fluid Flow', icon: '⇢', subcategory: 'Fluid Mechanics', category: 'physics' },
  { type: 'pressureGauge', label: 'Pressure Gauge', icon: '⊕', subcategory: 'Fluid Mechanics', category: 'physics' },
  { type: 'venturiTube', label: 'Venturi Tube', icon: '⊲⊳', subcategory: 'Fluid Mechanics', category: 'physics' },
  { type: 'bernoulli', label: 'Bernoulli', icon: '⇢△', subcategory: 'Fluid Mechanics', category: 'physics' },
];

const physicsRotational: ShapeDefinition[] = [
  { type: 'torque', label: 'Torque', icon: '↻', subcategory: 'Rotational', category: 'physics' },
  { type: 'angularVelocity', label: 'Angular Vel.', icon: '↻', subcategory: 'Rotational', category: 'physics' },
  { type: 'angularAcceleration', label: 'Angular Acc.', icon: '⇻', subcategory: 'Rotational', category: 'physics' },
  { type: 'flywheel', label: 'Flywheel', icon: '◎', subcategory: 'Rotational', category: 'physics' },
  { type: 'gyroscope', label: 'Gyroscope', icon: '◉', subcategory: 'Rotational', category: 'physics' },
];

// Combined registry
export const SHAPE_REGISTRY: ShapeDefinition[] = [
  ...mathBasic2D,
  ...mathCurves,
  ...mathLines,
  ...mathVectors,
  ...mathConics,
  ...mathPolygons,
  ...mathSpecial,
  ...physicsForces,
  ...physicsMotion,
  ...physicsMachines,
  ...physicsSprings,
  ...physicsWaves,
  ...physicsThermo,
  ...physicsElectricity,
  ...physicsOptics,
  ...physicsFluid,
  ...physicsRotational,
];

// Helper functions for querying shapes

export function getShapesByCategory(category: ShapeCategory): ShapeDefinition[] {
  return SHAPE_REGISTRY.filter((s) => s.category === category);
}

export function getShapesBySubcategory(subcategory: string): ShapeDefinition[] {
  return SHAPE_REGISTRY.filter((s) => s.subcategory === subcategory);
}

export function getShapeSubcategory(type: string): string {
  return SHAPE_REGISTRY.find((s) => s.type === type)?.subcategory || 'Other';
}

export function getShapeCategory(type: string): ShapeCategory {
  return SHAPE_REGISTRY.find((s) => s.type === type)?.category || 'math';
}

// ─── Default Configs ──────────────────────────────────────────────────────

export function createDefaultCoordinateConfig(): CoordinateConfig {
  return {
    showGrid: true,
    showAxes: true,
    showZAxis: true,
    showMinorGrid: false,
    gridSpacing: 40,
    minorGridSpacing: 8,
    showLabels: true,
    showTickMarks: true,
    showOrigin: true,
    showAxisArrows: true,
    axisColor: '#333333',
    gridColor: '#e5e7eb',
    minorGridColor: '#f3f4f6',
    labelColor: '#666666',
    xAxisColor: '#dc2626',
    yAxisColor: '#16a34a',
    zAxisColor: '#2563eb',
    axisWidth: 1.5,
    gridWidth: 0.5,
    labelFontSize: 10,
    xRange: [-10, 10],
    yRange: [-10, 10],
    zRange: [-10, 10],
    xLabel: 'x',
    yLabel: 'y',
    zLabel: 'z',
    originLabel: 'O',
  };
}

export function createDefaultCanvasConfig(): GeometryCanvasConfig {
  return {
    width: 700,
    height: 450,
    shapes: [],
    coordinateConfig: createDefaultCoordinateConfig(),
    backgroundColor: '#ffffff',
  };
}

// ─── Force color helper ───────────────────────────────────────────────────

export function getForceColor(type: string): string {
  const colors: Record<string, string> = {
    forceArrow: '#e53e3e',
    netForce: '#c53030',
    weight: '#7c3aed',
    normalForce: '#16a34a',
    frictionForce: '#d97706',
    tension: '#2563eb',
    appliedForce: '#0891b2',
    reactionForce: '#dc2626',
  };
  return colors[type] || '#e53e3e';
}

// ─── Shape Type Groups ────────────────────────────────────────────────────

const FORCE_TYPES = [
  'forceArrow', 'netForce', 'weight', 'normalForce',
  'frictionForce', 'tension', 'appliedForce', 'reactionForce',
];

const MOTION_ARROW_TYPES = [
  'velocityArrow', 'accelerationArrow', 'momentumArrow', 'displacementArrow',
];

const ARROW_TYPES = [
  'vector', 'vectorAddition', 'unitVector', 'positionVector', 'arrow',
];

const LINE_TYPES = [
  'line', 'ray', 'lineSegment', 'parallelLines', 'perpendicularLines',
  'intersectingLines', 'angleBisector',
];

const REGULAR_POLYGON_TYPES: Record<string, number> = {
  pentagon: 5,
  hexagon: 6,
  heptagon: 7,
  octagon: 8,
  nonagon: 9,
  decagon: 10,
  hendecagon: 11,
  dodecagon: 12,
};

const STAR_TYPES: Record<string, { points: number; innerRadius: number }> = {
  star3: { points: 3, innerRadius: 0.4 },
  star4: { points: 4, innerRadius: 0.4 },
  star5: { points: 5, innerRadius: 0.4 },
  star6: { points: 6, innerRadius: 0.5 },
};

const WAVE_TYPES = [
  'sineWave', 'cosineWave', 'transverseWave', 'standingWave',
];

const ELECTRICITY_TYPES = [
  'resistor', 'capacitor', 'inductor', 'battery',
  'switchClosed', 'switchOpen', 'ammeter', 'voltmeter', 'lightBulb',
];

const ROTATIONAL_TYPES = [
  'torque', 'angularVelocity', 'angularAcceleration', 'flywheel', 'gyroscope',
];

// ─── Create Shape Factory ─────────────────────────────────────────────────

export function createShape(type: string, category: ShapeCategory, x: number, y: number): Shape {
  const base: ShapeBase = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    category,
    x,
    y,
    rotation: 0,
    fillColor: 'transparent',
    strokeColor: '#333333',
    strokeWidth: 2,
    opacity: 1,
  };

  // Force arrows
  if (FORCE_TYPES.includes(type)) {
    return {
      ...base,
      x2: x + 120,
      y2: y,
      magnitude: 50,
      strokeColor: getForceColor(type),
    } as PhysicsShape;
  }

  // Motion arrows
  if (MOTION_ARROW_TYPES.includes(type)) {
    const colors: Record<string, string> = {
      velocityArrow: '#3182ce',
      accelerationArrow: '#38a169',
      momentumArrow: '#d69e2e',
      displacementArrow: '#805ad5',
    };
    return {
      ...base,
      x2: x + 120,
      y2: y,
      magnitude: 30,
      strokeColor: colors[type] || base.strokeColor,
    } as PhysicsShape;
  }

  // Math vectors/arrows
  if (ARROW_TYPES.includes(type)) {
    return {
      ...base,
      x2: x + 120,
      y2: y - 60,
      magnitude: 100,
      direction: 0,
    } as MathShape;
  }

  // Line types
  if (LINE_TYPES.includes(type)) {
    if (type === 'parallelLines') {
      return { ...base, x2: x + 150, y2: y, width: 150, height: 30 } as MathShape;
    }
    if (type === 'perpendicularLines') {
      return { ...base, x2: x + 120, y2: y, width: 120, height: 100 } as MathShape;
    }
    if (type === 'intersectingLines') {
      return { ...base, x2: x + 150, y2: y, width: 150, height: 100 } as MathShape;
    }
    if (type === 'angleBisector') {
      return { ...base, x2: x + 100, y2: y, angle: 45 } as MathShape;
    }
    if (type === 'line') {
      return { ...base, x2: x + 150, y2: y } as MathShape;
    }
    if (type === 'ray') {
      return { ...base, x2: x + 150, y2: y } as MathShape;
    }
    return { ...base, x2: x + 150, y2: y } as MathShape;
  }

  // Angles
  if (type === 'angle') {
    return { ...base, radius: 40, startAngle: 0, endAngle: 90 } as MathShape;
  }

  // Regular polygons (specific names)
  if (type in REGULAR_POLYGON_TYPES) {
    return {
      ...base,
      radius: 50,
      sides: REGULAR_POLYGON_TYPES[type],
    } as MathShape;
  }

  // Stars
  if (type in STAR_TYPES) {
    const info = STAR_TYPES[type];
    return {
      ...base,
      radius: 50,
      sides: info.points,
    } as MathShape;
  }

  // Basic 2D
  switch (type) {
    case 'circle':
      return { ...base, radius: 50 } as MathShape;
    case 'ellipse':
      return { ...base, width: 120, height: 70 } as MathShape;
    case 'rectangle':
      return { ...base, width: 120, height: 80 } as MathShape;
    case 'square':
      return { ...base, width: 80, height: 80 } as MathShape;
    case 'triangle':
      return { ...base, width: 100, height: 90 } as MathShape;
    case 'rightTriangle':
      return { ...base, width: 100, height: 80 } as MathShape;
    case 'equilateralTriangle':
      return { ...base, width: 100, height: 87 } as MathShape;
    case 'isoscelesTriangle':
      return { ...base, width: 100, height: 90 } as MathShape;
    case 'regularPolygon':
      return { ...base, radius: 50, sides: 6 } as MathShape;
    case 'parallelogram':
      return { ...base, width: 120, height: 70 } as MathShape;
    case 'trapezoid':
      return { ...base, width: 120, height: 70 } as MathShape;
    case 'rhombus':
      return { ...base, width: 80, height: 100 } as MathShape;
    case 'kite':
      return { ...base, width: 80, height: 100 } as MathShape;
    case 'chevron':
      return { ...base, width: 80, height: 60 } as MathShape;
    case 'cross':
      return { ...base, width: 80, height: 80 } as MathShape;

    // Curves & Arcs
    case 'semicircle':
      return { ...base, width: 100, height: 50 } as MathShape;
    case 'quarterCircle':
      return { ...base, width: 60, height: 60 } as MathShape;
    case 'arc':
      return { ...base, radius: 50, startAngle: 0, endAngle: 270 } as MathShape;
    case 'spiral':
      return { ...base, radius: 50, width: 100, height: 100 } as MathShape;
    case 'sineWave':
      return { ...base, width: 150, height: 40 } as MathShape;
    case 'cosineWave':
      return { ...base, width: 150, height: 40 } as MathShape;
    case 'parabola':
      return { ...base, width: 100, height: 80 } as MathShape;
    case 'hyperbola':
      return { ...base, width: 120, height: 80 } as MathShape;
    case 'bezierCurve':
      return { ...base, width: 150, height: 80, x2: x + 150, y2: y } as MathShape;
    case 'cardioid':
      return { ...base, radius: 50, width: 100, height: 100 } as MathShape;

    // Vectors
    case 'plane':
      return { ...base, width: 120, height: 80 } as MathShape;
    case 'coordinatePoint':
      return { ...base, radius: 5 } as MathShape;

    // Conics
    case 'circleSection':
      return { ...base, radius: 50, startAngle: 30, endAngle: 150 } as MathShape;
    case 'ellipseArc':
      return { ...base, width: 120, height: 70, startAngle: 0, endAngle: 180 } as MathShape;
    case 'parabolaCurve':
      return { ...base, width: 100, height: 80 } as MathShape;
    case 'hyperbolaCurve':
      return { ...base, width: 120, height: 80 } as MathShape;
    case 'lemniscate':
      return { ...base, radius: 50, width: 120, height: 60 } as MathShape;

    // Special Math
    case 'gridPoint':
      return { ...base, radius: 4 } as MathShape;
    case 'numberLine':
      return { ...base, width: 200, height: 10 } as MathShape;
    case 'functionPlot':
      return { ...base, width: 150, height: 100 } as MathShape;
    case 'ruler':
      return { ...base, width: 200, height: 30 } as MathShape;
    case 'protractor':
      return { ...base, radius: 60, width: 120, height: 60 } as MathShape;
    case 'point':
      return { ...base, radius: 5 } as MathShape;

    // Physics
    case 'spring':
      return { ...base, width: 150, height: 40 } as PhysicsShape;
    case 'damper':
      return { ...base, width: 120, height: 40 } as PhysicsShape;
    case 'pendulum':
      return { ...base, width: 20, height: 150 } as PhysicsShape;
    case 'simplePendulum':
      return { ...base, width: 20, height: 150 } as PhysicsShape;
    case 'torsionalPendulum':
      return { ...base, width: 60, height: 60 } as PhysicsShape;
    case 'springMass':
      return { ...base, width: 150, height: 80 } as PhysicsShape;
    case 'lever':
      return { ...base, width: 200, height: 20 } as PhysicsShape;
    case 'pulley':
      return { ...base, radius: 30 } as PhysicsShape;
    case 'inclinedPlane':
      return { ...base, width: 150, height: 80 } as PhysicsShape;
    case 'wedge':
      return { ...base, width: 80, height: 60 } as PhysicsShape;
    case 'screw':
      return { ...base, width: 30, height: 100 } as PhysicsShape;
    case 'wheelAxle':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'gear':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'fulcrum':
      return { ...base, width: 40, height: 30 } as PhysicsShape;
    case 'projectilePath':
      return { ...base, width: 150, height: 100 } as PhysicsShape;
    case 'circularMotion':
      return { ...base, radius: 60 } as PhysicsShape;

    // Waves
    case 'longitudinalWave':
      return { ...base, width: 150, height: 40 } as PhysicsShape;
    case 'waveFront':
      return { ...base, width: 120, height: 80 } as PhysicsShape;
    case 'interference':
      return { ...base, width: 150, height: 80 } as PhysicsShape;
    case 'diffraction':
      return { ...base, width: 150, height: 80 } as PhysicsShape;

    // Thermodynamics
    case 'thermometer':
      return { ...base, width: 20, height: 100 } as PhysicsShape;
    case 'heatFlow':
      return { ...base, x2: x + 120, y2: y, width: 120, height: 40 } as PhysicsShape;
    case 'piston':
      return { ...base, width: 80, height: 60 } as PhysicsShape;
    case 'expansion':
      return { ...base, width: 120, height: 40 } as PhysicsShape;
    case 'compression':
      return { ...base, width: 120, height: 40 } as PhysicsShape;

    // Electricity
    case 'resistor':
      return { ...base, width: 80, height: 30 } as PhysicsShape;
    case 'capacitor':
      return { ...base, width: 40, height: 40 } as PhysicsShape;
    case 'inductor':
      return { ...base, width: 80, height: 30 } as PhysicsShape;
    case 'battery':
      return { ...base, width: 40, height: 60 } as PhysicsShape;
    case 'switchClosed':
      return { ...base, width: 60, height: 20 } as PhysicsShape;
    case 'switchOpen':
      return { ...base, width: 60, height: 20 } as PhysicsShape;
    case 'ammeter':
      return { ...base, radius: 20 } as PhysicsShape;
    case 'voltmeter':
      return { ...base, radius: 20 } as PhysicsShape;
    case 'lightBulb':
      return { ...base, radius: 25 } as PhysicsShape;

    // Optics
    case 'convexLens':
      return { ...base, width: 20, height: 80 } as PhysicsShape;
    case 'concaveLens':
      return { ...base, width: 20, height: 80 } as PhysicsShape;
    case 'convexMirror':
      return { ...base, width: 60, height: 10 } as PhysicsShape;
    case 'concaveMirror':
      return { ...base, width: 60, height: 10 } as PhysicsShape;
    case 'prism':
      return { ...base, width: 60, height: 70 } as PhysicsShape;
    case 'lightRay':
      return { ...base, x2: x + 120, y2: y } as PhysicsShape;

    // Fluid
    case 'fluidFlow':
      return { ...base, width: 150, height: 40 } as PhysicsShape;
    case 'pressureGauge':
      return { ...base, radius: 25 } as PhysicsShape;
    case 'venturiTube':
      return { ...base, width: 120, height: 60 } as PhysicsShape;
    case 'bernoulli':
      return { ...base, width: 150, height: 60 } as PhysicsShape;

    // Rotational
    case 'torque':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'angularVelocity':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'angularAcceleration':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'flywheel':
      return { ...base, radius: 40 } as PhysicsShape;
    case 'gyroscope':
      return { ...base, radius: 35, width: 70, height: 50 } as PhysicsShape;

    default:
      return base as MathShape;
  }
}

// ─── Shape Property Helpers ───────────────────────────────────────────────

export function getDefaultShapeProps(type: string): Partial<Shape> {
  return createShape(type, getShapeCategory(type), 200, 200);
}

export function isLineBasedShape(type: string): boolean {
  return [
    ...LINE_TYPES, ...ARROW_TYPES, ...FORCE_TYPES, ...MOTION_ARROW_TYPES,
    'lightRay', 'bezierCurve',
  ].includes(type);
}

export function hasWidthHeight(type: string): boolean {
  return [
    'rectangle', 'square', 'ellipse', 'triangle', 'rightTriangle',
    'equilateralTriangle', 'isoscelesTriangle', 'parallelogram', 'trapezoid',
    'rhombus', 'kite', 'chevron', 'cross', 'spring', 'damper', 'pendulum',
    'simplePendulum', 'lever', 'inclinedPlane', 'wedge', 'screw',
    'springMass', 'projectilePath', 'sineWave', 'cosineWave', 'parabola',
    'hyperbola', 'bezierCurve', 'cardioid', 'numberLine', 'functionPlot',
    'ruler', 'protractor', 'semicircle', 'quarterCircle', 'lemniscate',
    'piston', 'expansion', 'compression', 'heatFlow', 'transverseWave',
    'longitudinalWave', 'standingWave', 'waveFront', 'interference',
    'diffraction', 'resistor', 'inductor', 'capacitor', 'battery',
    'switchClosed', 'switchOpen', 'thermometer', 'convexLens',
    'concaveLens', 'prism', 'fluidFlow', 'venturiTube', 'bernoulli',
    'torsionalPendulum', 'gyroscope', 'spiral', 'battery',
    'convexMirror', 'concaveMirror',
  ].includes(type);
}

export function hasRadius(type: string): boolean {
  return [
    'circle', 'regularPolygon', 'pulley', 'point', 'angle', 'arc',
    'semicircle', 'spiral', 'cardioid', 'protractor', 'gridPoint',
    'circleSection', 'lemniscate', 'ammeter', 'voltmeter', 'lightBulb',
    'pressureGauge', 'wheelAxle', 'gear', 'torque', 'angularVelocity',
    'angularAcceleration', 'flywheel', 'circularMotion',
    'coordinatePoint',
  ].includes(type);
}

export function hasMagnitudeDirection(type: string): boolean {
  return [
    ...ARROW_TYPES, ...FORCE_TYPES, ...MOTION_ARROW_TYPES, 'lightRay',
  ].includes(type);
}

export function hasSides(type: string): boolean {
  return [
    'regularPolygon', ...Object.keys(REGULAR_POLYGON_TYPES),
    ...Object.keys(STAR_TYPES),
  ].includes(type);
}

export function getShapeDisplayName(type: string): string {
  const found = SHAPE_REGISTRY.find((s) => s.type === type);
  return found?.label || type;
}

// Subcategory lists for toolbar rendering
export const MATH_SUBCATEGORIES = [
  'Basic 2D',
  'Curves & Arcs',
  'Lines & Segments',
  'Vectors & Matrices',
  'Conic Sections',
  'Polygons',
  'Special Math',
];

export const PHYSICS_SUBCATEGORIES = [
  'Forces',
  'Motion',
  'Simple Machines',
  'Springs & Pendulums',
  'Waves',
  'Thermodynamics',
  'Electricity',
  'Optics',
  'Fluid Mechanics',
  'Rotational',
];

// Legacy compat
export const MATH_SHAPES = SHAPE_REGISTRY.filter((s) => s.category === 'math');
export const PHYSICS_SHAPES = SHAPE_REGISTRY.filter((s) => s.category === 'physics');

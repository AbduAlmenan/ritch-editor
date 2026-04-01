---
Task ID: 1
Agent: Super Z (main)
Task: Fix Runtime ChunkLoadError, geometry insertion, XYZ independence, table borders

Work Log:
- Diagnosed ChunkLoadError: caused by nested dynamic imports of KonvaCanvas in geometry-extension NodeView
- Fixed geometry-extension.tsx: Replaced manual dynamic import with next/dynamic + Suspense for KonvaCanvas preview
- Fixed table borders: Changed oklch() colors to hex (#9ca3af) with !important to override Tailwind reset in both .tiptap and .preview-content selectors
- Made XYZ coordinate insertion independent: handleInsertXYZ now directly calls editor.chain().focus().insertGeometryCanvas() without opening GeometryEditorDialog
- Fixed GeometryEditorDialog: Changed from nested dynamic import to direct import with Suspense boundary
- Fixed GeometryEditor: Restored dynamic import for KonvaCanvas with loading fallback
- Tested all features via browser agent:
  - ✅ Page loads without errors (0 console errors)
  - ✅ Table insertion works with visible borders
  - ✅ XYZ coordinate one-click insertion works (1 geometry canvas in DOM)
  - ✅ Math equation dialog opens with 189 symbols in 8 tabs
  - ✅ Math equation insertion works (quadratic formula)
  - ✅ Geometry Canvas dialog opens with 63 math shapes + physics shapes + coordinate settings
  - ✅ Geometry toolbar shows Math/Physics/Coord tabs with all shape categories
  - ✅ Coordinate system settings panel works (grid, axes, labels, Z-axis, colors)
  - ✅ No ChunkLoadError in console

Stage Summary:
- ChunkLoadError resolved by using next/dynamic properly in NodeView
- Geometry dialog now opens correctly with all 126+ shapes organized
- XYZ coordinate is now a one-click insert independent of geometry editor
- Table borders are visible using hex colors with !important
- All features verified working via browser automation testing

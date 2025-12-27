# Agent Documentation for Ekklesia Mapper

This document provides essential context for AI agents working on the Ekklesia Mapper project.

## Project Overview

**Ekklesia Mapper** is a Vue 3 single-page application for visualizing and managing hierarchical church structures. Users can create a tree of churches, track key metrics, and see real-time statistics.

## Key Architectural Decisions

### Data Storage
- **Location**: Browser's LocalStorage
- **Key**: `ekklesia-churches`
- **Format**: JSON string of church objects array
- **Note**: No backend - all client-side storage

### Church Hierarchy
- Root node is the "Mother Church" (id: 'root')
- Each church can have multiple child churches
- Tree structure: Each church has a `parentId` pointing to its parent
- Mother Church cannot be deleted

### Metrics System
Every church tracks 6 metrics:
1. **members**: Total count (base number)
2. **baptized**: Cannot exceed members
3. **calling**: Cannot exceed members
4. **community**: Cannot exceed members
5. **commission**: Cannot exceed members
6. **reaching**: Cannot exceed members

**Validation Rule**: All 5 secondary metrics must be ≤ members

### Statistics Calculation
- **Current Behavior**: ALL churches are counted (including Mother Church)
- Each church contributes its own metrics to the total
- Percentages are calculated relative to total members

## Important Constraints

1. **Mother Church** (id='root')
   - Cannot be deleted
   - Can be edited
   - Is counted in totals
   - Initially created with 50 members if no data exists

2. **Child Churches**
   - Must have a valid parentId
   - Can be deleted (with all sub-churches)
   - Contribute to totals

3. **Metrics Validation**
   - baptized ≤ members
   - calling ≤ members
   - community ≤ members
   - commission ≤ members
   - reaching ≤ members

## File Structure & Responsibilities

### `/src/stores/churches.js`
**Purpose**: Pinia store for church state management

**Key Functions**:
- `addChurch(parentId, data)` - Add new church with validation
- `updateChurch(id, data)` - Update existing church with validation
- `deleteChurch(id)` - Delete church and all descendants
- `getChildren(parentId)` - Get direct children of a church
- `getChurch(id)` - Get single church by id
- `totalStats` (computed) - Calculate totals across all churches

**Important**: All metric validations happen here before save

### `/src/components/TreeNode.vue`
**Purpose**: Recursive component rendering individual church cards

**Features**:
- Displays church name (centered, large)
- Shows 6 metrics in 3-column grid
- Action buttons: Child, Edit, Delete
- Renders children recursively with connector lines
- Handles connector line rendering

**Emits**: select, add-child, edit, delete

### `/src/components/ChurchForm.vue`
**Purpose**: Modal form for adding/editing churches

**Features**:
- Dynamic title (Add vs Edit mode)
- Real-time validation
- Error messages for invalid metrics
- Form resets on open

### `/src/components/StatsPanel.vue`
**Purpose**: Floating panel showing aggregated statistics

**Features**:
- Collapsible/expandable
- Shows totals and percentages
- Progress bars for visual representation
- Metrics grid display

### `/src/composables/usePanZoom.js`
**Purpose**: Pan and zoom functionality for canvas

**Returns**: scale, translateX, translateY, isDragging, event handlers

## Common Tasks

### Adding a New Metric
1. Update initial data in `churches.js` (default Mother Church)
2. Add metric display in `TreeNode.vue` metrics grid
3. Add metric field in `ChurchForm.vue`
4. Add validation in `churches.js` (addChurch/updateChurch)
5. Update totalStats calculation in `churches.js`
6. Add metric display in `StatsPanel.vue`

### Changing Connector Lines
Location: `/src/components/TreeNode.vue` lines ~142-180

Current approach:
- Vertical line from parent (h-12)
- Horizontal bar spanning container
- Individual vertical connectors to each child (h-12)

### Modifying Card Layout
Location: `/src/components/TreeNode.vue`

Card container: line ~5 (min-w-[480px])
Header: lines ~12-36
Metrics grid: line ~39 (grid-cols-3)
Buttons: line ~127-138

## State Management

**Store**: Pinia (`/src/stores/churches.js`)

**State**:
```javascript
churches: ref([])  // Array of all church objects
```

**Computed**:
```javascript
totalStats: computed(() => ({
  totals: { members, baptized, calling, community, commission, reaching },
  percentages: { baptized, calling, community, commission, reaching }
}))
```

## UI Patterns

### Color Scheme
- **Primary gradient**: blue-600 to purple-600
- **Members**: blue (#3b82f6)
- **Baptized**: green (#22c55e)
- **Calling**: purple (#a855f7)
- **Community**: yellow (#eab308)
- **Commission**: orange (#f97316)
- **Reaching**: pink (#ec4899)

### Typography
- Church name: text-4xl (48px)
- Metric labels: text-xs
- Metric values: text-lg
- Button text: text-sm or text-xs

### Spacing
- Gap between children: gap-12 (48px)
- Vertical connectors: h-12 (48px)
- Child padding: pt-12 (48px)
- Card padding: p-5

## Development Guidelines

### When Adding Features
1. Consider impact on localStorage format
2. Ensure backward compatibility
3. Update validation rules if needed
4. Test with empty state (no data)
5. Test with large hierarchies (10+ churches)

### When Modifying UI
1. Maintain responsive design
2. Preserve gradient aesthetic
3. Keep connector lines aligned
4. Test pan/zoom functionality
5. Ensure hover states work

### When Fixing Bugs
1. Check localStorage for corrupted data
2. Verify parent-child relationships
3. Test edge cases (single church, deep hierarchy)
4. Validate all metrics are ≤ members
5. Check computed properties are updating

## Debugging

### View Church Data
Run in browser console:
```javascript
JSON.parse(localStorage.getItem('ekklesia-churches'))
```

### Reset All Data
Run in browser console:
```javascript
localStorage.removeItem('ekklesia-churches');
location.reload();
```

### Check Tree Structure
```javascript
const churches = JSON.parse(localStorage.getItem('ekklesia-churches'));
function buildTree(parentId = null) {
  return churches.filter(c => c.parentId === parentId).map(c => ({
    ...c,
    children: buildTree(c.id)
  }));
}
console.log(buildTree());
```

## Testing Checklist

Before submitting changes:
- [ ] Add new church works
- [ ] Edit church works
- [ ] Delete church works
- [ ] Mother Church cannot be deleted
- [ ] Metrics validate correctly
- [ ] Stats panel updates
- [ ] Connector lines align
- [ ] Pan/zoom works
- [ ] Data persists after refresh
- [ ] Empty state works

## Internationalization

Current language: **English**

Previously used Dutch terms that were translated:
- "Moeder Kerk" → "Mother Church"
- "Leden" → "Members"
- "Gedoopt" → "Baptized"
- "Kind" → "Child"
- "Bewerken" → "Edit"
- "Verwijder" → "Delete"
- "Bereiken" → "Reaching"

## Performance Considerations

- LocalStorage has ~5MB limit
- With current model, ~10,000+ churches can be stored
- For very large trees, consider:
  - Virtual scrolling
  - Lazy loading of subtrees
  - Pagination

## Future Enhancements

Potential improvements:
1. Export/import functionality
2. Undo/redo support
3. Search/filter churches
4. Data visualization charts
5. Multiple tree views
6. Collaborative editing
7. Backend sync
8. Mobile app version
9. Print/export to PDF
10. Historical tracking

## Agent-Specific Notes

### For Code Generation Agents
- Use Vue 3 Composition API
- Follow existing code style
- Maintain Tailwind CSS patterns
- Preserve gradient aesthetics
- Keep components reusable

### For Refactoring Agents
- Maintain localStorage schema
- Preserve all existing functionality
- Test connector line alignment after changes
- Ensure backward compatibility with stored data

### For Debugging Agents
- Check both component rendering and store state
- Verify localStorage data integrity
- Look for orphaned churches (invalid parentId)
- Check for duplicate IDs
- Verify metric constraints

---

**Last Updated**: December 2025
**Framework Version**: Vue 3.5.13, Pinia 2.3.0

# Color Scheme Migration Plan

## Overview

This document outlines the migration from orange/amber color scheme to blue color scheme for the Homologation Wizard and Admin Panel, aligning with the main page's blue color palette.

## Current State

### Main Page Colors (Target)
- **Primary Blue**: `#2563eb` (blue-600)
- **Secondary Blue**: `#4f46e5` (indigo-600)
- **Light Blue**: `#3b82f6` (blue-500)
- **Dark Blue**: `#1d4ed8` (blue-700)

### Current Orange/Amber Usage
- **Amber-500**: `#f59e0b` - Primary actions, stepper active state
- **Amber-400**: `#fbbf24` - Icons, text accents
- **Amber-600**: `#d97706` - Hover states, buttons
- **Orange-600**: `#ea580c` - Gradient endpoints, shadows

## Migration Strategy

### Color Mapping

| Current Color | New Color | Usage |
|--------------|-----------|-------|
| `amber-500` | `blue-500` | Primary buttons, active stepper, icons |
| `amber-400` | `blue-400` | Icon colors, text accents |
| `amber-600` | `blue-600` | Button hover states, primary actions |
| `orange-600` | `indigo-600` | Gradient endpoints, shadows |
| `amber-500/10` | `blue-500/10` | Background overlays |
| `amber-500/20` | `blue-500/20` | Border colors, shadows |
| `amber-500/30` | `blue-500/30` | Shadow effects |
| `amber-500/50` | `blue-500/50` | Focus rings |

### Files to Update

#### Homologation Wizard
1. `/frontend/src/app/homologation/[id]/page.tsx`
   - Stepper component (active step circles, labels)
   - Navigation buttons
   - Save button
   - Icons (FiCreditCard, FiTruck, FiUser, FiCamera)
   - Warning/alert boxes
   - Loading spinners
   - Error page buttons

2. `/frontend/src/components/homologation/TrailerInfoForm.tsx`
   - Form icons
   - Focus rings on inputs
   - Lock badges

3. `/frontend/src/components/homologation/PhotoUpload.tsx`
   - Upload icon
   - Progress bar
   - Drag state colors

#### Admin Panel
1. `/frontend/src/app/admin/login/page.tsx`
   - Logo gradient (`from-amber-500 to-orange-600` → `from-blue-500 to-indigo-600`)
   - Button gradient
   - Focus rings
   - Background glow effects
   - Loading spinner

2. `/frontend/src/app/admin/page.tsx`
   - Header logo gradient
   - Action buttons
   - Loading spinners
   - Status badge for "Pending Review" (keep amber for now, or change to blue?)

3. `/frontend/src/app/admin/homologation/[id]/page.tsx`
   - Logo gradient
   - Icons
   - Action buttons
   - Loading spinners

4. `/frontend/src/app/admin/trailer-types/page.tsx`
   - Logo gradient
   - Form focus rings
   - Buttons
   - Icons
   - Loading spinners

### Status Badge Colors

**Decision**: Keep semantic colors for status badges:
- ✅ **Keep**: Red (rejected), Green (approved/completed), Purple (completed)
- ⚠️ **Change**: 
  - "Pending Review" from `amber` → `blue` (matches new primary)
  - "Draft" from `amber` → `blue` (or keep slate?)
  - "Incomplete" from `orange` → `yellow` or `amber` (warning color, keep?)

**Final Decision**: 
- "Pending Review": `amber` → `blue-500`
- "Draft": Keep `amber` or change to `blue-500`? (Currently amber, but could be blue)
- "Incomplete": Keep `orange` (it's a warning state, orange is appropriate)

## Implementation Steps

1. ✅ Create migration plan document
2. Update Homologation Wizard components
3. Update Admin Login page
4. Update Admin Panel pages
5. Update Admin detail pages
6. Update documentation

## Testing Checklist

- [ ] Homologation wizard stepper displays correctly
- [ ] All buttons have correct hover states
- [ ] Focus states are visible and accessible
- [ ] Loading spinners use blue colors
- [ ] Admin login page looks cohesive
- [ ] Admin panel header matches new scheme
- [ ] Status badges maintain semantic meaning
- [ ] No contrast issues (WCAG AA compliance)

## Notes

- Keep semantic colors (red for errors, green for success) unchanged
- Maintain accessibility contrast ratios
- Ensure gradients look smooth with blue tones
- Test in both light and dark modes if applicable


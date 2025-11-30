# Dimensions Input Enhancement Plan

## Overview

This document outlines the plan to enhance the trailer dimensions input in the `TrailerInfoForm` component. Instead of a single text input, we'll use three separate numeric inputs for Length, Width, and Height, matching the design shown in the reference image.

## Current State

- **Current Implementation**: Single text input field accepting free-form text
- **Format**: Users type something like "4m x 2m x 1.5m"
- **Issues**: 
  - No validation of numeric values
  - Users can make typos or format incorrectly
  - No clear separation between dimensions

## Proposed Changes

### Frontend Changes

1. **Replace single input with three numeric inputs**
   - Length (Largo) - numeric input
   - Width (Ancho) - numeric input  
   - Height (Alto) - numeric input
   - All inputs accept only numbers (integers or decimals)

2. **Internal State Management**
   - Store dimensions as separate values: `{ length: number | '', width: number | '', height: number | '' }`
   - Parse existing format when loading from backend: "4M x 2M x 1.5M" → `{ length: 4, width: 2, height: 1.5 }`
   - Format when sending to backend: `{ length: 4, width: 2, height: 1.5 }` → "4M x 2M x 1.5M"

3. **UI Design**
   - Match the reference image design:
     - Dark theme container with rounded corners
     - Three inputs arranged horizontally
     - Labels: "Largo", "Ancho", "Alto"
     - Icon: FiMaximize (expand/resize icon)
     - Subtle dividers between inputs

4. **Validation**
   - Only numeric values allowed (integers and decimals)
   - Optional fields (can be empty)
   - Format validation when sending to backend

### Backend Compatibility

✅ **No changes required**

- **Database**: `trailer_dimensions VARCHAR(100)` - accepts any string format
- **Backend API**: `trailerDimensions: z.string().optional()` - accepts any string
- **Format**: We'll send "4M x 2M x 1.5M" format (same as before, just generated from separate inputs)

### Data Flow

```
User Input (Frontend)
  ↓
Separate numeric inputs: length=4, width=2, height=1.5
  ↓
Format to string: "4M x 2M x 1.5M"
  ↓
Send to Backend API
  ↓
Store in DB as VARCHAR: "4M x 2M x 1.5M"
  ↓
Load from Backend
  ↓
Parse string: "4M x 2M x 1.5M" → { length: 4, width: 2, height: 1.5 }
  ↓
Display in separate inputs
```

## Implementation Details

### Component Structure

```typescript
interface DimensionValues {
  length: number | '';
  width: number | '';
  height: number | '';
}

// Parse existing format
function parseDimensions(dimensions: string): DimensionValues {
  // Handle formats like:
  // - "4M x 2M x 1.5M"
  // - "4m x 2m x 1.5m"
  // - "4 x 2 x 1.5"
  // - Empty string
}

// Format for backend
function formatDimensions(values: DimensionValues): string {
  // Convert { length: 4, width: 2, height: 1.5 } → "4M x 2M x 1.5M"
  // Handle empty values
}
```

### UI Layout

```
┌─────────────────────────────────────────────────────┐
│  🔲 Dimensiones *                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Largo   │  │  Ancho   │  │   Alto   │         │
│  │   4      │  │    2     │  │   1.5    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────────────────────────────────────┘
```

### Validation Rules

- **Input Type**: `number` with `step="0.1"` for decimals
- **Allowed Values**: Positive numbers (integers or decimals)
- **Required**: Optional (can be empty)
- **Format**: When all three are provided, format as "4M x 2M x 1.5M"
- **Partial Input**: If only some dimensions are provided, still format what's available

## Migration Considerations

### Existing Data

- Existing homologations with dimensions in format "4M x 2M x 1.5M" will be parsed automatically
- If parsing fails, fields will be empty (user can re-enter)
- Backward compatible: old format still works in DB

### Edge Cases

1. **Empty dimensions**: Show empty inputs, send empty string to backend
2. **Partial dimensions**: Format only provided values (e.g., "4M x 2M" if height missing)
3. **Invalid format in DB**: Parse gracefully, show empty if can't parse
4. **Very large numbers**: No limit (DB accepts up to 100 chars)

## Testing Checklist

- [ ] Enter numeric values in all three fields
- [ ] Enter decimal values (e.g., 1.5)
- [ ] Leave fields empty
- [ ] Enter partial dimensions (only length, only width+height, etc.)
- [ ] Load existing homologation with dimensions
- [ ] Load existing homologation without dimensions
- [ ] Load existing homologation with invalid format
- [ ] Save and verify format in backend
- [ ] Verify mobile responsiveness
- [ ] Verify error states

## Files to Modify

1. `frontend/src/components/homologation/TrailerInfoForm.tsx`
   - Update component to use three inputs
   - Add parse/format functions
   - Update state management

2. `docs/frontend/step1-form-plan.md`
   - Update documentation to reflect new input format

3. `docs/backend/database-schema.md`
   - Note the expected format in trailer_dimensions field

## Success Criteria

- ✅ Three separate numeric inputs for dimensions
- ✅ Only numeric values accepted (no text)
- ✅ Automatic parsing of existing "4M x 2M x 1.5M" format
- ✅ Automatic formatting to "4M x 2M x 1.5M" when saving
- ✅ UI matches reference image design
- ✅ Backward compatible with existing data
- ✅ Mobile responsive
- ✅ Proper error handling


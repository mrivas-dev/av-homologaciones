# Photo Examples Feature - Implementation Plan

## Overview

Add example photos section to the PhotoUpload component to guide users on what types of photos are acceptable for trailer homologation.

## Requirements

Based on the UI mockup, we need to display:
1. **Frontal** - Front view of trailer
2. **Lateral** - Side view of trailer showing axles
3. **Chasis** - Chassis/underneath view

## Implementation Plan

### Phase 1: Create Example Images

**Option A: Use placeholder images**
- Create simple placeholder images in `/public/examples/` folder
- Use SVG or PNG format
- Keep file sizes small (< 50KB each)

**Option B: Use CSS/Illustrations**
- Create simple illustrations using CSS or SVG
- No external files needed
- More maintainable

**Recommendation**: Option B - Use simple SVG illustrations or CSS-based placeholders

### Phase 2: Update PhotoUpload Component

1. **Add Example Section**
   - Display above the upload grid
   - Show 3 example thumbnails with labels
   - Use same styling as uploaded photos for consistency
   - Add subtitle: "Ejemplos de fotos aceptadas:"

2. **Layout**
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Fotos del Trailer                                          │
   │  Máximo 6 fotos • JPG, PNG, WebP, HEIC, PDF • Max 10MB     │
   │                                                              │
   │  Ejemplos de fotos aceptadas:                               │
   │  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
   │  │ Frontal │  │ Lateral │  │ Chasis  │                    │
   │  │ [img]   │  │ [img]   │  │ [img]   │                    │
   │  └─────────┘  └─────────┘  └─────────┘                    │
   │                                                              │
   │  [Upload Grid with existing photos and upload zone]         │
   └─────────────────────────────────────────────────────────────┘
   ```

3. **Styling**
   - Example thumbnails: Same aspect-square as uploaded photos
   - Labels below each example
   - Subtle border to distinguish from uploadable photos
   - Optional: Add info icon with tooltip explaining each view

### Phase 3: Component Structure

```typescript
<PhotoUpload>
  {/* Header */}
  <Title>Fotos del Trailer</Title>
  <Description>Máximo 6 fotos...</Description>
  
  {/* Example Photos Section */}
  <ExampleSection>
    <Subtitle>Ejemplos de fotos aceptadas:</Subtitle>
    <ExampleGrid>
      <ExamplePhoto label="Frontal" />
      <ExamplePhoto label="Lateral" />
      <ExamplePhoto label="Chasis" />
    </ExampleGrid>
  </ExampleSection>
  
  {/* Upload Grid */}
  <PhotoGrid>
    {/* Existing photos, uploading files, upload zone */}
  </PhotoGrid>
</PhotoUpload>
```

## Design Considerations

1. **Visual Hierarchy**: Examples should be clearly separated from upload area
2. **Responsive**: Examples should stack on mobile
3. **Accessibility**: Add alt text and ARIA labels
4. **Consistency**: Use same card styling as rest of form

## Files to Modify

- `frontend/src/components/homologation/PhotoUpload.tsx` - Add example section
- `frontend/public/examples/` (optional) - If using image files

## Success Criteria

- [x] Example photos section displays above upload grid
- [x] Three examples shown: Frontal, Lateral, Chasis
- [x] Examples are visually distinct from uploadable photos
- [x] Responsive design works on mobile
- [x] Styling matches overall design system
- [x] No impact on existing upload functionality

## Implementation Status: ✅ Completed

The example photos section has been implemented using SVG illustrations that match the design system. The examples are displayed in a 3-column grid above the upload area, showing:
- **Frontal**: Front view of a trailer with door and wheels
- **Lateral**: Side view showing roof, body, and axles
- **Chasis**: Underneath view showing chassis frame and suspension

The implementation uses inline SVG for maintainability and consistency with the dark theme.


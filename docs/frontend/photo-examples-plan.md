# Photo Examples Feature - Implementation Plan

## Overview

Add example photos section to the PhotoUpload component to guide users on what types of photos are acceptable for trailer homologation.

## Requirements

The reference photos displayed depend on the selected trailer type:

### Trailer Type: "Trailer"
1. **Frontal** - Front view of trailer
2. **Lateral** - Side view of trailer
3. **Trasera** - Rear view of trailer
4. **Ficha eléctrica** - Electrical certificate/plate

### Trailer Type: "Rolling Box"
1. **Frontal** - Front view of rolling box
2. **Lateral** - Side view of rolling box
3. **Trasera** - Rear view of rolling box
4. **Rueda de auxilio** - Spare wheel/tire
5. **Ficha eléctrica** - Electrical certificate/plate

### Trailer Type: "Motorhome" (or no type selected)
1. **Frontal** - Front view of trailer
2. **Lateral** - Side view of trailer showing axles
3. **Chasis** - Chassis/underneath view

## Implementation Plan

### Phase 1: Create Example Images

**Implementation**: Reference photos are stored in `/public/reference_photos/` folder:

- `/reference_photos/trailer/` - Contains photos for Trailer type:
  - `frontal.jpeg`
  - `lateral.jpeg`
  - `trasera.jpeg`
- `/reference_photos/rollingbox/` - Contains photos for Rolling Box type:
  - `frontal.jpeg`
  - `lateral.jpeg`
  - `trasera.jpeg`
  - `rueda_auxilio.jpeg`
- `/reference_photos/ficha_electrica.jpeg` - Shared electrical certificate example
- Original example photos (for Motorhome/fallback):
  - `/ejemplo_trailer_frontal.jpg`
  - `/ejemplo_trailer_lateral.jpg`
  - `/ejemplo_trailer_chasis.jpg`

### Phase 2: Update PhotoUpload Component

1. **Add Example Section**
   - Display above the upload grid
   - Show 3 example thumbnails with labels
   - Use same styling as uploaded photos for consistency
   - Add subtitle: "Ejemplos de fotos aceptadas:"

2. **Layout**
   - Responsive grid that adapts to number of photos (2-5 columns)
   - Photos are smaller and more compact to fit all on the page
   - Grid layout: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5`
   - Reduced spacing: `gap-2` between photos
   
   Example for "Trailer" type:
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Fotos del Trailer                                          │
   │  Máximo 6 fotos • JPG, PNG, WebP, HEIC, PDF • Max 10MB     │
   │                                                              │
   │  Ejemplos de fotos aceptadas:                               │
   │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────┐        │
   │  │Frontal │ │Lateral │ │Trasera │ │Ficha eléctrica│        │
   │  │ [img]  │ │ [img]  │ │ [img]  │ │   [img]      │        │
   │  └────────┘ └────────┘ └────────┘ └──────────────┘        │
   │                                                              │
   │  [Upload Grid with existing photos and upload zone]         │
   └─────────────────────────────────────────────────────────────┘
   ```
   
   Example for "Rolling Box" type (5 photos):
   ```
   ┌─────────────────────────────────────────────────────────────┐
   │  Ejemplos de fotos aceptadas:                               │
   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐    │
   │  │Front.│ │Later.│ │Tras. │ │Rueda aux.│ │Ficha el. │    │
   │  └──────┘ └──────┘ └──────┘ └──────────┘ └──────────┘    │
   └─────────────────────────────────────────────────────────────┘
   ```

3. **Styling**
   - Example thumbnails: Same aspect-square as uploaded photos
   - Labels below each example
   - Subtle border to distinguish from uploadable photos
   - Compact design: Photos are smaller to fit all reference photos on the page
   - Reduced margins: `mb-1` instead of `mb-2` for tighter spacing

### Phase 3: Component Structure

```typescript
<PhotoUpload trailerType={homologation.trailerType}>
  {/* Header */}
  <Title>Fotos del Trailer</Title>
  <Description>Máximo 6 fotos...</Description>
  
  {/* Example Photos Section - Conditional based on trailerType */}
  <ExampleSection>
    <Subtitle>Ejemplos de fotos aceptadas:</Subtitle>
    <ExampleGrid responsive="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {trailerType === 'Trailer' && (
        <>
          <ExamplePhoto src="/reference_photos/trailer/frontal.jpeg" label="Frontal" />
          <ExamplePhoto src="/reference_photos/trailer/lateral.jpeg" label="Lateral" />
          <ExamplePhoto src="/reference_photos/trailer/trasera.jpeg" label="Trasera" />
          <ExamplePhoto src="/reference_photos/ficha_electrica.jpeg" label="Ficha eléctrica" />
        </>
      )}
      {trailerType === 'Rolling Box' && (
        <>
          <ExamplePhoto src="/reference_photos/rollingbox/frontal.jpeg" label="Frontal" />
          <ExamplePhoto src="/reference_photos/rollingbox/lateral.jpeg" label="Lateral" />
          <ExamplePhoto src="/reference_photos/rollingbox/trasera.jpeg" label="Trasera" />
          <ExamplePhoto src="/reference_photos/rollingbox/rueda_auxilio.jpeg" label="Rueda de auxilio" />
          <ExamplePhoto src="/reference_photos/ficha_electrica.jpeg" label="Ficha eléctrica" />
        </>
      )}
      {(trailerType === 'Motorhome' || !trailerType) && (
        <>
          <ExamplePhoto src="/ejemplo_trailer_frontal.jpg" label="Frontal" />
          <ExamplePhoto src="/ejemplo_trailer_lateral.jpg" label="Lateral" />
          <ExamplePhoto src="/ejemplo_trailer_chasis.jpg" label="Chasis" />
        </>
      )}
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
- [x] Reference photos change based on selected trailer type
- [x] Trailer type: Shows 4 photos (Frontal, Lateral, Trasera, Ficha eléctrica)
- [x] Rolling Box type: Shows 5 photos (Frontal, Lateral, Trasera, Rueda de auxilio, Ficha eléctrica)
- [x] Motorhome/no type: Shows 3 photos (Frontal, Lateral, Chasis)
- [x] Examples are visually distinct from uploadable photos
- [x] Responsive design works on mobile (2-5 columns based on screen size)
- [x] Photos are compact and fit all on the page
- [x] Styling matches overall design system
- [x] No impact on existing upload functionality

## Implementation Status: ✅ Completed

The reference photos section has been implemented with trailer-type-based conditional rendering:

- **Trailer Type Detection**: Component receives `trailerType` prop from the current form state (not just saved data)
- **Real-time Updates**: Reference photos update immediately when the trailer type selector changes, without requiring a save
- **Conditional Rendering**: Different sets of reference photos based on trailer type
- **Image Assets**: Reference photos stored in `/public/reference_photos/` directory
- **Responsive Grid**: Uses responsive grid layout (2-5 columns) to accommodate different numbers of photos
- **Compact Design**: Smaller photos with reduced spacing to fit all examples on the page

The implementation ensures users see relevant reference photos for their specific trailer type immediately upon selection, providing instant visual guidance without needing to save the form first.


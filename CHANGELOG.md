# Changelog

## 1.1.0 (2025-12-04)

### Features
- ✅ **Direct drag-to-zoom functionality**:
  - **Drag** on the graph to instantly zoom into the selected time range
  - Visual selection overlay with blue highlight during drag
  - Minimum 20px drag to prevent accidental zooms
  - Press **R** to reset zoom to original time range
  - Press **+** or **=** to zoom in by 50% (centered)
  - Press **-** or **_** to zoom out by 50% (centered)
  - **Double-click** to zoom in by 50% at center
  - **Shift + Double-click** to zoom out by 50%
- ✅ Visual selection overlay with semi-transparent blue highlight
- ✅ "Zoom Help" button showing all keyboard shortcuts
- ✅ Crosshair cursor when hovering over graph

### Changes
- Implemented custom mouse event handling for precise time range selection
- Added pixel-to-timestamp conversion for accurate zoom calculations
- Automatic zoom on mouse release - no keyboard required for drag zoom
- Updated documentation with simplified zoom workflow

## 1.0.0 (2025-12-04)

### Features
- ✅ Export to CSV, HTML, and Image (all open in new tabs)
- ✅ Enlarge view in new browser tab with preserved time range
- ✅ Table view toggle to display data in tabular format
- ✅ Dynamic base path detection for nginx reverse proxy compatibility
- ✅ Color-coded series with distinct color palette
- ✅ Configurable legend (display mode and placement)
- ✅ Configurable tooltips (single/multi series)
- ✅ Time range synchronization from dashboard picker
- ✅ All standard Time Series field configurations

### Technical Details
- Plugin ID: `asimzulfiqar-extratimeseries-panel`
- Based on Grafana Time Series panel
- Uses @grafana/ui TimeSeries component
- Grafana version: 12.3.0+

### Architecture
- SimplePanel component with action bar for export/enlarge/table controls
- TableView component for data table visualization
- Export utilities for CSV/HTML/Image generation
- Color palette applied to avoid theme-based color issues


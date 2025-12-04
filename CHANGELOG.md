# Changelog

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

### Known Limitations
- Drag-to-zoom not available (requires internal Grafana APIs not exported in @grafana/ui)
- Use Grafana's time range picker for zooming instead

### Architecture
- SimplePanel component with action bar for export/enlarge/table controls
- TableView component for data table visualization
- Export utilities for CSV/HTML/Image generation
- Color palette applied to avoid theme-based color issues


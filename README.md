# Extra Time Series Panel for Grafana

A custom Grafana panel plugin that extends the native Time Series panel with additional export and viewing features.

## Features

### ✅ Export Capabilities
- **CSV Export** - Export time series data to CSV format (opens in new tab)
- **HTML Export** - Export data as formatted HTML table (opens in new tab)
- **Image Export** - Capture panel as PNG image using html2canvas (opens in new tab)

### ✅ Enhanced Viewing
- **Enlarge View** - Open panel in new browser tab with full dashboard context
  - Preserves current time range
  - Works with nginx reverse proxy (dynamic base path detection)
  - Maintains timezone settings
- **Table View** - Toggle between graph and table visualization
  - Shows all series in columns
  - Includes timestamps

### ✅ Native Time Series Features
- **Color-coded series** - Each series gets distinct colors from palette
- **Legend** - Always visible with configurable display mode and placement
- **Time range sync** - Updates from dashboard time picker
- **Tooltips** - Configurable hover mode (single/multi)
- **All standard time series options** - Line style, fill opacity, point visibility, etc.

### ✅ Drag-to-Zoom with Keyboard Shortcuts
- **Drag on graph** - Instantly zoom into the selected time range (minimum 20px drag)
- **R key** - Reset zoom to original time range  
- **+ or = key** - Zoom in by 50% (centered)
- **- or _ key** - Zoom out by 50% (centered)
- **Double-click** - Zoom in by 50% at center
- **Shift + Double-click** - Zoom out by 50%
- **Zoom Help button** - Shows all available shortcuts

> **How it works**: Simply click and drag horizontally across the graph. When you release the mouse, it automatically zooms into that time range. No need to press any keys!

## Configuration

### Panel Options
- **Show Export Button** - Enable/disable export menu
- **Show Enlarge Button** - Enable/disable enlarge functionality  
- **Show Table View Button** - Enable/disable table view toggle

### Legend Options
- **Display Mode** - List, table, or hidden
- **Placement** - Bottom, right, or top

### Tooltip Options
- **Mode** - Single series, all series, or none

## Known Limitations

**Advanced drag-to-zoom functionality is not available** in this plugin because:

- `XAxisInteractionAreaPlugin` (drag-to-pan on x-axis) is not exported from the published `@grafana/ui` package
- It's only available in Grafana's internal source code
- The GitHub issue #71976 was about a bug **within Grafana core**, not external plugins
- External plugins cannot access internal Grafana components

**Workarounds Available**:
- Use the **keyboard shortcuts** listed above (R, +, -, double-click)
- Use Grafana's time range picker in the dashboard header

## Installation

1. Copy the plugin to your Grafana plugins directory:
   ```bash
   cp -r dist/ /var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel
   ```

2. Restart Grafana:
   ```bash
   systemctl restart grafana-server
   ```

3. Enable the plugin in Grafana configuration if needed (for unsigned plugins):
   ```ini
   [plugins]
   allow_loading_unsigned_plugins = asimzulfiqar-extratimeseries-panel
   ```

## Development

### Build (Production)

```bash
cd ../extratimeseries-panel
npm run build
```

The distributable plugin will be in `dist/`.

### Development Mode

```bash
npm run dev
```

Webpack will watch for changes. Refresh your Grafana browser tab to see updates.

### Using WSL for Build (Windows)

If you encounter build issues on Windows, use WSL:

```bash
wsl
cd ../extratimeseries-panel
npm install
npm run build
```

## Technical Details

- **Plugin ID**: `asimzulfiqar-extratimeseries-panel`
- **Author**: Asim Zulfiqar
- **License**: Apache-2.0
- **Grafana Version**: 12.3.0+

### Color Palette

The plugin uses a fixed color palette to ensure consistent series colors:
```javascript
['#7EB26D', '#EAB839', '#6ED0E0', '#EF843C', '#E24D42', 
 '#1F78C1', '#BA43A9', '#705DA0', '#508642', '#CCA300']
```

## Support

For issues or questions, refer to the Grafana plugin development documentation.
- `dist/plugin.json`
- Assets under `dist/`

## Install in Grafana (unsigned)

Option A — Local filesystem install:
- Copy the `dist/` folder to Grafana’s plugins directory as a folder named after the plugin id:
  - Linux: `/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel`
  - Windows: `C:\\Program Files\\GrafanaLabs\\grafana\\data\\plugins\\asimzulfiqar-extratimeseries-panel`

- In `grafana.ini`, allow unsigned plugin:
  ```ini
  [plugins]
  allow_loading_unsigned_plugins = asimzulfiqar-extratimeseries-panel
  ```

- Restart Grafana and navigate to Administration → Plugins to verify it appears.

Option B — Docker:
- Mount the plugin folder into Grafana container:
  ```bash
  docker run -d -p 3000:3000 \
    -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=asimzulfiqar-extratimeseries-panel \
    -v $(pwd)/dist:/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel \
    --name grafana grafana/grafana:latest
  ```
  PowerShell variant:
  ```powershell
  docker run -d -p 3000:3000 \
    -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=asimzulfiqar-extratimeseries-panel \
    -v ${PWD}/dist:/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel \
    --name grafana grafana/grafana:latest
  ```

## Using the Panel

- Add a new panel, select "Extra Time series" from the visualization list
- Use the action bar to:
  - Export → CSV / HTML / Image
  - Enlarge → Open modal view
  - Table View → Toggle table/graph
- To change series colors, use Overrides in the panel editor: Overrides → Add override → Fields with name → Color

## License

Apache-2.0

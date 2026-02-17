# Extra Time Series Panel for Grafana

A Grafana panel plugin that extends the native Time Series panel with export capabilities, enhanced viewing options, and interactive zoom features.

## Features

- **Export Options**: Export your time series data as CSV, HTML table, or PNG image
- **Enlarge View**: Open panel in full browser tab with preserved time range and settings
- **Table View**: Toggle between graph and tabular data visualization
- **Interactive Zoom**: Drag-to-zoom on graph with keyboard shortcuts (R to reset, +/- to zoom)
- **Full Time Series Support**: All native Grafana time series features including legends, tooltips, and styling options

## Installation

### Option 1: Download and Install

1. **Download** the plugin:
   - Download the latest release from the [releases page](https://github.com/yourusername/extra-time-series-grafana-plugin/releases)
   - Or clone this repository: `git clone https://github.com/yourusername/extra-time-series-grafana-plugin.git`

2. **Build** the plugin (if you cloned the repository):
   ```bash
   cd extra-time-series-grafana-plugin
   npm install
   npm run build
   ```

3. **Copy** the `dist/` folder to your Grafana plugins directory:
   
   **Linux:**
   ```bash
   sudo cp -r dist/ /var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel
   ```
   
   **Windows:**
   ```powershell
   Copy-Item -Path dist -Destination "C:\Program Files\GrafanaLabs\grafana\data\plugins\asimzulfiqar-extratimeseries-panel" -Recurse
   ```
   
   **macOS:**
   ```bash
   sudo cp -r dist/ /usr/local/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel
   ```

4. **Configure** Grafana to allow unsigned plugins:
   
   Edit your `grafana.ini` file and add:
   ```ini
   [plugins]
   allow_loading_unsigned_plugins = asimzulfiqar-extratimeseries-panel
   ```
   
   **Location of grafana.ini:**
   - Linux: `/etc/grafana/grafana.ini`
   - Windows: `C:\Program Files\GrafanaLabs\grafana\conf\grafana.ini`
   - macOS: `/usr/local/etc/grafana/grafana.ini`
   - Docker: Use environment variable `-e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=asimzulfiqar-extratimeseries-panel`

5. **Restart** Grafana:
   
   **Linux:**
   ```bash
   sudo systemctl restart grafana-server
   ```
   
   **Windows:**
   ```powershell
   Restart-Service Grafana
   ```
   
   **macOS:**
   ```bash
   brew services restart grafana
   ```
   
   **Docker:**
   ```bash
   docker restart grafana
   ```

6. **Verify** installation:
   - Open Grafana in your browser
   - Navigate to **Administration → Plugins**
   - Search for "Extra Time Series"
   - The plugin should appear in the list

### Option 2: Docker Installation

If you're running Grafana in Docker:

```bash
docker run -d \
  -p 3000:3000 \
  -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=asimzulfiqar-extratimeseries-panel \
  -v /path/to/dist:/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel \
  --name=grafana \
  grafana/grafana
```

**Windows PowerShell:**
```powershell
docker run -d `
  -p 3000:3000 `
  -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=asimzulfiqar-extratimeseries-panel `
  -v ${PWD}/dist:/var/lib/grafana/plugins/asimzulfiqar-extratimeseries-panel `
  --name=grafana `
  grafana/grafana
```

## Using the Plugin

1. **Add a Panel**:
   - Create or edit a dashboard
   - Click "Add" → "Visualization"
   - Select a data source with time series data
   - Choose **"Extra Time series"** from the visualization list

2. **Configure the Panel**:
   - Add your queries to fetch time series data
   - Use the panel options (right sidebar) to enable/disable features
   - Customize the appearance using standard time series options

3. **Use the Features**:
   - **Export**: Click the export button in panel header → Choose CSV, HTML, or PNG
   - **Zoom**: Drag horizontally on the graph to zoom into a time range
   - **Keyboard Shortcuts**:
     - `R` - Reset zoom to original time range
     - `+` or `=` - Zoom in by 50%
     - `-` or `_` - Zoom out by 50%
     - Double-click - Zoom in at cursor position
     - Shift + Double-click - Zoom out
   - **Table View**: Click the table icon to toggle between graph and table
   - **Enlarge**: Click the enlarge icon to open panel in full browser tab

## Configuration

### Panel Options
- **Show Export Button** - Enable/disable export menu (CSV, HTML, PNG)
- **Show Enlarge Button** - Enable/disable enlarged view in new tab
- **Show Table View Button** - Enable/disable table visualization toggle

### Display Options
- **Legend**: Configure display mode (list, table, hidden) and placement
- **Tooltips**: Choose hover mode (single series, all series, none)
- **Standard Time Series Options**: Line style, fill opacity, point visibility, axis settings, thresholds, etc.

## Development

### Prerequisites
- Node.js >= 22
- npm >= 10

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/extra-time-series-grafana-plugin.git
cd extra-time-series-grafana-plugin

# Install dependencies
npm install

# Start development mode (watches for changes)
npm run dev
```

### Build for Production

```bash
npm run build
```

This creates a production-ready plugin in the `dist/` directory.

### Run Tests

```bash
# Run unit tests
npm run test:ci

# Run end-to-end tests
npm run e2e
```

### Project Structure

```
Extra-time-series-grafana-plugin/
├── src/
│   ├── components/
│   │   ├── SimplePanel.tsx       # Main panel component
│   │   └── TableView.tsx         # Table view component
│   ├── utils/
│   │   └── exportUtils.ts        # Export functionality
│   ├── module.ts                 # Plugin entry point
│   ├── plugin.json               # Plugin metadata
│   └── types.ts                  # TypeScript types
├── dist/                         # Built plugin (after npm run build)
├── package.json
└── README.md
```

## Troubleshooting

### Plugin Not Appearing in Grafana

1. **Check plugins directory**: Make sure the plugin folder is named exactly `asimzulfiqar-extratimeseries-panel`
2. **Check unsigned plugin config**: Verify `allow_loading_unsigned_plugins` is set in grafana.ini
3. **Check Grafana logs**:
   - Linux: `sudo tail -f /var/log/grafana/grafana.log`
   - Windows: Check Windows Event Viewer or `C:\Program Files\GrafanaLabs\grafana\data\log\grafana.log`
4. **Restart Grafana**: Make sure you restarted Grafana after copying the plugin

### Build Errors

```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### Development Mode Not Working

Make sure Grafana is running and refresh your browser after making changes. The plugin uses webpack in watch mode, so changes should be picked up automatically.

## License

Apache-2.0 License - see [LICENSE](LICENSE)

# Extra Time series panel (org1-extratimeseries-panel)

Extra Time series is a custom Grafana panel that extends the Time series visualization with:
- Export (CSV, HTML, Image)
- Enlarge modal view
- Table view toggle

This plugin is currently unsigned for easy development and internal distribution.

## Install and Run (development)

Use WSL (Debian) as you already do:

```bash
cd /mnt/f/LRZ/Grafana/custom-panel/org1-bmcustom-panel
npm install
npm run dev
```

By default, this builds to `dist/` and the webpack dev server watches for changes. Refresh your Grafana browser tab to see updates.

## Build (production)

```bash
cd /mnt/f/LRZ/Grafana/custom-panel/org1-bmcustom-panel
npm run build
```

The distributable plugin lives in `dist/`:
- `dist/module.js`
- `dist/plugin.json`
- Assets under `dist/`

## Install in Grafana (unsigned)

Option A — Local filesystem install:
- Copy the `dist/` folder to Grafana’s plugins directory as a folder named after the plugin id:
  - Linux: `/var/lib/grafana/plugins/org1-extratimeseries-panel`
  - Windows: `C:\\Program Files\\GrafanaLabs\\grafana\\data\\plugins\\org1-extratimeseries-panel`

- In `grafana.ini`, allow unsigned plugin:
  ```ini
  [plugins]
  allow_loading_unsigned_plugins = org1-extratimeseries-panel
  ```

- Restart Grafana and navigate to Administration → Plugins to verify it appears.

Option B — Docker:
- Mount the plugin folder into Grafana container:
  ```bash
  docker run -d -p 3000:3000 \\
    -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=org1-extratimeseries-panel \\
    -v $(pwd)/dist:/var/lib/grafana/plugins/org1-extratimeseries-panel \\
    --name grafana grafana/grafana:latest
  ```
  PowerShell variant:
  ```powershell
  docker run -d -p 3000:3000 \
    -e GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=org1-extratimeseries-panel \
    -v ${PWD}/dist:/var/lib/grafana/plugins/org1-extratimeseries-panel \
    --name grafana grafana/grafana:latest
  ```

## Using the Panel

- Add a new panel, select "Extra Time series" from the visualization list
- Use the action bar to:
  - Export → CSV / HTML / Image
  - Enlarge → Open modal view
  - Table View → Toggle table/graph
- To change series colors, use Overrides in the panel editor: Overrides → Add override → Fields with name → Color

## Changing the Plugin Name/ID

- Display name: edit `src/plugin.json` → `name`
- Plugin ID: edit `src/plugin.json` → `id` (lowercase, unique). If you change the id, update `grafana.ini` and be aware existing dashboards referencing the old id won’t load this panel until updated.

## Push to GitHub

Initialize and push this project to your GitHub repository:

```bash
# From /mnt/f/LRZ/Grafana/custom-panel/org1-bmcustom-panel
git init
git add .
git commit -m "feat: initial Extra Time series panel"
# Replace with your repo URL
git remote add origin https://github.com/<your-username>/org1-extratimeseries-panel.git
git branch -M main
git push -u origin main
```

## Signing (optional, later)

This plugin is currently unsigned for internal use. When you’re ready to distribute broadly, follow Grafana’s signing guide and switch to a signed release.

- Docs: https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin

## License

Apache-2.0

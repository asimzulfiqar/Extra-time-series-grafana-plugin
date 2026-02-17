# Publishing Extra Time Series Plugin to Grafana

## Complete Step-by-Step Guide

This guide will help you publish your plugin to the official Grafana plugin catalog.

---

## Before You Start

### Required Accounts & Access
- [ ] GitHub account with public repository
- [ ] Grafana Cloud account (free tier is fine)
- [ ] Grafana.com account for plugin submission

### Plugin Requirements
- [ ] Plugin ID follows naming convention: `{org}-{name}-{type}`
  - ✅ Current: `asimzulfiqar-extratimeseries-panel`
- [ ] Plugin builds without errors: `npm run build`
- [ ] All tests pass: `npm run test:ci`
- [ ] Plugin works in local Grafana instance

---

## Step 1: Prepare Plugin Metadata

### Update src/plugin.json
✅ Already updated with:
- Description
- Keywords for search discoverability
- GitHub links
- Author information

### Add Screenshots (Recommended)
1. Take screenshots of your plugin in action
2. Save them to `src/img/` directory (e.g., `screenshot-1.png`, `screenshot-2.png`)
3. Update `src/plugin.json`:
```json
"screenshots": [
  {
    "name": "Export Options",
    "path": "img/screenshot-1.png"
  },
  {
    "name": "Interactive Zoom",
    "path": "img/screenshot-2.png"
  }
]
```

---

## Step 2: Get a Grafana Access Policy Token

This token is required to sign your plugin.

1. Go to https://grafana.com/
2. Sign in to your account
3. Navigate to **Profile** → **Settings** → **Access Policies**
4. Click **Create Access Policy**
5. Configure the policy:
   - **Name**: `Plugin Signing`
   - **Realms**: Select your organization
   - **Scopes**: Check `plugins:write`
6. Click **Create**
7. Click **Add token** to generate a token
8. **Copy the token** - you won't see it again!

### Set the Token

**Linux/macOS:**
```bash
export GRAFANA_ACCESS_POLICY_TOKEN=your-token-here
```

**Windows PowerShell:**
```powershell
$env:GRAFANA_ACCESS_POLICY_TOKEN="your-token-here"
```

---

## Step 3: Build and Sign Your Plugin

### Build Production Version
```bash
npm run build
```

This creates a `dist/` folder with your compiled plugin.

### Sign the Plugin
```bash
npm run sign
```

This command:
- Validates your plugin structure
- Creates a `MANIFEST.txt` file in `dist/`
- The manifest contains checksums of all files

**Important:** The `MANIFEST.txt` file is required for plugin submission.

---

## Step 4: Create a GitHub Release

### Prepare the Release Package

**Option A: Zip the dist folder**
```bash
# Linux/macOS
cd dist
zip -r ../asimzulfiqar-extratimeseries-panel-1.1.0.zip .
cd ..

# Windows PowerShell
Compress-Archive -Path dist\* -DestinationPath asimzulfiqar-extratimeseries-panel-1.1.0.zip
```

**Option B: Use provided script (if available)**
```bash
npm run package
```

### Tag Your Release
```bash
git add .
git commit -m "Release v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main
git push origin v1.1.0
```

### Create GitHub Release
1. Go to your GitHub repository
2. Click **Releases** → **Create a new release**
3. Fill in:
   - **Tag**: v1.1.0 (select the tag you just pushed)
   - **Title**: Extra Time Series Panel v1.1.0
   - **Description**: Add release notes (features, fixes, breaking changes)
4. **Attach the zip file** you created
5. Click **Publish release**

### Get the Release URLs
After publishing, you'll need:
- **Plugin ZIP URL**: Right-click the zip file → Copy link
  - Example: `https://github.com/asimzulfiqar/extra-time-series-grafana-plugin/releases/download/v1.1.0/asimzulfiqar-extratimeseries-panel-1.1.0.zip`
- **Source Code URL**: The tag URL
  - Example: `https://github.com/asimzulfiqar/extra-time-series-grafana-plugin/tree/v1.1.0`

### Generate Checksum
```bash
# Linux/macOS
md5sum asimzulfiqar-extratimeseries-panel-1.1.0.zip
sha1sum asimzulfiqar-extratimeseries-panel-1.1.0.zip

# Windows PowerShell
Get-FileHash -Algorithm MD5 asimzulfiqar-extratimeseries-panel-1.1.0.zip
Get-FileHash -Algorithm SHA1 asimzulfiqar-extratimeseries-panel-1.1.0.zip
```

---

## Step 5: Submit to Grafana

### Go to Plugin Submission Page
Visit: https://grafana.com/developers/publish-a-plugin

### Fill Out the Submission Form

**Plugin URL (zip file)**
```
https://github.com/asimzulfiqar/extra-time-series-grafana-plugin/releases/download/v1.1.0/asimzulfiqar-extratimeseries-panel-1.1.0.zip
```

**MD5 or SHA1 (URL also accepted)**
```
[paste the checksum you generated]
```

**Source code URL**
```
https://github.com/asimzulfiqar/extra-time-series-grafana-plugin/tree/v1.1.0
```

**Testing guidance**
```
1. Install the plugin in Grafana
2. Create a new dashboard with a time series data source
3. Add a panel and select "Extra Time Series" visualization
4. Test export functionality:
   - Click Export button → Select CSV (data should open in new tab)
   - Click Export button → Select HTML (table should open in new tab)
   - Click Export button → Select PNG (image should open in new tab)
5. Test zoom functionality:
   - Drag horizontally on the graph to zoom
   - Press R to reset zoom
   - Press +/- to zoom in/out
6. Test table view toggle
7. Test enlarge view (opens panel in full browser tab)

The plugin works with any Grafana time series data source (Prometheus, InfluxDB, etc.)
No special configuration or credentials required.
```

**Provisioning provided for test environment**
- Select: **No** (unless you want to provide a docker-compose or provisioning files)

**Are you affiliated with the project/product the plugin integrates with?**
- Select: **No**

**Does the plugin integrate with a commercial product?**
- Select: **No**

### Submit
Click **Submit** and wait for confirmation email.

---

## Step 6: Wait for Review

### What Happens Next?
Grafana's team will:
1. **Verify the signature** - Checks MANIFEST.txt is valid
2. **Security scan** - Automated checks for vulnerabilities
3. **Functionality test** - Manual testing of your plugin
4. **Code review** - Check for best practices and quality

### Timeline
- **Initial review**: 1-2 weeks
- **Follow-up questions**: Via email or GitHub issues
- **Approval**: Plugin appears in catalog within 24 hours

### Common Reasons for Rejection
- Missing or invalid MANIFEST.txt (not signed)
- Security vulnerabilities in dependencies
- Broken functionality
- Poor code quality
- Missing documentation

---

## Step 7: After Approval

### Your Plugin Will Be Listed
- Appears at: `https://grafana.com/grafana/plugins/asimzulfiqar-extratimeseries-panel`
- Users can install with: `grafana-cli plugins install asimzulfiqar-extratimeseries-panel`
- Available in Grafana UI plugin catalog

### Updating Your Plugin
For future versions:
1. Update version in `package.json`
2. Build and sign: `npm run build && npm run sign`
3. Create new GitHub release
4. Submit update through same form

---

## Troubleshooting

### "Plugin signature invalid"
- Make sure you ran `npm run sign` after building
- Verify MANIFEST.txt exists in dist/
- Check that GRAFANA_ACCESS_POLICY_TOKEN is set correctly

### "Missing metadata"
- Verify src/plugin.json has description, keywords, and links
- Add screenshots for better presentation

### "Build failed"
```bash
# Clean and rebuild
rm -rf dist/ node_modules/
npm install
npm run build
```

### "Tests failed"
```bash
npm run test:ci
# Fix any failing tests before submission
```

---

## Helpful Resources

- **Official Publishing Guide**: https://grafana.com/developers/plugin-tools/publish-a-plugin/publish-a-plugin
- **Plugin Signing**: https://grafana.com/developers/plugin-tools/publish-a-plugin/sign-a-plugin
- **Metadata Reference**: https://grafana.com/developers/plugin-tools/reference/metadata
- **Plugin Examples**: https://github.com/grafana/grafana-plugin-examples
- **Community Forum**: https://community.grafana.com/

---

## Quick Checklist

Before submitting, verify:
- [ ] Plugin builds successfully (`npm run build`)
- [ ] Plugin is signed with valid token (`npm run sign`)
- [ ] MANIFEST.txt exists in dist/
- [ ] GitHub repository is public
- [ ] GitHub release is created with zip file
- [ ] plugin.json has description, keywords, links
- [ ] Screenshots added (optional but recommended)
- [ ] README.md is updated with usage instructions
- [ ] All tests pass (`npm run test:ci`)
- [ ] Have zip URL, checksum, and source URL ready

Good luck with your submission! 🚀

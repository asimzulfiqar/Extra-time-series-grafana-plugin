# Install Node.js 22 on Debian

This plugin requires Node.js 22 or 24. Node.js 18 can fail during the build with:

```text
ReferenceError: crypto is not defined
```

The following installation uses the official Node.js binary archive and does not require `nvm`.

## Check the CPU architecture

```bash
uname -m
```

Use:

- `linux-x64` when the output is `x86_64`
- `linux-arm64` when the output is `aarch64`

## Install Node.js 22 on x64

```bash
cd /tmp
curl -fsSLO https://nodejs.org/download/release/latest-v22.x/node-v22.22.3-linux-x64.tar.xz
curl -fsSLO https://nodejs.org/download/release/latest-v22.x/SHASUMS256.txt

grep "node-v22.22.3-linux-x64.tar.xz" SHASUMS256.txt | sha256sum -c -

sudo mkdir -p /opt/nodejs
sudo tar -xJf node-v22.22.3-linux-x64.tar.xz -C /opt/nodejs
sudo ln -sfn /opt/nodejs/node-v22.22.3-linux-x64 /opt/nodejs/current

sudo ln -sfn /opt/nodejs/current/bin/node /usr/local/bin/node
sudo ln -sfn /opt/nodejs/current/bin/npm /usr/local/bin/npm
sudo ln -sfn /opt/nodejs/current/bin/npx /usr/local/bin/npx

hash -r
node --version
npm --version
```

Expected Node.js version:

```text
v22.22.3
```

## Install Node.js 22 on ARM64

For an ARM64 server, use the same commands but replace every `linux-x64` occurrence with `linux-arm64`.

## Rebuild the plugin

```bash
cd /path/to/Extra-time-series-grafana-plugin
rm -rf node_modules
npm ci
npm run build
```

## Troubleshooting

If `node --version` still prints an older version:

```bash
which -a node
echo "$PATH"
```

Ensure `/usr/local/bin` appears before `/usr/bin` in `PATH`.

Official downloads: <https://nodejs.org/download/release/latest-v22.x/>

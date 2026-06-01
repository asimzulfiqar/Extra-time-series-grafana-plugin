const major = Number(process.versions.node.split('.')[0]);

if (major < 22 || major > 24) {
  console.error(`Unsupported Node.js version: ${process.version}. Use Node.js 22 or 24.`);
  process.exit(1);
}

if (typeof globalThis.crypto === 'undefined') {
  console.error('globalThis.crypto is unavailable. Install a standard Node.js 22 or 24 build.');
  process.exit(1);
}

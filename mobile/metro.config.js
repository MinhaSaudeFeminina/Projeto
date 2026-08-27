const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite ships a WebAssembly build for the web target.
config.resolver.assetExts.push('wasm');

// The COOP/COEP headers that expo-sqlite also needs on the web are added by
// scripts/web-dev-server.mjs, not here: Expo runs `server.enhanceMiddleware`
// after its own middleware stack, so it never reaches the HTML document.
// A deployed web build needs those headers configured on the host instead.

module.exports = config;

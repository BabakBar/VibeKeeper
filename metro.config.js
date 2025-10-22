const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable unstable_enablePackageExports to avoid import.meta issues with zustand
// This forces Metro to use CommonJS builds instead of ESM builds
// See: https://github.com/expo/expo/issues/36384
config.resolver.unstable_enablePackageExports = false;

module.exports = config;

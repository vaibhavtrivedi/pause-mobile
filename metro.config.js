const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Diagnostic: disable Metro worker threads
config.transformer.unstable_workerThreads = false;

module.exports = config;
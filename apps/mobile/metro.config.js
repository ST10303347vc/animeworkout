const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the monorepo root (2 levels up from apps/mobile)
const monorepoRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(__dirname);

// 1. Watch all files in the monorepo (not just apps/mobile)
config.watchFolders = [monorepoRoot];

// 2. Tell Metro where to find node_modules.
//    In npm workspaces, deps are hoisted to monorepo root node_modules.
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, 'node_modules'),      // local (if any non-hoisted deps)
    path.resolve(monorepoRoot, 'node_modules'),    // hoisted root
];

// 3. Resolve @limit-break/core from source (no build step needed)
config.resolver.extraNodeModules = {
    '@limit-break/core': path.resolve(monorepoRoot, 'packages/core/src'),
};

// 4. CRITICAL: Prevent duplicate React copies in monorepo.
//    Force Metro to always resolve 'react' and 'react-native' from the
//    mobile app's own dependencies, not from the web app's or any hoisted copy.
const mobileNodeModules = path.resolve(__dirname, 'node_modules');
const rootNodeModules = path.resolve(monorepoRoot, 'node_modules');

// These modules MUST only have ONE copy — resolve from the closest available
const singularModules = ['react', 'react-native', 'react-dom'];

// Build a map of module -> absolute path
const resolvedModules = {};
for (const mod of singularModules) {
    // Prefer mobile's local node_modules, fallback to root hoisted
    try {
        resolvedModules[mod] = path.dirname(
            require.resolve(`${mod}/package.json`, { paths: [mobileNodeModules, rootNodeModules] })
        );
    } catch {
        // Module not found — skip
    }
}

// Merge into extraNodeModules
Object.assign(config.resolver.extraNodeModules, resolvedModules);

// 5. Block Metro from resolving packages from the web app's node_modules
config.resolver.blockList = [
    /apps\/web\/.*/,
];

module.exports = config;

module.exports = ({ config }) => {
    // Read the environment variable, defaulting to 'app-tasks'
    const appTarget = process.env.EXPO_APP_TARGET || 'app-tasks';

    // Tell Expo Router which folder to use as the root
    process.env.EXPO_ROUTER_APP_ROOT = `./${appTarget}`;

    // Configure app metadata dynamically based on the target mode
    let appName = "Anime Workout";
    let bundleIdentifier = "com.limitbreak.app";

    if (appTarget === 'app-tasks') {
        appName = "Limit Break Tasks";
        bundleIdentifier = "com.limitbreak.tasks";
    } else if (appTarget === 'app-challenge') {
        appName = "15-Day Challenge";
        bundleIdentifier = "com.limitbreak.challenge";
    }

    return {
        ...config,
        name: appName,
        slug: "limit-break",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/images/icon.png",
        scheme: "limitbreak",
        userInterfaceStyle: "dark",
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: bundleIdentifier
        },
        android: {
            adaptiveIcon: {
                backgroundColor: "#0a0a14",
                foregroundImage: "./assets/images/android-icon-foreground.png",
                backgroundImage: "./assets/images/android-icon-background.png",
                monochromeImage: "./assets/images/android-icon-monochrome.png"
            },
            edgeToEdgeEnabled: true,
            package: bundleIdentifier
        },
        web: {
            output: "static",
            favicon: "./assets/images/favicon.png"
        },
        plugins: [
            [
                "expo-router",
                {
                    root: `./${appTarget}`
                }
            ],
            "expo-sqlite",
            [
                "expo-splash-screen",
                {
                    image: "./assets/images/splash-icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#0a0a14",
                    dark: {
                        backgroundColor: "#0a0a14"
                    }
                }
            ]
        ],
        experiments: {
            typedRoutes: false // Disable typed routes to prevent TS errors when swapping targets
        }
    };
};

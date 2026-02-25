# 🤖 Xander Volt AI Agent Directive

Welcome. You are entering this codebase to exclusively build out the **Xander Volt** game mode (the full Anime RPG experience) for the Limit Break app.

## Project Architecture & Option 1 Guidelines 
This monorepo has been specifically architects into 3 separate Mobile Apps to keep the bundles lightweight. Inside the `apps/mobile/` package, you will see multiple root directories:
- 🚫 `app-tasks/` -> **DO NOT TOUCH.** This is the completed V1 pure-productivity app.
- 🚫 `app-locked/` -> **DO NOT TOUCH.** This is for future top secret experimental modes.
- ✅ `app-xander/` -> **YOUR EXCLUSIVE WORKSPACE.** 

### `app.config.js` & Expo Routing
The `app.config.js` is set up to read the `EXPO_APP_TARGET` environment variable. By default, running `npx expo start` builds the *tasks* application.

**To run the EXPO Dev Server for Xander:**
You MUST pass the target environment variable. When you need to restart or start the Expo server for your work, you must use:
```bash
# Set the target to your directory
$env:EXPO_APP_TARGET="app-xander"

# Run Expo (with --clear if you've recently swapped targets to avoid cache pollution)
npx expo start --clear
```
*(Note: If you encounter routing errors from Expo Router stating no `_layout.tsx` was found, ensure your server was started using the above env variable!)*

## Shared Resources (`packages/core` & components)
While your routes and screens belong strictly inside `apps/mobile/app-xander`, you **CAN AND SHOULD** utilize shared components from `apps/mobile/components/` and shared types/data from `packages/core`. 

If you build a highly generic new component (like an anime-themed button) that isn't tightly coupled to the RPG logic, place it in `apps/mobile/components/` so we can use it across the apps.

## Primary Objective
The user wants you to completely build out the Xander Volt game mode logic and screens. This mode is the full MMORPG experience:
- It uses the Physical, Mental, Wealth, and Vitality Pillars.
- It will feature game mechanics like an "Elite Foe" encounter.
- Start by scaffolding out the `_layout.tsx` and `index.tsx` files inside `app-xander/` so the app has a valid route entry. Then verify Expo boots properly. Good luck!

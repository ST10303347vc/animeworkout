import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function init() {
    try {
        console.log("Authenticating as superuser...");
        await pb.collection('_superusers').authWithPassword('admin@example.com', 'admin12345');

        console.log("Creating Custom Tasks collection...");
        try {
            await pb.collections.create({
                name: "custom_tasks",
                type: "base",
                system: false,
                listRule: "@request.auth.id != ''",
                viewRule: "@request.auth.id != ''",
                createRule: "@request.auth.id != ''",
                updateRule: "@request.auth.id != ''",
                deleteRule: "@request.auth.id != ''",
                schema: [
                    { name: "user", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", cascadeDelete: true, maxSelect: 1 } },
                    { name: "title", type: "text", required: true },
                    { name: "pillar", type: "text", required: true },
                    { name: "difficulty", type: "number", required: true },
                    { name: "xpReward", type: "number", required: true },
                    { name: "status", type: "text", required: true },
                    { name: "completedAt", type: "date" }
                ]
            });
            console.log("✅ custom_tasks created!");
        } catch (e: any) { console.log(JSON.stringify(e?.response, null, 2) || e.message); }

        console.log("Creating Daily Habits collection...");
        try {
            await pb.collections.create({
                name: "daily_habits",
                type: "base",
                system: false,
                listRule: "@request.auth.id != ''",
                viewRule: "@request.auth.id != ''",
                createRule: "@request.auth.id != ''",
                updateRule: "@request.auth.id != ''",
                deleteRule: "@request.auth.id != ''",
                schema: [
                    { name: "user", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", cascadeDelete: true, maxSelect: 1 } },
                    { name: "title", type: "text", required: true },
                    { name: "pillar", type: "text", required: true },
                    { name: "difficulty", type: "number", required: true },
                    { name: "xpReward", type: "number", required: true },
                    { name: "lastCompletedDate", type: "text" }
                ]
            });
            console.log("✅ daily_habits created!");
        } catch (e: any) { console.log(e?.response?.message || "Already exists"); }

        console.log("Done initializing PocketBase.");
    } catch (e) {
        console.error(e);
    }
}

init();

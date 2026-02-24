import PocketBase from 'pocketbase';

export const pb = new PocketBase((import.meta as any).env?.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// Optional helper to check connection
export const checkPocketBaseConnection = async () => {
    try {
        await pb.health.check();
        console.log("PocketBase connected successfully.");
        return true;
    } catch (e) {
        console.error("PocketBase connection failed.", e);
        return false;
    }
};

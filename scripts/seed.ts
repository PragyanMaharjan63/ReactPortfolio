import { openProjectStore } from "../src/lib/storage";

const store = await openProjectStore();
await store.seed();
console.log(`Seeded ${(await store.list()).length} projects in ${store.storage === "turso" ? "hosted SQLite" : process.env.DATABASE_PATH ?? "./data/portfolio.sqlite"}`);

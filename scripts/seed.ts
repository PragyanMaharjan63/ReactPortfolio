import { openDatabase, readProjects, seedProjects } from "../src/lib/database";

const db = openDatabase();
try {
  seedProjects(db);
  console.log(`SQLite ready: ${readProjects(db).length} projects in ${process.env.DATABASE_PATH ?? "./data/portfolio.sqlite"}`);
} finally {
  db.close();
}

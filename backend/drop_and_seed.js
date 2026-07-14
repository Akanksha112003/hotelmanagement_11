import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./src/config/db.js";
import { seedDatabase } from "./src/utils/seedDatabase.js";

async function run() {
  await connectDB();
  console.log("Dropping existing collections...");
  const collections = Object.keys(mongoose.connection.collections);
  for (const collectionName of collections) {
    try {
      await mongoose.connection.collections[collectionName].drop();
      console.log(`Dropped ${collectionName}`);
    } catch (e) {
      if (e.code === 26) {
        console.log(`Collection ${collectionName} does not exist`);
      } else {
        console.error(e);
      }
    }
  }
  console.log("Running seed script...");
  await seedDatabase();
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);

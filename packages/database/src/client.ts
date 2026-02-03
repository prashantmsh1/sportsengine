import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from the database package directory
config({ path: resolve(__dirname, "../.env") });

const queryClient = postgres(process.env.DATABASE_URL!);
export const db = drizzle(queryClient, { schema });

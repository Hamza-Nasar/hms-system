    import { defineConfig } from "prisma/config";
    import { config } from "dotenv"; // Import dotenv

    config(); // Load .env before defining the config

    export default defineConfig({
      schema: "prisma/schema.prisma",
      migrations: {
        path: "prisma/migrations",
      },
      engine: "classic",
      datasource: {
        url: process.env.DATABASE_URL || "", // Access the environment variable
      },
    });
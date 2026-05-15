import "reflect-metadata";
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { DataSource } from "typeorm";
import swaggerUi from "swagger-ui-express";
import { specs } from "./server/swagger-config";
import { User, UserRole } from "./server/entities/User";
import { Story } from "./server/entities/Story";
import { Comment } from "./server/entities/Comment";
import { Vote } from "./server/entities/Vote";
import { Category } from "./server/entities/Category";
import { authRouter } from "./server/modules/auth";
import { userRouter } from "./server/modules/user";
import { storyRouter } from "./server/modules/story";
import { categoryRouter } from "./server/modules/category";
import { adminRouter } from "./server/modules/admin";

// Database Initialization
export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [User, Story, Comment, Vote, Category],
  migrations: [],
  subscribers: [],
});

async function startServer() {
  await AppDataSource.initialize().then(async () => {
    console.log("Data Source has been initialized!");
    // Seed Categories
    const categoryRepo = AppDataSource.getRepository(Category);
    const count = await categoryRepo.count();
    if (count === 0) {
      const categories = ["Life Stories", "Technology", "Advice", "Humor", "Mystery", "Personal Growth"];
      for (const name of categories) {
        await categoryRepo.save(categoryRepo.create({ name }));
      }
      console.log("Categories seeded!");

      // Seed Dummy Stories
      const userRepo = AppDataSource.getRepository(User);
      const storyRepo = AppDataSource.getRepository(Story);
      
      const admin = userRepo.create({
        name: "Genesis Admin",
        email: "admin@echo.com",
        password: "$2a$10$76gXFp7Bf5K6.a6u6I6T8.O3Zp9rG6y8f9pGz5p7v6v6v6v6v6v6v", // "password"
        role: UserRole.SYSTEM_MARSHAL
      });
      await userRepo.save(admin);

      const lifeStoryCat = await categoryRepo.findOne({ where: { name: "Life Stories" } });
      if (lifeStoryCat) {
        await storyRepo.save(storyRepo.create({
          title: "The Architecture of Silence",
          content: "In the heart of the city, there is a library that nobody visits. It contains the stories of people who were forgotten by time. I spent three years cataloging the whispers in the hallways...",
          user: admin,
          category: lifeStoryCat,
          image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
        }));
      }
    }
  }).catch((err) => {
    console.error("Error during Data Source initialization", err);
  });

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/stories", storyRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/admin", adminRouter);

  // Swagger Documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  app.get("/api", (req, res) => res.redirect("/api-docs"));

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  });
}

startServer();

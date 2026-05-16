import { Router } from "express";
import { AppDataSource } from "../../server";
import { Category } from "../entities/Category";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../entities/User";

export const categoryRouter = Router();

categoryRouter.get("/", async (req, res) => {
  try {
    const categoryRepo = AppDataSource.getRepository(Category);
    const categories = await categoryRepo.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

categoryRouter.post("/", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const { name } = req.body;
    const categoryRepo = AppDataSource.getRepository(Category);
    const category = categoryRepo.create({ name });
    await categoryRepo.save(category);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

categoryRouter.delete("/:id", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const categoryRepo = AppDataSource.getRepository(Category);
    await categoryRepo.delete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

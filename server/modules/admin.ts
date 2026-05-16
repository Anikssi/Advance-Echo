import { Router } from "express";
import { AppDataSource } from "../../server";
import { User, UserRole } from "../entities/User";
import { Story } from "../entities/Story";
import { Category } from "../entities/Category";
import { Comment } from "../entities/Comment";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

export const adminRouter = Router();

adminRouter.get("/stats", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const storyRepo = AppDataSource.getRepository(Story);
    const categoryRepo = AppDataSource.getRepository(Category);

    const totalUsers = await userRepo.count();
    const totalStories = await storyRepo.count();
    const totalCategories = await categoryRepo.count();

    res.json({ totalUsers, totalStories, totalCategories });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

adminRouter.get("/users", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({ order: { createdAt: "DESC" } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

adminRouter.put("/users/:id/ban", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !user.isBanned;
    await userRepo.save(user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

adminRouter.delete("/comments/:id", authenticate, authorize([UserRole.SYSTEM_MARSHAL]), async (req, res) => {
  try {
    const commentRepo = AppDataSource.getRepository(Comment);
    await commentRepo.delete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

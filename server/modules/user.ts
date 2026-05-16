import { Router } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../../server";
import { User } from "../entities/User";
import { authenticate, AuthRequest } from "../middleware/auth";

export const userRouter = Router();

userRouter.get("/profile/:id", async (req, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["stories", "stories.category"]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Don't send password
    const { password, ...rest } = user;
    res.json(rest);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

userRouter.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, password } = req.body;
    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepo.save(user);
    res.json({ message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

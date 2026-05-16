import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../server";
import { User, UserRole } from "../entities/User";
import { authenticate, AuthRequest } from "../middleware/auth";

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // First user is Admin (Marshal)
    const totalUsers = await userRepository.count();
    const role = totalUsers === 0 ? UserRole.SYSTEM_MARSHAL : UserRole.STORYTELLER;

    const user = userRepository.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    await userRepository.save(user);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: req.user?.id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isBanned: user.isBanned, createdAt: user.createdAt });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

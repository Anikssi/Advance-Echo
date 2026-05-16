import { Router } from "express";
import { AppDataSource } from "../../server";
import { Story } from "../entities/Story";
import { Category } from "../entities/Category";
import { Comment } from "../entities/Comment";
import { Vote, VoteType } from "../entities/Vote";
import { authenticate, AuthRequest } from "../middleware/auth";
import { notifyComment, notifyVote } from "./mail";

export const storyRouter = Router();

// Stories
storyRouter.get("/", async (req, res) => {
  try {
    const { categoryId, search, dateRange } = req.query;
    const storyRepo = AppDataSource.getRepository(Story);
    const query = storyRepo.createQueryBuilder("story")
      .leftJoinAndSelect("story.user", "user")
      .leftJoinAndSelect("story.category", "category")
      .leftJoinAndSelect("story.votes", "votes")
      .leftJoinAndSelect("story.comments", "comments")
      .loadRelationCountAndMap("story.upvotes", "story.votes", "vote", (qb) => qb.where("vote.type = :type", { type: VoteType.UPVOTE }))
      .loadRelationCountAndMap("story.downvotes", "story.votes", "vote", (qb) => qb.where("vote.type = :type", { type: VoteType.DOWNVOTE }))
      .loadRelationCountAndMap("story.commentCount", "story.comments");

    if (categoryId) {
      query.andWhere("story.categoryId = :categoryId", { categoryId });
    }
    if (search) {
      query.andWhere("(story.title LIKE :search OR story.content LIKE :search)", { search: `%${search}%` });
    }
    if (dateRange && dateRange !== "all") {
      const startDate = new Date();
      if (dateRange === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (dateRange === "week") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === "month") {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      query.andWhere("story.createdAt >= :startDate", { startDate });
    }

    const stories = await query.orderBy("story.createdAt", "DESC").getMany();
    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

storyRouter.get("/:id", async (req, res) => {
  try {
    const storyRepo = AppDataSource.getRepository(Story);
    const story = await storyRepo.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ["user", "category", "comments", "comments.user", "votes", "votes.user"]
    });
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

storyRouter.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { title, content, image, categoryId } = req.body;
    const storyRepo = AppDataSource.getRepository(Story);
    const categoryRepo = AppDataSource.getRepository(Category);

    const category = await categoryRepo.findOne({ where: { id: categoryId } });
    if (!category) return res.status(400).json({ message: "Invalid category" });

    const story = storyRepo.create({
      title,
      content,
      image,
      category,
      user: { id: req.user?.id } as any
    });

    await storyRepo.save(story);
    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

storyRouter.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const storyRepo = AppDataSource.getRepository(Story);
    const story = await storyRepo.findOne({ where: { id: parseInt(req.params.id) }, relations: ["user"] });
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.user.id !== req.user?.id) return res.status(403).json({ message: "Unauthorized" });

    const { title, content, image, categoryId } = req.body;
    if (categoryId) {
      const categoryRepo = AppDataSource.getRepository(Category);
      const category = await categoryRepo.findOne({ where: { id: categoryId } });
      if (category) story.category = category;
    }

    story.title = title || story.title;
    story.content = content || story.content;
    story.image = image !== undefined ? image : story.image;

    await storyRepo.save(story);
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

storyRouter.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const storyRepo = AppDataSource.getRepository(Story);
    const story = await storyRepo.findOne({ where: { id: parseInt(req.params.id) }, relations: ["user"] });
    if (!story) return res.status(404).json({ message: "Story not found" });

    if (story.user.id !== req.user?.id && req.user?.role !== "system_marshal") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await storyRepo.remove(story);
    res.json({ message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Comments
storyRouter.post("/:id/comments", authenticate, async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    const storyRepo = AppDataSource.getRepository(Story);
    const commentRepo = AppDataSource.getRepository(Comment);

    const story = await storyRepo.findOne({ where: { id: parseInt(req.params.id) }, relations: ["user"] });
    if (!story) return res.status(404).json({ message: "Story not found" });

    const comment = commentRepo.create({
      content,
      story,
      user: { id: req.user?.id } as any
    });

    await commentRepo.save(comment);

    // Notify story owner
    if (story.user.email) {
      await notifyComment(story.user.email, story.title, req.user?.email || "Someone");
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Votes
storyRouter.post("/:id/vote", authenticate, async (req: AuthRequest, res) => {
  try {
    const { type } = req.body;
    const voteRepo = AppDataSource.getRepository(Vote);
    const storyRepo = AppDataSource.getRepository(Story);
    const userId = req.user?.id!;
    const storyId = parseInt(req.params.id);

    const story = await storyRepo.findOne({ where: { id: storyId }, relations: ["user"] });
    if (!story) return res.status(404).json({ message: "Story not found" });

    let vote = await voteRepo.findOne({ where: { user: { id: userId }, story: { id: storyId } } });

    if (vote) {
      if (vote.type === type) {
        await voteRepo.remove(vote);
        return res.json({ message: "Vote removed" });
      } else {
        vote.type = type;
        await voteRepo.save(vote);
      }
    } else {
      vote = voteRepo.create({ type, user: { id: userId } as any, story: { id: storyId } as any });
      await voteRepo.save(vote);
      
      // Notify owner on upvote
      if (type === VoteType.UPVOTE && story.user.email) {
        await notifyVote(story.user.email, story.title, req.user?.email || "Someone", "UPVOTE");
      }
    }

    res.json({ message: "Voted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
